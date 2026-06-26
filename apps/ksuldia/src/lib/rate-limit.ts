export type RateLimitRecord = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

export type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

/**
 * Pure fixed-window rate-limit evaluation against a caller-provided store.
 * Mutates the store entry for `key` and returns whether the action is allowed.
 * Kept pure (store + now injected) so it can be unit tested deterministically.
 */
export function evaluateRateLimit(
  store: Map<string, RateLimitRecord>,
  key: string,
  now: number,
  options: RateLimitOptions
): RateLimitResult {
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.limit - 1, retryAfterMs: 0 };
  }

  if (existing.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: existing.resetAt - now,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: options.limit - existing.count,
    retryAfterMs: 0,
  };
}

const loginStore = new Map<string, RateLimitRecord>();

const LOGIN_RATE_LIMIT: RateLimitOptions = {
  limit: 5,
  windowMs: 5 * 60 * 1000, // 5 attempts per 5 minutes per key
};

/**
 * Throttle login attempts per identifier (e.g. lowercased email). Uses an
 * in-process store, which is sufficient for a single-instance deployment.
 * For multi-instance, back this with a shared store (Redis) later.
 */
export function consumeLoginAttempt(key: string): RateLimitResult {
  return evaluateRateLimit(loginStore, key, Date.now(), LOGIN_RATE_LIMIT);
}

/** Clear a key's counter after a successful login. */
export function resetLoginAttempts(key: string): void {
  loginStore.delete(key);
}

const fileAccessStore = new Map<string, RateLimitRecord>();

const FILE_ACCESS_RATE_LIMIT: RateLimitOptions = {
  // Cukup longgar untuk pratinjau/unduh normal, tapi memblok scraping/brute-force
  // ID file (mis. enumerasi attachment/photo).
  limit: 120,
  windowMs: 60 * 1000, // 120 permintaan / menit per kunci (user+ip)
};

/**
 * Throttle akses berkas (attachment/foto) per kunci. In-process store; untuk
 * multi-instance gunakan store bersama (Redis).
 */
export function consumeFileAccess(key: string): RateLimitResult {
  return evaluateRateLimit(
    fileAccessStore,
    key,
    Date.now(),
    FILE_ACCESS_RATE_LIMIT
  );
}
