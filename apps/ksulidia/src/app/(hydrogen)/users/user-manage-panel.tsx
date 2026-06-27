"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  deleteUserAction,
  issuePasswordResetLinkAction,
  resetUserPasswordAction,
  updateUserAction,
} from "./actions";
import { initialUserActionState } from "./action-state";

import ToggleSwitch from "@/app/(hydrogen)/_components/toggle-switch";
import { LabelWithHint } from "@/app/(hydrogen)/_components/field-hint";
import { confirmDelete } from "@/app/shared/confirm";
import { useActionFeedback } from "@/app/shared/use-action-feedback";
import { Button } from "@/components/ui/button";

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

type UserManagePanelProps = {
  user: ManagedUser;
  isSelf: boolean;
};

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Administrator" },
  { value: "VIEWER", label: "Viewer" },
];

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-700";
const labelClass =
  "block text-xs font-semibold uppercase tracking-wide text-gray-500";
const cardClass = "rounded-md border border-gray-200 bg-gray-50/60 p-4";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p className="mt-1 text-xs font-medium text-rose-700">{messages[0]}</p>
  );
}

function StateMessage({
  success,
  message,
}: {
  success: boolean;
  message: string;
}) {
  if (!message) return null;
  return (
    <p
      className={
        success
          ? "text-xs font-medium text-red-700"
          : "text-xs font-medium text-rose-700"
      }
    >
      {message}
    </p>
  );
}

function formatDateTime(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function UserManagePanel({
  user,
  isSelf,
}: UserManagePanelProps) {
  const router = useRouter();

  const [editState, editAction, editPending] = useActionState(
    updateUserAction,
    initialUserActionState
  );
  const [resetState, resetAction, resetPending] = useActionState(
    resetUserPasswordAction,
    initialUserActionState
  );
  const [linkState, linkAction, linkPending] = useActionState(
    issuePasswordResetLinkAction,
    initialUserActionState
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteUserAction,
    initialUserActionState
  );

  // Toast (sukses hijau + audio / gagal merah) lalu refresh untuk tiap aksi.
  useActionFeedback(editState, () => router.refresh());
  useActionFeedback(resetState, () => router.refresh());
  useActionFeedback(deleteState, () => router.refresh());
  // Link reset menampilkan URL sekali pakai di UI; cukup refresh tanpa toast
  // ganda (pesan suksesnya sudah berupa kartu link di bawah).
  useEffect(() => {
    if (linkState.success) router.refresh();
  }, [linkState.success, router]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {/* Edit akun */}
      <form action={editAction} className={cardClass}>
        <input type="hidden" name="userId" value={user.id} />
        <h4 className="mb-3 text-sm font-semibold text-gray-900">Ubah akun</h4>
        <div className="space-y-3">
          <label className={labelClass}>
            <LabelWithHint
              text="Nama"
              hint="Nama lengkap pemilik akun untuk identifikasi di sistem."
            />
            <input
              name="name"
              defaultValue={user.name}
              className={inputClass}
              disabled={editPending}
            />
            <FieldError messages={editState.errors?.name} />
          </label>
          <label className={labelClass}>
            <LabelWithHint
              text="Peran"
              hint="Hak akses akun. Menurunkan atau menonaktifkan administrator aktif terakhir atau akun sendiri tidak diizinkan."
            />
            {/* Hidden input preserves role value when select is disabled (self-edit). */}
            {isSelf ? (
              <input type="hidden" name="role" value={user.role} />
            ) : null}
            <select
              name={isSelf ? undefined : "role"}
              defaultValue={user.role}
              className={inputClass}
              disabled={editPending || isSelf}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <FieldError messages={editState.errors?.role} />
          </label>

          {/* When editing own account the toggle is display-only; a hidden
              input preserves the current value so the form still submits it. */}
          {isSelf && user.isActive ? (
            <input type="hidden" name="isActive" value="on" />
          ) : null}
          <ToggleSwitch
            name={isSelf ? undefined : "isActive"}
            defaultChecked={user.isActive}
            disabled={editPending || isSelf}
            label="Akun aktif"
          />
          {isSelf ? (
            <p className="text-xs text-gray-400">
              Peran dan status aktif akun sendiri tidak dapat diubah di sini.
            </p>
          ) : null}
          <StateMessage
            success={editState.success}
            message={editState.message}
          />
          <Button
            type="submit"
            size="md"
            isLoading={editPending}
            className="w-full"
          >
            {editPending ? "Menyimpan..." : "Simpan perubahan"}
          </Button>
        </div>
      </form>

      {/* Reset password */}
      <form action={resetAction} className={cardClass}>
        <input type="hidden" name="userId" value={user.id} />
        <h4 className="mb-3 text-sm font-semibold text-gray-900">
          Atur ulang kata sandi langsung
        </h4>
        <div className="space-y-3">
          <label className={labelClass}>
            <LabelWithHint
              text="Kata Sandi Baru"
              hint="Minimal 8 karakter. Mengganti kata sandi secara langsung akan mencabut tautan atur ulang yang aktif."
            />
            <input
              name="password"
              type="password"
              className={inputClass}
              disabled={resetPending}
            />
            <FieldError messages={resetState.errors?.password} />
          </label>
          <StateMessage
            success={resetState.success}
            message={resetState.message}
          />
          <Button
            type="submit"
            variant="neutral"
            size="md"
            isLoading={resetPending}
            className="w-full"
          >
            {resetPending ? "Menyimpan..." : "Ganti kata sandi"}
          </Button>
        </div>
      </form>

      {/* Link + delete */}
      <div className={cardClass}>
        <h4 className="mb-3 text-sm font-semibold text-gray-900">
          Tautan atur ulang dan hapus
        </h4>
        <div className="space-y-3">
          <form action={linkAction} className="space-y-2">
            <input type="hidden" name="userId" value={user.id} />
            <label className={labelClass}>
              <LabelWithHint
                text="Masa Berlaku Tautan"
                hint="Lama tautan atur ulang sekali pakai berlaku. Membuat tautan baru mencabut tautan sebelumnya."
              />
              <select
                name="ttlHours"
                className={inputClass}
                defaultValue="24"
                disabled={linkPending}
              >
                <option value="6">6 jam</option>
                <option value="24">24 jam</option>
                <option value="72">3 hari</option>
                <option value="168">7 hari</option>
              </select>
            </label>
            {linkState.resetLink ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
                <p className="text-xs font-medium text-red-800">
                  Aktif sampai {formatDateTime(linkState.expiresAt)}
                </p>
                <input
                  readOnly
                  value={linkState.resetLink}
                  className="mt-2 w-full rounded-md border border-red-200 bg-white px-2 py-1 text-xs text-red-900"
                />
              </div>
            ) : (
              <StateMessage
                success={linkState.success}
                message={linkState.message}
              />
            )}
            <Button
              type="submit"
              variant="neutral"
              size="md"
              isLoading={linkPending}
              className="w-full"
            >
              {linkPending ? "Menerbitkan..." : "Terbitkan tautan sekali pakai"}
            </Button>
          </form>

          <form action={deleteAction} className="border-t border-gray-200 pt-3">
            <input type="hidden" name="userId" value={user.id} />
            <Button
              variant="danger-soft"
              size="md"
              isLoading={deletePending}
              disabled={isSelf}
              onClick={async (event) => {
                const form = event.currentTarget.form;
                if (await confirmDelete(`pengguna ${user.name}`)) {
                  form?.requestSubmit();
                }
              }}
              className="w-full"
            >
              {deletePending ? "Menghapus..." : "Hapus pengguna"}
            </Button>
            {isSelf ? (
              <p className="mt-1 text-xs text-gray-400">
                Tidak dapat menghapus akun sendiri.
              </p>
            ) : null}
            <StateMessage
              success={deleteState.success}
              message={deleteState.message}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
