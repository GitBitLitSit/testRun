import jwt from "jsonwebtoken";

export const generateJWT = (userId: string) => {
    const payload = {
        sub: userId,
        iat: Date.now(),
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
    };

    const secretKey = process.env.JWT_SECRET_KEY;

    if(!secretKey) {
        throw new Error("JWT secret key is not defined");
    }

    return jwt.sign(payload, secretKey);
}

export const verifyJWT = (token: string) => {
    const secretKey = process.env.JWT_SECRET_KEY;

    if (!secretKey) {
        throw new Error("JWT secret key is not defined");
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        return decoded;
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
}