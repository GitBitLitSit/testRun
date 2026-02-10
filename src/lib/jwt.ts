import jwt from "jsonwebtoken";
import { AppError } from "./appError";

const DEFAULT_OWNER_SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours
const MIN_OWNER_SESSION_TTL_SECONDS = 60;

function getOwnerSessionTtlSeconds(): number {
    const configured = process.env.OWNER_SESSION_TTL_SECONDS?.trim();
    if (!configured) {
        return DEFAULT_OWNER_SESSION_TTL_SECONDS;
    }

    const parsed = Number(configured);
    if (Number.isInteger(parsed) && parsed >= MIN_OWNER_SESSION_TTL_SECONDS) {
        return parsed;
    }

    console.warn(`[auth] Invalid OWNER_SESSION_TTL_SECONDS="${configured}", using default ${DEFAULT_OWNER_SESSION_TTL_SECONDS}s`);
    return DEFAULT_OWNER_SESSION_TTL_SECONDS;
}

export const generateJWT = (userId: string) => {
    const payload = { sub: userId };

    const secretKey = process.env.JWT_SECRET_KEY;

    if(!secretKey) {
        throw new AppError("INTERNAL_SERVER_ERROR");
    }

    return jwt.sign(payload, secretKey, {
        expiresIn: getOwnerSessionTtlSeconds(),
    });
}

export const verifyJWT = (token: string) => {
    const secretKey = process.env.JWT_SECRET_KEY;

    if (!secretKey) {
        throw new AppError("INTERNAL_SERVER_ERROR");
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        return decoded;
    } catch (error) {
        throw new AppError("INVALID_TOKEN");
    }
}