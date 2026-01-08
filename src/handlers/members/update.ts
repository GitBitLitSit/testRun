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

        const { firstName, lastName, email, blocked } = JSON.parse(event.body || "{}");

        const db = await connectToMongo();
        const collection = db.collection<Member>("members");

        const member = await collection.findOne({ _id: new ObjectId(id) as any });

        if (!member) {
            return errorResponse(event, 404, "MEMBER_NOT_FOUND");
        }

        const updateFields: Partial<Member> = {};

        if (email) {
            const trimmedEmail = email.trim().toLowerCase();

            if (trimmedEmail !== member.email) {
                const emailConflict = await collection.findOne({ email: trimmedEmail });
                if (emailConflict) {
                    return errorResponse(event, 409, "MEMBER_EMAIL_EXISTS");
                }

                updateFields.email = trimmedEmail;
            }
        }

        if (firstName && firstName.trim()) {
            updateFields.firstName = firstName.trim();
        }

        if (lastName && lastName.trim()) {
            updateFields.lastName = lastName.trim();
        }

        if (typeof blocked === "boolean") {
            updateFields.blocked = blocked;
        }

        if (Object.keys(updateFields).length > 0) {
            await collection.updateOne({ _id: new ObjectId(id) as any }, { $set: updateFields });

            const updatedMember = { ...member, ...updateFields };
            return json(200, { success: true, member: updatedMember });
        }

        return json(200, { success: true, member });
    } catch (error) {
        if (error instanceof AppError && error.code === "INVALID_TOKEN") {
            return errorResponse(event, 401, "INVALID_TOKEN");
        }

        return errorResponse(event, 500, "INTERNAL_SERVER_ERROR");
    }
}