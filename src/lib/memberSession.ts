import jwt from "jsonwebtoken";
import { AppError } from "./appError";

type MemberSessionPayload = {
  sub: string;
  email: string;
  type: "member-profile";
};

const MEMBER_SESSION_SECRET_SUFFIX = ":member-profile-session";

function getMemberSessionSecret(): string {
  const baseSecret = process.env.JWT_SECRET_KEY;
  if (!baseSecret) {
    throw new AppError("INTERNAL_SERVER_ERROR");
  }
  return `${baseSecret}${MEMBER_SESSION_SECRET_SUFFIX}`;
}

export function createMemberSessionToken(memberId: string, email: string): string {
  const payload: MemberSessionPayload = {
    sub: memberId,
    email,
    type: "member-profile",
  };

  return jwt.sign(payload, getMemberSessionSecret(), {
    expiresIn: "30d",
  });
}

export function verifyMemberSessionToken(token: string): MemberSessionPayload {
  try {
    const decoded = jwt.verify(token, getMemberSessionSecret());
    if (
      !decoded ||
      typeof decoded !== "object" ||
      typeof (decoded as { sub?: unknown }).sub !== "string" ||
      typeof (decoded as { email?: unknown }).email !== "string" ||
      (decoded as { type?: unknown }).type !== "member-profile"
    ) {
      throw new AppError("INVALID_TOKEN");
    }

    return {
      sub: (decoded as { sub: string }).sub,
      email: (decoded as { email: string }).email,
      type: "member-profile",
    };
  } catch (error) {
    throw new AppError("INVALID_TOKEN");
  }
}
