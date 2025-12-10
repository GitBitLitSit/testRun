import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { connectToMongo } from "../../database/mongo";
import { verifyJWT } from "../../security/jwt";
import type { Member } from "../types/member";
import { sendQrCodeEmail } from "./sendEmail";
import { MongoServerError } from "mongodb";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    const token = event.headers.authorization?.split(" ")[1];
    if(!token) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: "Unauthorized: No token provided" }),
        };
    }

    try {
        verifyJWT(token);

        let { firstName, lastName, email } = JSON.parse(event.body || "{}");
        const trimmedFirstName = firstName?.trim() ?? "";
        const trimmedLastName = lastName?.trim() ?? "";
        const trimmedEmail = email?.trim() ?? "";

        if (!trimmedFirstName || !trimmedLastName || !trimmedEmail) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "first name , last name, and email are required" }),
            };
        } else if (trimmedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) === null) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Invalid email format" }),
            };
        }

        const db = await connectToMongo();
        const collection = db.collection("members");

        const qrUuid = crypto.randomUUID();
        const newMember: Member = {
            firstName: trimmedFirstName,
            lastName: trimmedLastName,
            email: trimmedEmail,
            createdAt: new Date(),
            blocked: false,
            qrUuid: qrUuid,
            emailValid: false,
        }

        const result = await collection.insertOne(newMember);

        const { success, error } = await sendQrCodeEmail(process.env.SES_SENDER_EMAIL!, trimmedFirstName, trimmedLastName, trimmedEmail, qrUuid);

        if (success) {
            await collection.updateOne(
                { _id: result.insertedId },
                { $set: { emailValid: true } }
            );

            return {
                statusCode: 201,
                body: JSON.stringify({ message: "Member created and email sent", memberId: result.insertedId }),
            };
        } else {
            return {
                statusCode: 201,
                body: JSON.stringify({ message: "Member created but failed to send email", details: error, memberId: result.insertedId }),
            };
        }
    } catch (error) {
        // Email already exists
        if (error instanceof MongoServerError && error.code === 11000) {
            return {
                statusCode: 409,
                body: JSON.stringify({ error: "Member with this email already exists" }),
            };
        }

        // JWT verification error
        if (error instanceof Error && error.message.includes("JWT")) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: "Unauthorized: Invalid token" })
            };
        }

        // Generic error
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
        }
    }
}