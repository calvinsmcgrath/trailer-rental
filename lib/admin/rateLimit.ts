import "server-only";
import { supabaseService } from "@/lib/supabase/service";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export type LoginAttemptStatus =
  | { locked: true; retryAfterSeconds: number }
  | { locked: false };

export async function checkLoginLock(ip: string): Promise<LoginAttemptStatus> {
  const db = supabaseService();
  const { data } = await db
    .from("admin_login_attempts")
    .select("locked_until")
    .eq("ip", ip)
    .maybeSingle();

  if (data?.locked_until) {
    const lockedUntil = new Date(data.locked_until).getTime();
    const now = Date.now();
    if (lockedUntil > now) {
      return { locked: true, retryAfterSeconds: Math.ceil((lockedUntil - now) / 1000) };
    }
  }
  return { locked: false };
}

export async function recordFailedLogin(ip: string): Promise<void> {
  const db = supabaseService();
  const { data } = await db
    .from("admin_login_attempts")
    .select("failed_count")
    .eq("ip", ip)
    .maybeSingle();

  const failedCount = (data?.failed_count ?? 0) + 1;
  const lockedUntil =
    failedCount >= MAX_ATTEMPTS
      ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString()
      : null;

  await db.from("admin_login_attempts").upsert({
    ip,
    failed_count: failedCount >= MAX_ATTEMPTS ? 0 : failedCount,
    locked_until: lockedUntil,
    updated_at: new Date().toISOString(),
  });
}

export async function clearLoginAttempts(ip: string): Promise<void> {
  const db = supabaseService();
  await db.from("admin_login_attempts").delete().eq("ip", ip);
}
