/**
 * CAPTCHA server-side verification.
 *
 * Provider dipilih berdasarkan env yang dikonfigurasi:
 *  1. Google reCAPTCHA v3  – NEXT_PUBLIC_RECAPTCHA_SITE_KEY + RECAPTCHA_SECRET_KEY
 *  2. Cloudflare Turnstile – NEXT_PUBLIC_TURNSTILE_SITE_KEY + TURNSTILE_SECRET_KEY
 *  3. Self-managed svg-captcha (built-in, no key required)
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/config/env";
import { clientEnv } from "@/config/env.client";

// reCAPTCHA v3 score threshold (0.0 bot – 1.0 human). Default 0.5.
const SCORE_THRESHOLD = env.RECAPTCHA_SCORE_THRESHOLD;

// Test secret keys — always pass; replace with real keys for production.
const RECAPTCHA_TEST_SECRET = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";
const TURNSTILE_TEST_SECRET = "1x0000000000000000000000000000000AA";

async function verifyRecaptchaV3(token: string): Promise<boolean> {
  const secret = env.RECAPTCHA_SECRET_KEY ?? RECAPTCHA_TEST_SECRET;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
      cache: "no-store",
    });
    const data = (await res.json()) as { success: boolean; score?: number };
    // v3 requires success AND score above threshold
    if (!data.success) return false;
    if (typeof data.score === "number") return data.score >= SCORE_THRESHOLD;
    return true; // test keys don't return a score — accept as-is
  } catch {
    return false;
  }
}

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = env.TURNSTILE_SECRET_KEY ?? TURNSTILE_TEST_SECRET;
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, response: token }),
        cache: "no-store",
      }
    );
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

// ── Self-managed svg-captcha ──────────────────────────────────────────────────

function verifyLocalCaptcha(payload: string): boolean {
  // payload: "answer|expiresAt|hmacToken"
  const parts = payload.split("|");
  if (parts.length !== 3) return false;
  const [answer, expiresAtStr, hmac] = parts;
  const expiresAt = Number(expiresAtStr);
  if (Number.isNaN(expiresAt) || Date.now() > expiresAt) return false;

  const secret = env.NEXTAUTH_SECRET ?? "";
  const expected = createHmac("sha256", secret)
    .update(`${answer.toLowerCase()}|${expiresAt}`)
    .digest("hex");

  try {
    return timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(hmac, "hex")
    );
  } catch {
    return false;
  }
}

// ── Unified verify ────────────────────────────────────────────────────────────

/**
 * Verify a CAPTCHA token. Priority:
 *  1. Google reCAPTCHA v3  (NEXT_PUBLIC_RECAPTCHA_SITE_KEY)
 *  2. Cloudflare Turnstile (NEXT_PUBLIC_TURNSTILE_SITE_KEY)
 *  3. Self-managed svg-captcha (built-in fallback, no key required)
 */
export async function verifyCaptcha(
  token: string | undefined
): Promise<boolean> {
  if (!token?.trim()) return false;

  if (clientEnv.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
    return verifyRecaptchaV3(token);
  }

  if (clientEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
    return verifyTurnstile(token);
  }

  // No external CAPTCHA keys configured — use self-managed svg-captcha.
  return verifyLocalCaptcha(token);
}
