import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { connectToMongo } from "../../adapters/database";
import { verifyJWT } from "../../lib/jwt";
import { AppError } from "../../lib/appError";
import { errorResponse, json } from "../../lib/http";
import { Member } from "../../lib/types";

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAILS = 5000;

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const token = event.headers.authorization?.split(" ")[1];
  if (!token) return errorResponse(event, 401, "NO_TOKEN_PROVIDED");

  try {
    verifyJWT(token);

    const parsed = JSON.parse(event.body || "{}");
    const rawEmails = Array.isArray(parsed?.emails)
      ? parsed.emails
      : Array.isArray(parsed?.batches)
        ? parsed.batches.flat()
        : null;

    if (!rawEmails || !Array.isArray(rawEmails)) {
      return errorResponse(event, 400, "IMPORT_BATCH_REQUIRED");
    }

    if (rawEmails.length > MAX_EMAILS) {
      return errorResponse(event, 400, "IMPORT_BATCH_TOO_LARGE", { max: MAX_EMAILS });
    }

    const seen = new Set<string>();
    const emails: string[] = [];
    let invalid = 0;
    let duplicate = 0;

    for (const value of rawEmails) {
      const email = String(value ?? "").trim().toLowerCase();
      if (!email || EMAIL_REGEX.test(email) === false) {
        invalid++;
        continue;
      }
      if (seen.has(email)) {
        duplicate++;
        continue;
      }
      seen.add(email);
      emails.push(email);
    }

    if (emails.length === 0) {
      return json(200, {
        success: true,
        existingEmails: [],
        checked: 0,
        invalid,
        duplicate,
      });
    }

    const db = await connectToMongo();
    const collection = db.collection<Member>("members");
    const existing = new Set<string>();

    for (const emailChunk of chunk(emails, 500)) {
      const found = await collection
        .find({ email: { $in: emailChunk } } as any, { projection: { email: 1 } })
        .collation({ locale: "en", strength: 2 })
        .toArray();
      for (const f of found) {
        if ((f as any)?.email) existing.add(String((f as any).email).toLowerCase());
      }
    }

    return json(200, {
      success: true,
      existingEmails: Array.from(existing),
      checked: emails.length,
      invalid,
      duplicate,
    });
  } catch (error) {
    if (error instanceof AppError && error.code === "INVALID_TOKEN") {
      return errorResponse(event, 401, "INVALID_TOKEN");
    }
    return errorResponse(event, 500, "INTERNAL_SERVER_ERROR");
  }
};
