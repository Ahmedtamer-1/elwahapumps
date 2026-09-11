import { SignJWT, jwtVerify } from "jose";

/**
 * The customer's session, kept entirely separate from the staff one.
 *
 * A second cookie rather than a second role on the admin session: the two
 * grant different things, expire on different schedules, and a customer must
 * never be one claim away from an admin token. The payloads cannot be
 * confused either — `verifySessionToken` in session.ts requires a `role` of
 * ADMIN or STAFF, which a customer token never carries, and the check below
 * requires a `kind` of "customer", which a staff token never carries. Present
 * a customer token to the admin guard and it reads as signed out, and the
 * other way round.
 *
 * The `__Host-` prefix is enforced by the browser: it refuses the cookie
 * unless it is Secure, carries no Domain and is scoped to Path=/, so nothing
 * on a subdomain can overwrite the session. It only works over HTTPS, so
 * development over plain http keeps the unprefixed name — the same split
 * session.ts makes.
 */
const USE_SECURE_COOKIE = process.env.NODE_ENV === "production";
export const CUSTOMER_SESSION_COOKIE = USE_SECURE_COOKIE
  ? "__Host-elwaha_customer_session"
  : "elwaha_customer_session";

/** 30 days. A customer signs in from their own phone and should stay in;
 *  staff sessions are the short ones because staff sit on shared machines. */
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export interface CustomerSession {
  accountId: string;
  /** The CRM record this account belongs to — what inquiries are filed under. */
  customerId: string;
  name: string;
  email: string;
}

interface CustomerTokenPayload extends CustomerSession {
  kind: "customer";
}

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createCustomerToken(session: CustomerSession): Promise<string> {
  const payload: CustomerTokenPayload = { ...session, kind: "customer" };
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyCustomerToken(token: string): Promise<CustomerSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      payload.kind === "customer" &&
      typeof payload.accountId === "string" &&
      typeof payload.customerId === "string" &&
      typeof payload.name === "string" &&
      typeof payload.email === "string"
    ) {
      return {
        accountId: payload.accountId,
        customerId: payload.customerId,
        name: payload.name,
        email: payload.email,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export const customerCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};
