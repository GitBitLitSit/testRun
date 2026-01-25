import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { connectToMongo } from "../../adapters/database";
import { sendQrCodeEmail } from "../../adapters/email";
import { verifyJWT } from "../../lib/jwt";
import { AppError } from "../../lib/appError";
import { errorResponse, json } from "../../lib/http";
import { Member } from "../../lib/types";

type ImportMemberRow = {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  blocked?: unknown;
  emailValid?: unknown;
  createdAt?: unknown;
  sendEmail?: unknown;
};

function parseBooleanLoose(v: unknown): boolean | undefined {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1 ? true : v === 0 ? false : undefined;
  if (typeof v !== "string") return undefined;
  const s = v.trim().toLowerCase();
  if (!s) return undefined;
  if (["true", "1", "yes", "y"].includes(s)) return true;
  if (["false", "0", "no", "n"].includes(s)) return false;
  return undefined;
}

function parseDateLoose(v: unknown): Date | undefined {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v;
  if (typeof v === "number") {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d;
    return undefined;
  }
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  if (!s) return undefined;
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d;
  return undefined;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const MAX_MEMBERS = 5000;

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const token = event.headers.authorization?.split(" ")[1];
  if (!token) return errorResponse(event, 401, "NO_TOKEN_PROVIDED");

  try {
    verifyJWT(token);

    const parsed = JSON.parse(event.body || "{}");
    const rows = (parsed?.members ?? parsed) as unknown;
    if (!Array.isArray(rows)) {
      return errorResponse(event, 400, "IMPORT_BATCH_REQUIRED");
    }

    // Keep each request safely under Lambda/API limits.
    if (rows.length > MAX_MEMBERS) {
      return errorResponse(event, 400, "IMPORT_BATCH_TOO_LARGE", { max: MAX_MEMBERS });
    }

    const db = await connectToMongo();
    const collection = db.collection<Member>("members");

    let invalid = 0;
    let accepted = 0;
    let duplicateInBatch = 0;
    const ops: any[] = [];
    const docs: Member[] = [];
    const sendEmailFlags: boolean[] = [];
    const seenEmails = new Set<string>();

    for (const r of rows as ImportMemberRow[]) {
      const firstName = String(r?.firstName ?? "").trim();
      const lastName = String(r?.lastName ?? "").trim();
      const email = String(r?.email ?? "").trim().toLowerCase();

      if (!firstName || !lastName || !email) {
        invalid++;
        continue;
      }
      if (email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) === null) {
        invalid++;
        continue;
      }

      if (seenEmails.has(email)) {
        duplicateInBatch++;
        continue;
      }
      seenEmails.add(email);

      const blocked = parseBooleanLoose(r?.blocked) ?? false;
      const sendEmail = parseBooleanLoose(r?.sendEmail) ?? false;
      const emailValid = sendEmail ? false : parseBooleanLoose(r?.emailValid) ?? false;
      const createdAt = parseDateLoose(r?.createdAt) ?? new Date();

      const doc: Member = {
        firstName,
        lastName,
        email,
        createdAt,
        blocked,
        qrUuid: crypto.randomUUID(),
        emailValid,
      };

      // Upsert with $setOnInsert guarantees:
      // - Existing customers are NOT modified
      // - New customers are inserted
      ops.push({
        updateOne: {
          filter: { email },
          update: { $setOnInsert: doc },
          upsert: true,
        },
      });
      docs.push(doc);
      sendEmailFlags.push(sendEmail);
      accepted++;
    }

    if (ops.length === 0) {
      return json(200, {
        success: true,
        inserted: 0,
        accepted,
        invalid,
        duplicateInBatch,
        skippedExisting: accepted,
        emailRequested: 0,
        emailSent: 0,
        emailFailed: 0,
      });
    }

    const result = await collection.bulkWrite(ops, { ordered: false });
    const inserted = result.upsertedCount ?? 0;
    const upsertedIds = result.upsertedIds ?? [];
    const insertedIndexes = Array.isArray(upsertedIds)
      ? upsertedIds.map((entry: any) => Number(entry?.index)).filter((idx) => !Number.isNaN(idx))
      : Object.keys(upsertedIds).map((key) => Number(key));

    const docsToEmail: Member[] = [];
    for (const idx of insertedIndexes) {
      if (sendEmailFlags[idx]) {
        docsToEmail.push(docs[idx]);
      }
    }

    let emailSent = 0;
    let emailFailed = 0;
    const successEmails: string[] = [];
    const sender = process.env.SES_SENDER_EMAIL;

    if (docsToEmail.length > 0 && sender) {
      const batchSize = 5;
      for (let i = 0; i < docsToEmail.length; i += batchSize) {
        const batch = docsToEmail.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map((doc) => sendQrCodeEmail(sender, doc.firstName, doc.lastName, doc.email, doc.qrUuid)),
        );
        results.forEach((res, index) => {
          if (res.success) {
            emailSent++;
            successEmails.push(batch[index].email);
          } else {
            emailFailed++;
          }
        });
      }
    } else if (docsToEmail.length > 0) {
      emailFailed = docsToEmail.length;
    }

    if (successEmails.length > 0) {
      for (const emailChunk of chunk(successEmails, 500)) {
        await collection.updateMany({ email: { $in: emailChunk } } as any, { $set: { emailValid: true } });
      }
    }

    return json(200, {
      success: true,
      inserted,
      accepted,
      invalid,
      duplicateInBatch,
      skippedExisting: Math.max(0, accepted - inserted),
      emailRequested: docsToEmail.length,
      emailSent,
      emailFailed,
    });
  } catch (error) {
    if (error instanceof AppError && error.code === "INVALID_TOKEN") {
      return errorResponse(event, 401, "INVALID_TOKEN");
    }
    return errorResponse(event, 500, "INTERNAL_SERVER_ERROR");
  }
};

