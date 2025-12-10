import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { connectToMongo } from "../../database/mongo";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    let { email, confirmationCode } = JSON.parse(event.body || "{}");

    const trimmedEmail = email?.trim() ?? "";

    if (!trimmedEmail || !confirmationCode) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Email and confirmation code are required" }),
        };
    }

    const db = await connectToMongo();
    const collection = db.collection("emailVerifications");
    const record = await collection.findOne({ email: trimmedEmail, code: confirmationCode });

}