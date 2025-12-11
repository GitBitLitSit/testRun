import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { connectToMongo } from "../../adapters/database";
import { Member, EmailVerification } from "../../lib/types";
import { sendQrCodeEmail } from "../../adapters/email";


export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    try {
        let { email, verificationCode } = JSON.parse(event.body || "{}");

        const trimmedEmail = email?.trim() ?? "";
        const trimmedVerificationCode = verificationCode?.trim() ?? "";

        if (!trimmedEmail || !trimmedVerificationCode) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Email and confirmation code are required" }),
            };
        }

        const db = await connectToMongo();
        const memberCollection = db.collection<Member>("members");

        const memberRecord = await memberCollection.findOne({ email: trimmedEmail });

        if (!memberRecord) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "Member with this email not found" }),
            }
        }

        const emailVerificationCollection = db.collection<EmailVerification>("emailVerifications");

        const emailVerificationRecord = await emailVerificationCollection.findOne({ memberId: memberRecord._id });

        if (!emailVerificationRecord) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "No verification record found for this member" }),
            }
        } else if (new Date(emailVerificationRecord.expiresAt) < new Date()) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Verification code has expired" }),
            }
        } else if (emailVerificationRecord.verificationCode !== trimmedVerificationCode) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Invalid verification code" }),
            }
        }

        await memberCollection.updateOne(
            { _id: memberRecord._id },
            { $set: { emailValid: true } }
        );

        await emailVerificationCollection.deleteOne({ _id: emailVerificationRecord._id });

        await sendQrCodeEmail(process.env.SES_SENDER_EMAIL!, memberRecord.firstName, memberRecord.lastName, memberRecord.email, memberRecord.qrUuid);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Verification successful. QR code email resent." }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
}