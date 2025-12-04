import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { connectToMongo } from "../../database/mongo";
import { verifyJWT } from "../../security/jwt";
import type { Member } from "../types/member";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    const token = event.headers.authorization?.split(" ")[1];

    if(!token) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: "Unauthorized: No token provided" }),
        };
    }

    try {
        const decoded = verifyJWT(token);

        let { fullName,  email } = JSON.parse(event.body || "{}");
        const trimmedFullName = fullName?.trim() ?? "";
        const trimmedEmail = email?.trim() ?? "";

        if (!trimmedFullName || !trimmedEmail) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Full name and email are required" }),
            };
        } else if (trimmedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) === null) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Invalid email format" }),
            };
        }

        // Connect to MongoDB
        const db = await connectToMongo();
        const collection = db.collection("members");

        collection.findOne({ email: trimmedEmail }).then((existingMember) => {
            return {
                statusCode: 409,
                body: JSON.stringify({ error: "Member with this email already exists" }),
            }
        });

        const newMember: Member = {
            fullName: trimmedFullName,
            email: trimmedEmail,
            createdAt: new Date(),
            active: true,
            qrUuid: crypto.randomUUID(),
        }

        const result = await collection.insertOne(newMember);

        return {
            statusCode: 201,
            body: JSON.stringify({ message: "Member created", memberId: result.insertedId }),
        };
    } catch (error) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
        };
    }
};