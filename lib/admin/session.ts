import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_DURATION = "30d";

function secretKey() {
  return new TextEncoder().encode(env.sessionSecret());
}

export async function createAdminSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(secretKey());
}

export async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
