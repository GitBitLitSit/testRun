import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { connectToMongo } from "../../database/mongo";
import { verifyJWT } from "../../security/jwt";

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

        const { fullName,  email } = JSON.parse(event.body || "{}");

        if (!fullName.trim() || !email.trim()) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Full name and email are required" }),
            };
        } else if (email.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(email) === false) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Invalid email format" }),
            };
        }

        // Connect to MongoDB
        const db = await connectToMongo();
        const collection = db.collection("members");

        const newMember: Member = {
            fullName,
            email,
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