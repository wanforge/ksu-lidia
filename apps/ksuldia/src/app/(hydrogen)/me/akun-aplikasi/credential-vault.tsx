"use client";

import { Fragment, useActionState, useState, useEffect } from "react";
import { notify } from "@/app/shared/notify";
import {
  PiPencilSimpleDuotone,
  PiTrashSimpleDuotone,
  PiEyeDuotone,
  PiEyeSlashDuotone,
  PiPlusBold,
  PiXBold,
  PiCheckBold,
  PiCopyDuotone,
  PiLinkDuotone,
  PiCaretDownBold,
} from "react-icons/pi";
import {
  createCredentialAction,
  updateCredentialAction,
  deleteCredentialAction,
  type VaultActionState,
} from "./actions";
import { Button } from "@/components/ui/button";

export const CREDENTIAL_CATEGORIES = [
  { value: "sistem_koperasi", label: "Sistem Koperasi" },
  { value: "email", label: "Email / Komunikasi" },
  { value: "jaringan", label: "Jaringan / WiFi" },
  { value: "keuangan", label: "Keuangan" },
  { value: "lainnya", label: "Lainnya" },
] as const;

export type CredentialItem = {
  id: string;
  name: string;
  category: string;
  loginUrl: string | null;
  username: string | null;
  password: string; // already decrypted by server
  notes: string | null; // already decrypted by server
};

function CategoryBadge({ category }: { category: string }) {
  const cat = CREDENTIAL_CATEGORIES.find((c) => c.value === category);
  const label = cat?.label ?? category;
  return (
    <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
      {label}
    </span>
  );
}

function PasswordCell({ password }: { password: string }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-[13px] text-gray-900">
        {visible ? password : "•".repeat(Math.min(password.length, 12))}
      </span>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="text-gray-400 hover:text-gray-700"
        title={visible ? "Sembunyikan" : "Tampilkan"}
      >
        {visible ? (
          <PiEyeSlashDuotone className="h-4 w-4" />
        ) : (
          <PiEyeDuotone className="h-4 w-4" />
        )}
      </button>
      <button
        type="button"
        onClick={copy}
        className="text-gray-400 hover:text-gray-700"
        title="Salin password"
      >
        {copied ? (
          <PiCheckBold className="h-4 w-4 text-teal-600" />
        ) : (
          <PiCopyDuotone className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

type FormMode = { type: "add" } | { type: "edit"; credential: CredentialItem };

function CredentialForm({
  mode,
  onCancel,
}: {
  mode: FormMode;
  onCancel: () => void;
}) {
  const isEdit = mode.type === "edit";
  const credential = isEdit ? mode.credential : null;

  const action = isEdit ? updateCredentialAction : createCredentialAction;
  const [state, formAction, pending] = useActionState<
    VaultActionState,
    FormData
  >(action, {});

  useEffect(() => {
    if (state.success) {
      notify.success(
        isEdit ? "Kredensial diperbarui." : "Kredensial ditambahkan."
      );
      onCancel();
    } else if (state.error) {
      notify.error(state.error);
    }
  }, [state, isEdit, onCancel]);

  return (
    <form
      action={formAction}
      className="rounded-md border border-teal-200 bg-teal-50/40 p-4"
    >
      {isEdit && (
        <input type="hidden" name="credentialId" value={credential!.id} />
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">
            Nama Sistem / Aplikasi <span className="text-rose-500">*</span>
          </label>
          <input
            name="name"
            required
            defaultValue={credential?.name ?? ""}
            placeholder="Koperasi, WiFi Kantor, …"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">
            Kategori
          </label>
          <div className="relative">
            <select
              name="category"
              defaultValue={credential?.category ?? "lainnya"}
              className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {CREDENTIAL_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <PiCaretDownBold className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">
            Username / Email
          </label>
          <input
            name="username"
            defaultValue={credential?.username ?? ""}
            placeholder="user@koperasi.id"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">
            Password <span className="text-rose-500">*</span>
          </label>
          <input
            name="password"
            type="password"
            required
            autoComplete="new-password"
            defaultValue={credential?.password ?? ""}
            placeholder="••••••••"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-gray-700">
            URL Login (opsional)
          </label>
          <input
            name="loginUrl"
            type="url"
            defaultValue={credential?.loginUrl ?? ""}
            placeholder="https://ksulidia.gkjmanahan.or.id"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-gray-700">
            Catatan (opsional, terenkripsi)
          </label>
          <textarea
            name="notes"
            rows={2}
            defaultValue={credential?.notes ?? ""}
            placeholder="PIN, instruksi khusus, dll."
            className="w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {state.error && (
        <p className="mt-2 text-sm font-medium text-rose-600">{state.error}</p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <Button type="submit" size="md" isLoading={pending}>
          {!pending && <PiCheckBold className="h-4 w-4" />}
          {pending ? "Menyimpan…" : isEdit ? "Perbarui" : "Simpan"}
        </Button>
        <Button type="button" variant="neutral" size="md" onClick={onCancel}>
          <PiXBold className="h-3.5 w-3.5" />
          Batal
        </Button>
      </div>
    </form>
  );
}

function DeleteButton({ credentialId }: { credentialId: string }) {
  const [state, formAction, pending] = useActionState<
    VaultActionState,
    FormData
  >(deleteCredentialAction, {});
  const [confirm, setConfirm] = useState(false);

  if (!confirm) {
    return (
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="text-gray-400 hover:text-rose-600"
        title="Hapus"
      >
        <PiTrashSimpleDuotone className="h-4 w-4" />
      </button>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-1">
      <input type="hidden" name="credentialId" value={credentialId} />
      <span className="text-xs font-semibold text-rose-600">Hapus?</span>
      <Button type="submit" variant="danger" isLoading={pending}>
        Ya
      </Button>
      <Button type="button" variant="neutral" onClick={() => setConfirm(false)}>
        Batal
      </Button>
      {state.error && (
        <span className="text-xs text-rose-600">{state.error}</span>
      )}
    </form>
  );
}

export default function CredentialVault({
  credentials,
}: {
  credentials: CredentialItem[];
}) {
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("semua");

  const categories = [
    { value: "semua", label: "Semua" },
    ...CREDENTIAL_CATEGORIES.filter((c) =>
      credentials.some((cr) => cr.category === c.value)
    ),
  ];

  const filtered =
    activeCategory === "semua"
      ? credentials
      : credentials.filter((c) => c.category === activeCategory);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setActiveCategory(cat.value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                activeCategory === cat.value
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <Button
          type="button"
          size="md"
          onClick={() =>
            setFormMode(formMode?.type === "add" ? null : { type: "add" })
          }
        >
          <PiPlusBold className="h-4 w-4" />
          Tambah Akun
        </Button>
      </div>

      {formMode?.type === "add" && (
        <CredentialForm
          mode={{ type: "add" }}
          onCancel={() => setFormMode(null)}
        />
      )}

      {filtered.length === 0 && formMode?.type !== "add" ? (
        <div className="rounded-md border border-dashed border-gray-300 py-12 text-center">
          <p className="text-sm font-semibold text-gray-900">
            Belum ada akun tersimpan
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Klik &ldquo;Tambah Akun&rdquo; untuk menyimpan akun aplikasi pertama
            Anda.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-[13px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="min-w-[160px] px-3 py-2 text-left font-semibold text-gray-600">
                  Nama / Sistem
                </th>
                <th className="min-w-[120px] px-3 py-2 text-left font-semibold text-gray-600">
                  Username
                </th>
                <th className="min-w-[200px] px-3 py-2 text-left font-semibold text-gray-600">
                  Password
                </th>
                <th className="min-w-[100px] px-3 py-2 text-left font-semibold text-gray-600">
                  Kategori
                </th>
                <th className="px-3 py-2 text-right font-semibold text-gray-600">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.map((cred) => (
                <Fragment key={cred.id}>
                  <tr className="align-middle">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-950">
                          {cred.name}
                        </span>
                        {cred.loginUrl &&
                          /^https?:\/\//i.test(cred.loginUrl) && (
                            <a
                              href={cred.loginUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-teal-500 hover:text-teal-700"
                              title={cred.loginUrl}
                            >
                              <PiLinkDuotone className="h-3.5 w-3.5" />
                            </a>
                          )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-gray-700">
                      {cred.username || (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <PasswordCell password={cred.password} />
                    </td>
                    <td className="px-3 py-2.5">
                      <CategoryBadge category={cred.category} />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setFormMode(
                              formMode?.type === "edit" &&
                                formMode.credential.id === cred.id
                                ? null
                                : { type: "edit", credential: cred }
                            )
                          }
                          className="text-gray-400 hover:text-teal-600"
                          title="Edit"
                        >
                          <PiPencilSimpleDuotone className="h-4 w-4" />
                        </button>
                        <DeleteButton credentialId={cred.id} />
                      </div>
                    </td>
                  </tr>
                  {formMode?.type === "edit" &&
                    formMode.credential.id === cred.id && (
                      <tr>
                        <td colSpan={5} className="px-3 py-2">
                          <CredentialForm
                            mode={{ type: "edit", credential: cred }}
                            onCancel={() => setFormMode(null)}
                          />
                        </td>
                      </tr>
                    )}
                  {cred.notes && (
                    <tr className="bg-amber-50/50">
                      <td colSpan={5} className="px-3 pb-2.5 pt-0">
                        <p className="text-xs text-amber-800">
                          <span className="font-semibold">Catatan:</span>{" "}
                          {cred.notes}
                        </p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
