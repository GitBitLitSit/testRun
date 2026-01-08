import jwt from "jsonwebtoken";
import { AppError } from "./appError";

export const generateJWT = (userId: string) => {
    const payload = {
        sub: userId,
        iat: Date.now(),
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
    };

    const secretKey = process.env.JWT_SECRET_KEY;

    if(!secretKey) {
        throw new AppError("INTERNAL_SERVER_ERROR");
    }

    return jwt.sign(payload, secretKey);
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