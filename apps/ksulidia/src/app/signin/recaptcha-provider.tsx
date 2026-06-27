"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { clientEnv } from "@/config/env.client";

// Google test site key — works on any domain in development.
const TEST_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

const siteKey = clientEnv.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? TEST_SITE_KEY;

/**
 * Wraps children with GoogleReCaptchaProvider when reCAPTCHA v3 is active.
 * Only mounted on the sign-in page — keeps the reCAPTCHA badge off all other pages.
 */
export default function RecaptchaProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      language="id"
      scriptProps={{ async: true, defer: true }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
