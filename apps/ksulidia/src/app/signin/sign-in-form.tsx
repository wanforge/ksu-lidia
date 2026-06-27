"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SubmitHandler } from "react-hook-form";
import { PiArrowRightBold, PiSpinnerBold } from "react-icons/pi";
import { Checkbox, Password, Button, Input, Text } from "rizzui";
import { Form } from "@core/ui/form";
import { loginSchema, LoginSchema } from "@/validators/login.schema";
import { emailPlaceholder, supportEmail } from "@/config/app";
import CaptchaField, {
  type CaptchaHandle,
} from "@/app/(hydrogen)/_components/captcha-field";
import { notify } from "@/app/shared/notify";

const initialValues: LoginSchema = {
  email: "",
  password: "",
  rememberMe: false,
};

export default function SignInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [reset, setReset] = useState({});
  const captchaRef = useRef<CaptchaHandle>(null);

  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    // getToken() is async: reCAPTCHA v3 executes the challenge here,
    // Turnstile returns the already-resolved token immediately.
    const captchaToken = await captchaRef.current?.getToken();
    if (!captchaToken) {
      notify.error("Selesaikan verifikasi CAPTCHA terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        captchaToken,
        redirect: false,
      });

      if (result?.error === "CAPTCHA_FAILED") {
        notify.error("Verifikasi CAPTCHA gagal. Silakan coba lagi.");
        captchaRef.current?.reset();
      } else if (result?.error) {
        notify.error("Email atau password salah. Silakan coba lagi.");
        setReset({});
        captchaRef.current?.reset();
      } else if (result?.ok) {
        notify.success("Berhasil masuk!");
        router.push("/");
        router.refresh();
      }
    } catch {
      notify.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form<LoginSchema>
        validationSchema={loginSchema}
        resetValues={reset}
        onSubmit={onSubmit}
        useFormProps={{
          defaultValues: initialValues,
        }}
      >
        {({ register, formState: { errors } }) => (
          <div className="space-y-5">
            <Input
              id="email"
              type="email"
              size="lg"
              label="Email"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              placeholder=""
              {...register("email")}
              error={errors.email?.message}
            />
            <Password
              id="password"
              label="Password"
              size="lg"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              placeholder=""
              {...register("password")}
              error={errors.password?.message}
            />

            <CaptchaField ref={captchaRef} />

            <div className="flex items-center justify-between pb-2">
              <Checkbox
                id="rememberMe"
                {...register("rememberMe")}
                label="Ingat saya"
                className="[&>label>span]:font-medium"
              />
            </div>
            <Button
              id="signin-submit"
              className="w-full"
              type="submit"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <PiSpinnerBold className="me-2 h-5 w-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk</span>{" "}
                  <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        )}
      </Form>
    </>
  );
}
