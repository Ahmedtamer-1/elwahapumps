"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { clientIp, rateLimit, resetRateLimit } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export interface LoginState {
  error?: string;
}

/**
 * A bcrypt hash of a random string nobody holds the input to.
 *
 * Compared against when the email is unknown, purely to spend the same
 * ~100ms an existing account spends. Without it the two paths were
 * trivially distinguishable by response time: an unknown address returned
 * in database-lookup time while a known one paid the full bcrypt cost, so
 * the identical error message gave no enumeration resistance at all
 * (S7-T03). Not a credential — nothing verifies against it.
 */
const TIMING_EQUALISER_HASH = "$2b$10$UPbGbEw39z4vgBoGi5LNj.x.wB7noxTKoVaBcqk9dBxVPMmiLPWmy";

/** Ten attempts per window, then locked out for the rest of it. */
const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // Throttled on both axes: the address stops one host grinding through
  // many accounts, the email stops a distributed attempt grinding through
  // one account. Checked before any database work so a locked-out caller
  // costs nothing.
  const ip = clientIp(await headers());
  const email = parsed.data.email.toLowerCase();
  const throttled = { error: "Too many sign-in attempts. Try again in a few minutes." };

  const byIp = rateLimit(`login:ip:${ip}`, { limit: LOGIN_LIMIT, windowMs: LOGIN_WINDOW_MS });
  if (!byIp.ok) return throttled;
  const byEmail = rateLimit(`login:email:${email}`, { limit: LOGIN_LIMIT, windowMs: LOGIN_WINDOW_MS });
  if (!byEmail.ok) return throttled;

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  // Same message for unknown email and wrong password, so the form can't be used
  // to discover which staff email addresses exist.
  const invalid = { error: "Incorrect email or password" };

  if (!user) {
    // Spend the same time a real comparison would; see the note above.
    await verifyPassword(parsed.data.password, TIMING_EQUALISER_HASH);
    return invalid;
  }

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return invalid;

  // Signing in successfully clears the counters, so an operator who
  // fat-fingered a few times is not still locked out afterwards.
  resetRateLimit(`login:ip:${ip}`);
  resetRateLimit(`login:email:${email}`);

  const token = await createSessionToken({
    userId: user.id,
    role: user.role as "ADMIN" | "STAFF",
    name: user.name,
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions);

  // A flagged account goes straight to the change-password screen; the
  // dashboard layout keeps it there until the flag clears (S7-T05).
  if (user.mustChangePassword) redirect("/admin/change-password");

  const next = formData.get("next");
  redirect(typeof next === "string" && next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
