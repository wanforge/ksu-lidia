import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluateRateLimit, type RateLimitRecord } from "../src/lib/rate-limit";

const options = { limit: 3, windowMs: 1000 };

test("allows attempts up to the limit within the window", () => {
  const store = new Map<string, RateLimitRecord>();
  assert.equal(evaluateRateLimit(store, "a", 0, options).allowed, true);
  assert.equal(evaluateRateLimit(store, "a", 100, options).allowed, true);
  assert.equal(evaluateRateLimit(store, "a", 200, options).allowed, true);
});

test("blocks the attempt that exceeds the limit", () => {
  const store = new Map<string, RateLimitRecord>();
  evaluateRateLimit(store, "a", 0, options);
  evaluateRateLimit(store, "a", 0, options);
  evaluateRateLimit(store, "a", 0, options);
  const blocked = evaluateRateLimit(store, "a", 0, options);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
  assert.equal(blocked.retryAfterMs, 1000);
});

test("resets after the window elapses", () => {
  const store = new Map<string, RateLimitRecord>();
  evaluateRateLimit(store, "a", 0, options);
  evaluateRateLimit(store, "a", 0, options);
  evaluateRateLimit(store, "a", 0, options);
  assert.equal(evaluateRateLimit(store, "a", 0, options).allowed, false);
  // After the window resets, attempts are allowed again.
  assert.equal(evaluateRateLimit(store, "a", 1001, options).allowed, true);
});

test("tracks keys independently", () => {
  const store = new Map<string, RateLimitRecord>();
  evaluateRateLimit(store, "a", 0, options);
  evaluateRateLimit(store, "a", 0, options);
  evaluateRateLimit(store, "a", 0, options);
  assert.equal(evaluateRateLimit(store, "a", 0, options).allowed, false);
  assert.equal(evaluateRateLimit(store, "b", 0, options).allowed, true);
});
