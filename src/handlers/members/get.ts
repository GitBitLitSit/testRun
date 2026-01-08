import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { verifyJWT } from "../../lib/jwt";
import { connectToMongo } from "../../adapters/database";
import { Member } from "../../lib/types";
import { AppError } from "../../lib/appError";
import { errorResponse } from "../../lib/http";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    const token = event.headers.authorization?.split(" ")[1];

    if (!token) {
        return errorResponse(event, 401, "NO_TOKEN_PROVIDED");
    }

    try {
        verifyJWT(token);

        const queryParams = event.queryStringParameters || {};

        const search = queryParams.search?.trim() || "";
        const page = parseInt(queryParams.page || "1");
        const limit = parseInt(queryParams.limit || "20");
        const showBlockedOnly = queryParams.blocked === "true";

        const db = await connectToMongo();
        const collection = db.collection<Member>("members");

        let dbQuery: any = {};

        // Filter by text search
        if (search) {
            const regex = new RegExp(search, "i"); // i case-insensitive
            dbQuery.$or = [
                { firstName: regex },
                { lastName: regex },
                { email: regex },
            ];
        }

        // Filter by blocked status
        if (showBlockedOnly) {
            dbQuery.blocked = true;
        }

        const skip = (page - 1) * limit;

        const [members, total] = await Promise.all([
            collection.find(dbQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
            collection.countDocuments(dbQuery),
        ]);

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                data: members,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                }
            }),
        };
    } catch (error) {
        if (error instanceof AppError && error.code === "INVALID_TOKEN") {
            return errorResponse(event, 401, "INVALID_TOKEN");
        }
        return errorResponse(event, 500, "INTERNAL_SERVER_ERROR");
    }
}