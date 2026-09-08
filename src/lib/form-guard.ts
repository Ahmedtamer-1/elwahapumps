import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Shared abuse checks for the two public POST endpoints (S7-T04).
 *
 * Both write a database row per request, and since S0-T11 every row also
 * sends a notification — so an unthrottled endpoint does not just fill a
 * table, it buries real enquiries under noise.
 *
 * Deliberately not a CAPTCHA. This is a low-traffic B2B contact form; a
 * throttle, a honeypot and an origin check stop opportunistic bots without
 * putting a puzzle in front of a customer trying to buy a pump.
 */

/** Generous for a human, useless for a script. */
const SUBMIT_LIMIT = 5;
const SUBMIT_WINDOW_MS = 10 * 60 * 1000;

export interface GuardContext {
  /** Route name, so the two endpoints get independent buckets. */
  route: string;
  request: Request;
  /**
   * The honeypot field's submitted value. A real browser never fills it —
   * it is hidden and has no label — so anything here is a bot.
   */
  honeypot?: unknown;
}

export type GuardVerdict =
  | { kind: "ok" }
  /** Bot detected. The caller should return 200 without writing anything. */
  | { kind: "silent-drop" }
  | { kind: "reject"; response: NextResponse };

/**
 * Same-origin check.
 *
 * `Sec-Fetch-Site` is set by the browser and cannot be spoofed by page
 * script, so it is preferred. Origin is the fallback for clients that do
 * not send it. A request with neither is allowed through: server-to-server
 * callers and some older browsers legitimately omit both, and the throttle
 * still applies to them.
 */
function isSameOrigin(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite) return fetchSite === "same-origin" || fetchSite === "none";

  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export function guardSubmission({ route, request, honeypot }: GuardContext): GuardVerdict {
  if (!isSameOrigin(request)) {
    return {
      kind: "reject",
      response: NextResponse.json({ error: "Cross-origin submissions are not accepted" }, { status: 403 }),
    };
  }

  // Answered 200 so the bot records a success and moves on, rather than
  // learning it was spotted and retrying differently. Nothing is written.
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { kind: "silent-drop" };
  }

  const ip = clientIp(request.headers);
  const limit = rateLimit(`${route}:${ip}`, { limit: SUBMIT_LIMIT, windowMs: SUBMIT_WINDOW_MS });
  if (!limit.ok) {
    return {
      kind: "reject",
      response: NextResponse.json(
        { error: "Too many submissions. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      ),
    };
  }

  return { kind: "ok" };
}

/**
 * Normalises a phone number for storage so the same person submitting
 * "01066685532" and "+20 106 668 5532" deduplicates in the CRM. Keeps the
 * leading +, drops every other non-digit.
 */
export function normalisePhone(phone: string | undefined | null): string | null {
  if (!phone) return null;
  const trimmed = phone.trim();
  if (!trimmed) return null;
  const plus = trimmed.startsWith("+") ? "+" : "";
  const digits = trimmed.replace(/\D/g, "");
  return digits ? `${plus}${digits}` : null;
}

/** Lowercased and trimmed, for the same reason. */
export function normaliseEmail(email: string | undefined | null): string | null {
  if (!email) return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed || null;
}
