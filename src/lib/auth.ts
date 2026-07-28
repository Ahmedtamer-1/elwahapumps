import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken, type SessionPayload } from "./session";

/** Reads and verifies the session cookie. Returns null when signed out. */
export async function getCurrentUser(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Guard for admin pages and server actions. The proxy also redirects unauthenticated
 * traffic, but Next.js docs are explicit that proxy alone must not be relied on for
 * auth — every protected route calls this directly.
 */
export async function requireUser(): Promise<SessionPayload> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** Guard for ADMIN-only areas (staff account management). */
export async function requireAdmin(): Promise<SessionPayload> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/admin");
  return user;
}
