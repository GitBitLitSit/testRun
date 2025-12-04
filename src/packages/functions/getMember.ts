import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { connectToMongo } from "../../database/mongo";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    const { fullName,  email } = JSON.parse(event.body || "{}");

    if (!fullName || !email) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Full name and email are required" }),
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
};