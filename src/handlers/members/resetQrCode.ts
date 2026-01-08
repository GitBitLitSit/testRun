import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { verifyJWT } from "../../lib/jwt";
import { connectToMongo } from "../../adapters/database";
import { Member } from "../../lib/types";
import { ObjectId } from "mongodb";
import { AppError } from "../../lib/appError";
import { errorResponse, messageResponse } from "../../lib/http";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    const token = event.headers.authorization?.split(" ")[1];

    if (!token) {
        return errorResponse(event, 401, "NO_TOKEN_PROVIDED");
    }

    try {
        verifyJWT(token);

        let { id } = JSON.parse(event.body || "{}");
        const trimmedId = id?.trim() ?? "";

        if (!trimmedId) {
            return errorResponse(event, 400, "MEMBER_ID_REQUIRED");
        }

        if (!ObjectId.isValid(trimmedId)) {
             return errorResponse(event, 400, "INVALID_MEMBER_ID_FORMAT");
        }

        const db = await connectToMongo();
        const membersCollection = db.collection<Member>("members");

        const newQrUuid = crypto.randomUUID();

        const result = await membersCollection.updateOne(
            { _id: ObjectId.createFromHexString(trimmedId) as any },
            { $set: { qrUuid: newQrUuid } }
        )

        if (result.matchedCount === 0) {
            return errorResponse(event, 404, "MEMBER_NOT_FOUND");
        }

        return messageResponse(event, 200, "QR_CODE_RESET_SUCCESS", undefined, {
            success: true,
            qrUuid: newQrUuid
        });

    } catch (error) {
        console.error("Reset QR Error:", error);
        if (error instanceof AppError && error.code === "INVALID_TOKEN") {
            return errorResponse(event, 401, "INVALID_TOKEN");
        }
        return errorResponse(event, 500, "INTERNAL_SERVER_ERROR");
    }
}