"use client";

import { useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PiArrowCounterClockwiseBold } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { confirmAction } from "@/app/shared/confirm";
import { useActionFeedback } from "@/app/shared/use-action-feedback";
import { restoreUserAction } from "./actions";
import { initialUserActionState } from "./action-state";

export default function RestoreUserButton({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    restoreUserAction,
    initialUserActionState
  );

  useActionFeedback(state, () => router.refresh());

  return (
    <form ref={formRef} action={action}>
      <input type="hidden" name="userId" value={userId} />
      <Button
        type="button"
        variant="primary-soft"
        size="sm"
        isLoading={pending}
        onClick={async () => {
          const ok = await confirmAction({
            title: "Pulihkan pengguna ini?",
            text: `"${name}" akan diaktifkan kembali dan dapat masuk ke sistem.`,
            confirmText: "Ya, pulihkan",
            icon: "question",
          });
          if (ok) formRef.current?.requestSubmit();
        }}
      >
        {!pending && <PiArrowCounterClockwiseBold className="h-4 w-4" />}
        Pulihkan
      </Button>
    </form>
  );
}
