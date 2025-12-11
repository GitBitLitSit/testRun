import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { connectToMongo } from "../../adapters/database";

export const disconnect: APIGatewayProxyHandlerV2 = async (event) => {
    const connectionId = event.requestContext.accountId;

    const db = await connectToMongo();
    await db.collection("connections").deleteOne({ connectionId });

    return { statusCode: 200, body: "Disconnected" };
}