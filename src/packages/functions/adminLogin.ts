import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { generateJWT } from "../../security/jwt";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    const { username, password } = JSON.parse(event.body || "{}");

    if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: "Unauthorized: Invalid credentials" }),
        };
    };

    const token = generateJWT(username);

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Login successful", token }),
    }
};