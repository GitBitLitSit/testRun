import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { connectToMongo } from "../../adapters/database";

export const connect: APIGatewayProxyHandlerV2 = async (event) => {
    const connectionId = event.requestContext.accountId;

    const db = await connectToMongo();
    await db.collection("connections").insertOne({
        connectionId,
        connectedAt: new Date(),
    });

    return { statusCode: 200, body: "Connected" };
}