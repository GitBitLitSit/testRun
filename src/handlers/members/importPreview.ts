import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { connectToMongo } from "../../adapters/database";
import { verifyJWT } from "../../lib/jwt";
import { AppError } from "../../lib/appError";
import { errorResponse, json } from "../../lib/http";
import { Member } from "../../lib/types";
import { parseCsv } from "../../lib/csv";

function normalizeHeader(h: string): string {
  return h.toLowerCase().trim().replace(/[\s_-]+/g, "");
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const token = event.headers.authorization?.split(" ")[1];
  if (!token) {
    return errorResponse(event, 401, "NO_TOKEN_PROVIDED");
  }

  try {
    verifyJWT(token);

    if (!event.body) {
      return errorResponse(event, 400, "CSV_REQUIRED");
    }

    const raw = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
    const rows = parseCsv(raw);
    if (rows.length === 0) {
      return errorResponse(event, 400, "CSV_INVALID");
    }

    const firstRow = rows[0].map((v) => normalizeHeader(String(v)));
    const hasHeader = firstRow.includes("email") || firstRow.includes("e-mail") || firstRow.includes("mail");
    const header = hasHeader
      ? firstRow
      : ["firstname", "lastname", "email", "blocked", "emailvalid", "createdat"];
    const dataRows = hasHeader ? rows.slice(1) : rows;

    const firstNameIdx = header.findIndex((h) => h === "firstname");
    const lastNameIdx = header.findIndex((h) => h === "lastname");
    const emailIdx = header.findIndex((h) => h === "email" || h === "mail" || h === "e-mail");

    if (firstNameIdx < 0 || lastNameIdx < 0 || emailIdx < 0) {
      return errorResponse(event, 400, "CSV_INVALID");
    }

    const candidates: Array<{ firstName: string; lastName: string; email: string }> = [];
    let skippedInvalid = 0;
    let skippedDuplicateInFile = 0;
    const seenEmails = new Set<string>();

    for (const row of dataRows) {
      const firstName = String(row[firstNameIdx] ?? "").trim();
      const lastName = String(row[lastNameIdx] ?? "").trim();
      const emailRaw = String(row[emailIdx] ?? "").trim();
      const email = emailRaw.toLowerCase();

      if (!firstName || !lastName || !email) {
        skippedInvalid++;
        continue;
      }
      if (email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) === null) {
        skippedInvalid++;
        continue;
      }
      if (seenEmails.has(email)) {
        skippedDuplicateInFile++;
        continue;
      }
      seenEmails.add(email);

      candidates.push({ firstName, lastName, email });
    }

    if (candidates.length === 0) {
      return json(200, {
        success: true,
        preview: [],
        skippedExisting: 0,
        skippedInvalid,
        skippedDuplicateInFile,
      });
    }

    const db = await connectToMongo();
    const collection = db.collection<Member>("members");

    const allEmails = candidates.map((c) => c.email);
    const existing = new Set<string>();
    for (const emailChunk of chunk(allEmails, 500)) {
      const found = await collection
        .find({ email: { $in: emailChunk } } as any, { projection: { email: 1 } })
        .collation({ locale: "en", strength: 2 })
        .toArray();
      for (const f of found) {
        if ((f as any)?.email) existing.add(String((f as any).email).toLowerCase());
      }
    }

    const preview = candidates.filter((c) => !existing.has(c.email));
    const skippedExisting = candidates.length - preview.length;

    return json(200, {
      success: true,
      preview,
      skippedExisting,
      skippedInvalid,
      skippedDuplicateInFile,
    });
  } catch (error) {
    if (error instanceof AppError && error.code === "INVALID_TOKEN") {
      return errorResponse(event, 401, "INVALID_TOKEN");
    }
    return errorResponse(event, 500, "INTERNAL_SERVER_ERROR");
  }
};
