import "server-only";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { env } from "@/lib/env";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "./session";

export function assertAdminSlug(slug: string) {
  if (slug !== env.adminSlug()) {
    notFound();
  }
}

export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

/** Call after assertAdminSlug in any protected admin page. Redirects to the login page if not authed. */
export async function requireAdminSession(slug: string) {
  const authed = await isAdminAuthed();
  if (!authed) {
    redirect(`/admin/${slug}`);
  }
}
