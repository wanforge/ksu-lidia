import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SignInForm from "@/app/signin/sign-in-form";
import AuthWrapper from "@/app/shared/auth-layout/auth-wrapper";
import RecaptchaProvider from "@/app/signin/recaptcha-provider";
import { pageTitle, appConfig } from "@/config/app";
import { clientEnv } from "@/config/env.client";
import { getSession } from "@/lib/auth";
import { defaultLandingPath } from "@/lib/rbac/route-permissions";

export const metadata: Metadata = {
  title: pageTitle("Masuk"),
  description: `Masuk ke ${appConfig.name} — ${appConfig.tagline}${
    appConfig.orgName ? ` ${appConfig.orgName}` : ""
  }.`,
};

// Mount GoogleReCaptchaProvider only when reCAPTCHA v3 is configured,
// to avoid loading the reCAPTCHA script on every page.
const useRecaptcha = Boolean(clientEnv.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);

export default async function SignInPage() {
  // Sudah login → jangan tampilkan halaman signin, arahkan ke landing per role.
  const session = await getSession();
  if (session?.user) {
    redirect(defaultLandingPath(session.user.role));
  }

  const form = (
    <AuthWrapper
      title={
        <>
          Selamat datang kembali! <span className="text-primary">Masuk</span>{" "}
          untuk melanjutkan.
        </>
      }
      description={`Gunakan akun Anda untuk mengakses ${appConfig.name}.`}
    >
      <SignInForm />
    </AuthWrapper>
  );

  if (useRecaptcha) {
    return <RecaptchaProvider>{form}</RecaptchaProvider>;
  }

  return form;
}
