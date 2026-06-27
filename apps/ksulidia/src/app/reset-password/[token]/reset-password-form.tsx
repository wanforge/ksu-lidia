"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Password } from "rizzui";
import { PiArrowRightBold, PiSpinnerBold } from "react-icons/pi";
import { routes } from "@/config/routes";
import { useActionFeedback } from "@/app/shared/use-action-feedback";
import { resetPasswordWithTokenAction } from "./actions";
import { initialResetPasswordState } from "./action-state";

type ResetPasswordFormProps = {
  token: string;
};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;

  return (
    <p className="mt-1 text-xs font-medium text-rose-700">{messages[0]}</p>
  );
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    resetPasswordWithTokenAction,
    initialResetPasswordState
  );

  useActionFeedback(state);

  useEffect(() => {
    if (!state.success) return;

    const timeout = window.setTimeout(() => {
      router.push(routes.signIn);
      router.refresh();
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [router, state.success]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />

      {state.message ? (
        <div
          className={
            state.success
              ? "rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
              : "rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800"
          }
        >
          {state.message}
        </div>
      ) : null}

      <div>
        <Password
          id="password"
          name="password"
          label="Password Baru"
          helperText="Minimal 8 karakter."
          size="lg"
          disabled={pending || state.success}
          className="[&>label>span]:font-medium"
          inputClassName="text-sm"
        />
        <FieldError messages={state.errors?.password} />
      </div>

      <div>
        <Password
          id="confirmPassword"
          name="confirmPassword"
          label="Konfirmasi Password"
          helperText="Ketik ulang password baru, harus sama persis."
          size="lg"
          disabled={pending || state.success}
          className="[&>label>span]:font-medium"
          inputClassName="text-sm"
        />
        <FieldError messages={state.errors?.confirmPassword} />
      </div>

      <Button
        className="w-full"
        type="submit"
        size="lg"
        disabled={pending || state.success}
      >
        {pending ? (
          <>
            <PiSpinnerBold className="me-2 h-5 w-5 animate-spin" />
            <span>Menyimpan...</span>
          </>
        ) : (
          <>
            <span>Ganti password</span>
            <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />
          </>
        )}
      </Button>
    </form>
  );
}
