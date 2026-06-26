import type { Metadata } from "next";
import AuthWrapper from "@/app/shared/auth-layout/auth-wrapper";
import ResetPasswordForm from "./reset-password-form";
import { pageTitle } from "@/config/app";

export const metadata: Metadata = {
  title: pageTitle("Reset Password"),
  description:
    "Mengganti password menggunakan link reset sekali pakai yang diterbitkan admin.",
};

type PageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function ResetPasswordPage({ params }: PageProps) {
  const { token } = await params;

  return (
    <AuthWrapper
      title={
        <>
          Reset <span className="text-primary">password</span> akun.
        </>
      }
      description="Gunakan link sekali pakai dari admin untuk mengganti password akun PERSONA."
    >
      <ResetPasswordForm token={token} />
    </AuthWrapper>
  );
}
