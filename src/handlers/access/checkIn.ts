import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { connectToMongo } from "../../adapters/database";
import { verifyJWT } from "../../lib/jwt";
import { Member, CheckIn } from "../../lib/types";
import { broadcastToDashboard } from "../../adapters/notification";
import { Collection, ObjectId } from "mongodb";
import { AppError } from "../../lib/appError";
import { errorResponse, messageResponse } from "../../lib/http";

async function recordAndBroadcast(
    checkinsCollection: Collection<CheckIn>,
    now: Date,
    params: {
        memberId: ObjectId | null;
        source: CheckIn["source"];
        warning: string | null;
        qrUuid?: string;
        broadcastMember: Member;
    }
) {
    await checkinsCollection.insertOne({
        memberId: params.memberId as any,
        checkInTime: now,
        source: params.source,
        warning: params.warning,
        qrUuid: params.qrUuid 
    } as any);

    try {
        await broadcastToDashboard({
            type: "NEW_CHECKIN",
            member: params.broadcastMember,
            warning: params.warning,
            timestamp: now
        });
    } catch (wsError) {
        console.error("Failed to broadcast:", wsError);
    }
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {

    let isAuthenticated = false;
    let authSource: CheckIn["source"] = "unknown";

    // Raspberry Pi login
    const apiKey = event.headers["x-api-key"];
    const validApiKey = process.env.RASPBERRY_PI_API_KEY;

    // Admin login
    const token = event.headers.authorization?.split(" ")[1];

    try {
        if (apiKey && apiKey === validApiKey) {
            isAuthenticated = true;
            authSource = "raspberry_pi";
        } else if (token) {
            verifyJWT(token);
            isAuthenticated = true;
            authSource = "admin";
        }

        if (!isAuthenticated) {
            return errorResponse(event, 401, "NO_VALID_CREDENTIALS", undefined, { success: false });
        }

        let { qrUuid } = JSON.parse(event.body || "{}");
        const trimmedQrCode = qrUuid?.trim() ?? "";
        const now = new Date();

        if (!trimmedQrCode) {
            return errorResponse(event, 400, "QRUUID_REQUIRED");
        }

        const db = await connectToMongo();
        const membersCollection = db.collection<Member>("members");
        const checkinsCollection = db.collection<CheckIn>("checkins");

        const member = await membersCollection.findOne({ qrUuid: trimmedQrCode });

        if (!member) {
            const warningMsg = "Access Denied: Invalid QR / Member not found";

            await recordAndBroadcast(checkinsCollection, now, {
                memberId: null,
                source: authSource,
                warning: warningMsg,
                qrUuid: trimmedQrCode,
                broadcastMember: {
                    _id: "unknown",
                    firstName: "Unknown",
                    lastName: "Visitor",
                    email: "Invalid QR",
                    createdAt: new Date(),
                    blocked: false,
                    emailValid: false,
                    qrUuid: trimmedQrCode
                }
            });

            return errorResponse(event, 404, "MEMBER_NOT_FOUND", undefined, { success: false });
        }

        if (member.blocked) {
            const warningMsg = "Access Denied: Member is blocked";

            await recordAndBroadcast(checkinsCollection, now, {
                memberId: new ObjectId(member._id),
                source: authSource,
                warning: warningMsg,
                broadcastMember: { ...member, _id: member._id }
            });

            return errorResponse(event, 403, "MEMBER_BLOCKED", undefined, { success: false });
        }

        const lastCheckin = await checkinsCollection.findOne(
            { memberId: member._id },
            { sort: { checkInTime: -1 } }
        );

        const COOLDOWN_MINUTES = 5;
        let warning = null;

        if (lastCheckin) {
            const diffMs = now.getTime() - new Date(lastCheckin.checkInTime).getTime();
            const diffMinutes = diffMs / 1000 / 60;

            if (diffMinutes < COOLDOWN_MINUTES) {
                warning = `Last scan was ${Math.round(diffMinutes)} minutes ago.`;
            }
        }

        await recordAndBroadcast(checkinsCollection, now, {
            memberId: new ObjectId(member._id),
            source: authSource,
            warning: warning,
            broadcastMember: { ...member, _id: member._id }
        });

        return messageResponse(event, 200, "ACCESS_GRANTED", undefined, {
            success: true,
            warning: warning,
            member: {
                firstName: member.firstName,
                lastName: member.lastName,
                email: member.email,
                emailValid: member.emailValid,
                id: member._id
            }
        });
    } catch (error) {
        if (error instanceof AppError && error.code === "INVALID_TOKEN") {
            return errorResponse(event, 401, "INVALID_TOKEN", undefined, { success: false });
        }
        return errorResponse(event, 500, "INTERNAL_SERVER_ERROR", undefined, { success: false });
    }
};