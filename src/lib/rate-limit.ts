/**
 * Fixed-window rate limiting, in memory.
 *
 * One primitive shared by the admin login lockout (S7-T03) and the two
 * public POST endpoints (S7-T04) — the plan calls for exactly one, since
 * two implementations would drift.
 *
 * In-memory is the right scope for this deployment: a single Node process
 * on one VPS, per the README. It resets on restart and does not span
 * instances, so if this ever runs behind more than one process the store
 * needs to move to SQLite or Redis. Stated here rather than discovered
 * later.
 */

interface Window {
  count: number;
  /** Epoch ms at which this window expires and the count resets. */
  resetAt: number;
}

const windows = new Map<string, Window>();

/** Bounds memory if a flood arrives with many distinct keys. */
const MAX_KEYS = 10_000;

function sweep(now: number) {
  for (const [key, w] of windows) {
    if (w.resetAt <= now) windows.delete(key);
  }
}

export interface RateLimitOptions {
  /** Requests allowed per window. */
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  /** False once the limit is exhausted for the current window. */
  ok: boolean;
  remaining: number;
  /** Whole seconds until the window resets — suitable for Retry-After. */
  retryAfterSeconds: number;
}

export function rateLimit(key: string, { limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    if (windows.size >= MAX_KEYS) sweep(now);
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  if (existing.count > limit) {
    return { ok: false, remaining: 0, retryAfterSeconds };
  }
  return { ok: true, remaining: limit - existing.count, retryAfterSeconds };
}

/** Clears a key's window — used after a successful login. */
export function resetRateLimit(key: string) {
  windows.delete(key);
}

/** Test-only: empties the store so cases cannot leak into each other. */
export function __clearRateLimits() {
  windows.clear();
}

/**
 * Best-effort client address.
 *
 * Behind a reverse proxy the socket address is the proxy's, so the
 * forwarded headers are the only signal available. They are also
 * trivially spoofable by a direct caller, which is why this is used for
 * rate limiting and never for authorisation. Falls back to a single
 * shared bucket rather than to something unique-per-request: an unknown
 * address should be throttled together, not handed a fresh allowance on
 * every call.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}
