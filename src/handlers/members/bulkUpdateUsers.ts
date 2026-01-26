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
    const ops = [];
    let invalid = 0;

    for (const user of rawUsers as IncomingUser[]) {
      const firstName = String(user?.firstName ?? "").trim();
      const lastName = String(user?.lastName ?? "").trim();
      const email = String(user?.email ?? "").trim().toLowerCase();

      if (!firstName || !lastName || !email || emailPattern.test(email) === false) {
        invalid += 1;
        continue;
      }

      ops.push({
        updateOne: {
          filter: { email },
          update: { $set: { firstName, lastName } },
        },
      });
    }

    if (ops.length === 0) {
      return json(200, { matched: 0, modified: 0, invalid });
    }

    await connectToMongoose();
    const result = await MemberModel.bulkWrite(ops, { ordered: false });

    return json(200, {
      matched: result.matchedCount ?? 0,
      modified: result.modifiedCount ?? 0,
      invalid,
    });
  } catch (error) {
    if (error instanceof AppError && error.code === "INVALID_TOKEN") {
      return errorResponse(event, 401, "INVALID_TOKEN");
    }
    return errorResponse(event, 500, "INTERNAL_SERVER_ERROR");
  }
};
