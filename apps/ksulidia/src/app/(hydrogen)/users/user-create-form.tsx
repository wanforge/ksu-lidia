"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActionFeedback } from "@/app/shared/use-action-feedback";
import { createUserAction } from "./actions";
import { initialUserActionState } from "./action-state";

import { LabelWithHint } from "@/app/(hydrogen)/_components/field-hint";
import { emailPlaceholder } from "@/config/app";
import { Button } from "@/components/ui/button";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-700";
const labelClass = "text-sm font-semibold text-gray-800";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;

  return (
    <p className="mt-1 text-xs font-medium text-rose-700">{messages[0]}</p>
  );
}

export default function UserCreateForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createUserAction,
    initialUserActionState
  );

  useActionFeedback(state);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <form action={formAction}>
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-base font-semibold text-gray-950">Tambah User</h2>
        <p className="mt-1 text-sm text-gray-500">
          Akun hanya dibuat dari admin.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
        {state.message ? (
          <div
            className={
              state.success
                ? "rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 md:col-span-2"
                : "rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 md:col-span-2"
            }
          >
            {state.message}
          </div>
        ) : null}

        <label className={labelClass}>
          <LabelWithHint
            text="Nama"
            hint="Nama lengkap pemilik akun untuk identifikasi di sistem."
          />
          <input
            name="name"
            className={inputClass}
            placeholder="Nama pengguna"
            required
          />
          <FieldError messages={state.errors?.name} />
        </label>

        <label className={labelClass}>
          <LabelWithHint
            text="Email"
            hint="Email dinas; digunakan sebagai nama pengguna saat masuk ke sistem."
          />
          <input
            name="email"
            type="email"
            className={inputClass}
            placeholder={emailPlaceholder}
            required
          />
          <FieldError messages={state.errors?.email} />
        </label>

        <label className={labelClass}>
          <LabelWithHint
            text="Kata Sandi Awal"
            hint="Minimal 8 karakter. Sampaikan kepada pengguna melalui saluran yang aman; kata sandi dapat diatur ulang nanti."
          />
          <input
            name="password"
            type="password"
            className={inputClass}
            placeholder="Minimal 8 karakter"
            required
          />
          <FieldError messages={state.errors?.password} />
        </label>

        <label className={labelClass}>
          <LabelWithHint
            text="Peran"
            hint="Hak akses: Administrator (mengelola sistem dan transaksi), Viewer (hanya melihat)."
          />
          <select name="role" className={inputClass} defaultValue="VIEWER">
            <option value="ADMIN">Administrator</option>
            <option value="VIEWER">Viewer</option>
          </select>
          <FieldError messages={state.errors?.role} />
        </label>
      </div>

      <div className="flex justify-end rounded-b-md border-t border-gray-200 bg-gray-50/50 px-5 py-4">
        <Button type="submit" size="md" isLoading={pending}>
          {pending ? "Menyimpan..." : "Buat pengguna"}
        </Button>
      </div>
    </form>
  );
}
