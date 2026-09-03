import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";
import { env } from "@/lib/env";
import { getClientIp } from "@/lib/http";
import { loginSchema } from "@/lib/validation";
import { checkLoginLock, recordFailedLogin, clearLoginAttempts } from "@/lib/admin/rateLimit";
import { ADMIN_SESSION_COOKIE, createAdminSessionToken } from "@/lib/admin/session";

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

function safeEqual(a: string, b: string): boolean {
  const ah = createHash("sha256").update(a).digest();
  const bh = createHash("sha256").update(b).digest();
  return timingSafeEqual(ah, bh);
}

export async function POST(request: Request) {
  const headersList = await headers();
  const ip = getClientIp(headersList);

  const lock = await checkLoginLock(ip);
  if (lock.locked) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${Math.ceil(lock.retryAfterSeconds / 60)} minute(s).` },
      { status: 429 }
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }

  if (!safeEqual(parsed.data.password, env.adminPassword())) {
    await recordFailedLogin(ip);
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  await clearLoginAttempts(ip);

  const token = await createAdminSessionToken();
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS_SECONDS,
  });

  return NextResponse.json({ ok: true });
}
