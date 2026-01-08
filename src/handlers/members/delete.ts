import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { verifyJWT } from "../../lib/jwt";
import { connectToMongo } from "../../adapters/database";
import { Member } from "../../lib/types";
import { ObjectId } from "mongodb";
import { AppError } from "../../lib/appError";
import { errorResponse, json } from "../../lib/http";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    const token = event.headers.authorization?.split(" ")[1];

    if (!token) {
        return errorResponse(event, 401, "NO_TOKEN_PROVIDED");
    }

    try {
        verifyJWT(token);
        
        const id = event.pathParameters?.id;

        if (!id) {
            return errorResponse(event, 400, "MEMBER_ID_REQUIRED_IN_PATH");
        }

        const db = await connectToMongo();
        const collection = db.collection<Member>("members");

        const result = await collection.deleteOne({ _id: new ObjectId(id) as any });

        if (result.deletedCount === 0) {
            return errorResponse(event, 404, "MEMBER_NOT_FOUND");
        }

        return json(200, { success: true });
    } catch (error) {
        if (error instanceof AppError && error.code === "INVALID_TOKEN") {
            return errorResponse(event, 401, "INVALID_TOKEN");
        }

        // Generic error
        return errorResponse(event, 500, "INTERNAL_SERVER_ERROR");
    }
}