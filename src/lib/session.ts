import { SignJWT, jwtVerify } from "jose";

/**
 * The `__Host-` prefix is enforced by the browser, not by us: it refuses
 * the cookie unless it is Secure, has no Domain attribute and is scoped to
 * Path=/. That makes it impossible for a subdomain — or anything that
 * manages to sit on one — to overwrite the admin session. The cookie
 * already met every one of those conditions; it simply was not claiming
 * the guarantee (S7-T02).
 *
 * The prefix only works over HTTPS, so development over plain http keeps
 * the unprefixed name.
 */
const USE_SECURE_COOKIE = process.env.NODE_ENV === "production";
export const SESSION_COOKIE = USE_SECURE_COOKIE
  ? "__Host-elwaha_admin_session"
  : "elwaha_admin_session";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * A short secret is brute-forceable offline against any captured token,
 * and forging one mints an administrator session. 32 characters is the
 * floor; the generator in .env.example produces 64.
 */
const MIN_SECRET_LENGTH = 32;

export interface SessionPayload {
  userId: string;
  role: "ADMIN" | "STAFF";
  name: string;
}

/** Values that must never be accepted, whatever their length. */
const FORBIDDEN_SECRETS = new Set(["change-me", "changeme", "secret", "development"]);

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");

  // Fail closed on a weak secret in production. Previously any non-empty
  // string was accepted, including the literal "change-me" that
  // .env.example ships with — so an install that never touched the sample
  // file ran with a publicly known signing key.
  if (process.env.NODE_ENV === "production") {
    if (FORBIDDEN_SECRETS.has(secret.trim().toLowerCase())) {
      throw new Error(
        "JWT_SECRET is set to a placeholder value. Generate a real one: " +
          `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`,
      );
    }
    if (secret.length < MIN_SECRET_LENGTH) {
      throw new Error(
        `JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters (got ${secret.length}). ` +
          `Generate one: node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`,
      );
    }
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.userId === "string" &&
      typeof payload.name === "string" &&
      (payload.role === "ADMIN" || payload.role === "STAFF")
    ) {
      return { userId: payload.userId, role: payload.role, name: payload.name };
    }
    return null;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};
