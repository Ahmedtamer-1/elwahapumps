import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { __clearRateLimits, clientIp, rateLimit, resetRateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => __clearRateLimits());

  test("allows exactly `limit` calls, then refuses", () => {
    const opts = { limit: 3, windowMs: 60_000 };
    assert.equal(rateLimit("k", opts).ok, true);
    assert.equal(rateLimit("k", opts).ok, true);
    assert.equal(rateLimit("k", opts).ok, true);
    assert.equal(rateLimit("k", opts).ok, false, "the 4th call is over the limit");
  });

  test("counts down remaining, and floors it at zero once refused", () => {
    const opts = { limit: 2, windowMs: 60_000 };
    assert.equal(rateLimit("k", opts).remaining, 1);
    assert.equal(rateLimit("k", opts).remaining, 0);
    assert.equal(rateLimit("k", opts).remaining, 0);
  });

  test("keys are independent — one caller cannot exhaust another's allowance", () => {
    const opts = { limit: 1, windowMs: 60_000 };
    assert.equal(rateLimit("a", opts).ok, true);
    assert.equal(rateLimit("a", opts).ok, false);
    assert.equal(rateLimit("b", opts).ok, true, "b has its own window");
  });

  test("the window expires and the allowance returns", async () => {
    const opts = { limit: 1, windowMs: 40 };
    assert.equal(rateLimit("k", opts).ok, true);
    assert.equal(rateLimit("k", opts).ok, false);
    await new Promise((r) => setTimeout(r, 60));
    assert.equal(rateLimit("k", opts).ok, true, "a fresh window starts after windowMs");
  });

  test("reports a positive retry-after only once refused", () => {
    const opts = { limit: 1, windowMs: 60_000 };
    assert.equal(rateLimit("k", opts).retryAfterSeconds, 0);
    const refused = rateLimit("k", opts);
    assert.equal(refused.ok, false);
    assert.ok(refused.retryAfterSeconds > 0, "callers need a Retry-After to honour");
    assert.ok(refused.retryAfterSeconds <= 60);
  });

  test("resetRateLimit clears a key — a good login un-penalises fat fingers", () => {
    const opts = { limit: 1, windowMs: 60_000 };
    rateLimit("k", opts);
    assert.equal(rateLimit("k", opts).ok, false);
    resetRateLimit("k");
    assert.equal(rateLimit("k", opts).ok, true);
  });
});

describe("clientIp", () => {
  test("takes the first hop of x-forwarded-for", () => {
    const h = new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1, 10.0.0.2" });
    assert.equal(clientIp(h), "203.0.113.7");
  });

  test("falls back to x-real-ip", () => {
    assert.equal(clientIp(new Headers({ "x-real-ip": "198.51.100.4" })), "198.51.100.4");
  });

  test("unknown callers share one bucket rather than each getting a fresh allowance", () => {
    assert.equal(clientIp(new Headers()), "unknown");
    assert.equal(clientIp(new Headers({ "x-forwarded-for": "  " })), "unknown");
  });
});
