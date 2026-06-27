import svgCaptcha from "svg-captcha";
import { createHmac, randomInt } from "node:crypto";
import { env } from "@/config/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TTL_MS = 10 * 60 * 1000; // 10 menit

function sign(text: string, expiresAt: number): string {
  const secret = env.NEXTAUTH_SECRET ?? "";
  return createHmac("sha256", secret)
    .update(`${text.toLowerCase()}|${expiresAt}`)
    .digest("hex");
}

/**
 * GET /api/auth/captcha
 * Returns a signed svg-captcha challenge for the self-managed CAPTCHA fallback.
 * The /api/auth/* prefix is excluded from middleware auth so this is public.
 */
export async function GET() {
  const captcha = svgCaptcha.create({
    size: randomInt(4, 6), // random length between 4 and 6
    width: 180,
    height: 56,
    fontSize: 44,
    charPreset: "0123456789", // exclude confusing chars
    color: true,
    // inverse: false,
    // ignoreChars: "",
    noise: randomInt(2, 4), // random noise lines between 2 and 3
    background: "#f8fafc",
    // mathOperator: "+",
    // mathMin: 1,
    // mathMax: 9,
  });

  const expiresAt = Date.now() + TTL_MS;
  const token = sign(captcha.text, expiresAt);

  return Response.json(
    { svg: captcha.data, token, expiresAt },
    { headers: { "Cache-Control": "no-store" } }
  );
}
