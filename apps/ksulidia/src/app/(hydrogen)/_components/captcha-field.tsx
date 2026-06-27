"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { PiArrowsClockwiseBold } from "react-icons/pi";
import { clientEnv } from "@/config/env.client";

/**
 * Unified CAPTCHA field.
 *
 * Priority:
 * 1. reCAPTCHA v3 (NEXT_PUBLIC_RECAPTCHA_SITE_KEY): invisible, score-based.
 * 2. Cloudflare Turnstile (NEXT_PUBLIC_TURNSTILE_SITE_KEY): visible widget.
 * 3. Self-managed svg-captcha (no key): server-generated image, HMAC-signed.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type CaptchaHandle = {
  /** Resolves to the verified CAPTCHA token, or null on failure. */
  getToken: () => Promise<string | null>;
  /** Reset the widget after a failed attempt. */
  reset: () => void;
};

// ── Keys ──────────────────────────────────────────────────────────────────────

const RECAPTCHA_SITE_KEY = clientEnv.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
const TURNSTILE_SITE_KEY = clientEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

const USE_RECAPTCHA = Boolean(RECAPTCHA_SITE_KEY);
const USE_TURNSTILE = Boolean(TURNSTILE_SITE_KEY);
// If neither is set, fall back to self-managed svg-captcha.
const TURNSTILE_RENDER_KEY = TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

// ── reCAPTCHA v3 (invisible) ──────────────────────────────────────────────────

const RecaptchaV3Field = forwardRef<CaptchaHandle>((_, ref) => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  useImperativeHandle(ref, () => ({
    getToken: async () => {
      if (!executeRecaptcha) return null;
      try {
        return await executeRecaptcha("signin");
      } catch {
        return null;
      }
    },
    reset: () => {
      // v3 is invisible — nothing to reset visually
    },
  }));

  // Renders nothing; the reCAPTCHA badge appears bottom-right via the Provider.
  return null;
});
RecaptchaV3Field.displayName = "RecaptchaV3Field";

// ── Cloudflare Turnstile ──────────────────────────────────────────────────────

const TurnstileField = forwardRef<CaptchaHandle>((_, ref) => {
  const [token, setToken] = useState<string | null>(null);
  const widgetRef = useRef<TurnstileInstance | undefined>(undefined);

  useImperativeHandle(ref, () => ({
    getToken: async () => token,
    reset: () => {
      setToken(null);
      widgetRef.current?.reset?.();
    },
  }));

  return (
    <div className="mt-1">
      <Turnstile
        ref={widgetRef}
        siteKey={TURNSTILE_RENDER_KEY}
        onSuccess={(t) => setToken(t)}
        onExpire={() => setToken(null)}
        onError={() => setToken(null)}
        options={{ theme: "light", language: "id" }}
      />
    </div>
  );
});
TurnstileField.displayName = "TurnstileField";

// ── Self-managed svg-captcha ──────────────────────────────────────────────────

type SvgChallenge = { svg: string; token: string; expiresAt: number };

const SvgCaptchaField = forwardRef<CaptchaHandle>((_, ref) => {
  const [challenge, setChallenge] = useState<SvgChallenge | null>(null);
  const [answer, setAnswer] = useState("");
  const [loadingChallenge, setLoadingChallenge] = useState(false);

  const load = useCallback(async () => {
    setLoadingChallenge(true);
    setAnswer("");
    try {
      const res = await fetch("/api/auth/captcha", { cache: "no-store" });
      if (res.ok) setChallenge(await res.json());
    } finally {
      setLoadingChallenge(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useImperativeHandle(ref, () => ({
    getToken: async () => {
      if (!challenge || !answer.trim()) return null;
      // payload: "answer|expiresAt|hmacToken"
      return `${answer.trim()}|${challenge.expiresAt}|${challenge.token}`;
    },
    reset: () => {
      setAnswer("");
      load();
    },
  }));

  return (
    <div>
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">
        Verifikasi Keamanan
      </span>

      <div className="flex items-stretch gap-3">
        {/* Clickable CAPTCHA image */}
        <button
          type="button"
          onClick={load}
          disabled={loadingChallenge}
          title="Klik untuk ganti gambar"
          className="group relative flex h-11 w-[148px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-300 bg-gray-50 transition hover:border-gray-500 disabled:opacity-60"
        >
          {loadingChallenge || !challenge ? (
            <PiArrowsClockwiseBold className="h-4 w-4 animate-spin text-gray-400" />
          ) : (
            <>
              <div
                dangerouslySetInnerHTML={{ __html: challenge.svg }}
                className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
              />
              {/* Refresh overlay on hover */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-white/75 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100">
                <PiArrowsClockwiseBold className="h-4 w-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600">Ganti</span>
              </div>
            </>
          )}
        </button>

        {/* Answer input */}
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="h-11 min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 font-mono text-sm tracking-widest text-gray-900 outline-none transition placeholder:font-sans placeholder:tracking-normal placeholder:text-gray-400 focus:border-gray-700"
          aria-label="Ketik karakter CAPTCHA"
        />
      </div>

      <p className="mt-1.5 text-xs text-gray-400">
        Klik gambar untuk ganti karakter baru.
      </p>
    </div>
  );
});
SvgCaptchaField.displayName = "SvgCaptchaField";

// ── Unified export ────────────────────────────────────────────────────────────

const CaptchaField = forwardRef<CaptchaHandle>((props, ref) => {
  if (USE_RECAPTCHA) {
    return <RecaptchaV3Field ref={ref} {...props} />;
  }
  if (USE_TURNSTILE) {
    return <TurnstileField ref={ref} {...props} />;
  }
  return <SvgCaptchaField ref={ref} {...props} />;
});
CaptchaField.displayName = "CaptchaField";

export default CaptchaField;
