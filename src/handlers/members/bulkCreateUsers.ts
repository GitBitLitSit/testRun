import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { connectToMongoose } from "../../adapters/mongoose";
import { AppError } from "../../lib/appError";
import { errorResponse, json } from "../../lib/http";
import { verifyJWT } from "../../lib/jwt";
import { MemberModel } from "../../models/member";

type IncomingUser = {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const token = event.headers.authorization?.split(" ")[1];
  if (!token) {
    return errorResponse(event, 401, "NO_TOKEN_PROVIDED");
  }

  try {
    verifyJWT(token);

    const parsed = JSON.parse(event.body || "{}");
    const rawUsers = Array.isArray(parsed) ? parsed : parsed?.users;

    if (!Array.isArray(rawUsers)) {
      return errorResponse(event, 400, "USERS_REQUIRED");
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const docs = [];
    let invalid = 0;

    // Sanitize and normalize the incoming payload before insertMany.
    for (const user of rawUsers as IncomingUser[]) {
      const firstName = String(user?.firstName ?? "").trim();
      const lastName = String(user?.lastName ?? "").trim();
      const email = String(user?.email ?? "").trim().toLowerCase();

      if (!firstName || !lastName || !email || emailPattern.test(email) === false) {
        invalid += 1;
        continue;
      }

      docs.push({
        firstName,
        lastName,
        email,
        createdAt: new Date(),
        blocked: false,
        emailValid: false,
        qrUuid: crypto.randomUUID(),
      });
    }

    if (docs.length === 0) {
      return json(200, { inserted: 0, invalid });
    }

    await connectToMongoose();

    try {
      const insertedDocs = await MemberModel.insertMany(docs, { ordered: false });
      return json(200, { inserted: insertedDocs.length, invalid });
    } catch (error) {
      const writeErrors = (error as { writeErrors?: Array<{ code?: number }> })?.writeErrors;
      const hasDuplicate =
        (error as { code?: number })?.code === 11000 ||
        (Array.isArray(writeErrors) && writeErrors.some((entry) => entry?.code === 11000));

      if (hasDuplicate) {
        const inserted = Array.isArray((error as { insertedDocs?: unknown[] })?.insertedDocs)
          ? (error as { insertedDocs?: unknown[] }).insertedDocs?.length ?? 0
          : 0;
        const duplicates = writeErrors?.length ?? 0;
        return json(200, { inserted, invalid, duplicates });
      }

      return errorResponse(event, 500, "INTERNAL_SERVER_ERROR");
    }
  } catch (error) {
    if (error instanceof AppError && error.code === "INVALID_TOKEN") {
      return errorResponse(event, 401, "INVALID_TOKEN");
    }
    return errorResponse(event, 500, "INTERNAL_SERVER_ERROR");
  }
};
