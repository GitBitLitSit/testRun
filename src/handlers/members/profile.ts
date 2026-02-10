import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { ObjectId } from "mongodb";
import { connectToMongo } from "../../adapters/database";
import { Member } from "../../lib/types";
import { AppError } from "../../lib/appError";
import { errorResponse, json } from "../../lib/http";
import { verifyMemberSessionToken } from "../../lib/memberSession";

function getBearerToken(authorizationHeader?: string): string | null {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const token = getBearerToken(event.headers.authorization);
  if (!token) {
    return errorResponse(event, 401, "NO_TOKEN_PROVIDED");
  }

  try {
    const session = verifyMemberSessionToken(token);

    if (!ObjectId.isValid(session.sub)) {
      return errorResponse(event, 401, "INVALID_TOKEN");
    }

    const db = await connectToMongo();
    const memberCollection = db.collection<Member>("members");
    const member = await memberCollection.findOne({
      _id: ObjectId.createFromHexString(session.sub) as any,
      email: session.email.trim().toLowerCase(),
    });

    if (!member) {
      return errorResponse(event, 404, "MEMBER_NOT_FOUND");
    }

    return json(200, { success: true, data: member });
  } catch (error) {
    if (error instanceof AppError && error.code === "INVALID_TOKEN") {
      return errorResponse(event, 401, "INVALID_TOKEN");
    }
    return errorResponse(event, 500, "INTERNAL_SERVER_ERROR");
  }
};
