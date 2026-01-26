import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { connectToMongoose } from "../../adapters/mongoose";
import { AppError } from "../../lib/appError";
import { errorResponse, json } from "../../lib/http";
import { verifyJWT } from "../../lib/jwt";
import { MemberModel } from "../../models/member";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const token = event.headers.authorization?.split(" ")[1];
  if (!token) {
    return errorResponse(event, 401, "NO_TOKEN_PROVIDED");
  }

  try {
    verifyJWT(token);

    const parsed = JSON.parse(event.body || "{}");
    const rawEmails = Array.isArray(parsed) ? parsed : parsed?.emails;

    if (!Array.isArray(rawEmails)) {
      return errorResponse(event, 400, "EMAILS_REQUIRED");
    }

    const emails = rawEmails
      .map((email) => String(email || "").trim().toLowerCase())
      .filter(Boolean);

    if (emails.length === 0) {
      return json(200, { existingEmails: [] });
    }

    // Use $in to fetch existing emails efficiently.
    await connectToMongoose();
    const existing = await MemberModel.find({ email: { $in: emails } })
      .select("email -_id")
      .lean();

    return json(200, { existingEmails: existing.map((row) => row.email) });
  } catch (error) {
    if (error instanceof AppError && error.code === "INVALID_TOKEN") {
      return errorResponse(event, 401, "INVALID_TOKEN");
    }
    return errorResponse(event, 500, "INTERNAL_SERVER_ERROR");
  }
};
