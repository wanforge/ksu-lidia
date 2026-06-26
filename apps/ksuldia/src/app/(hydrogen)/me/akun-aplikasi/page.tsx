import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { decryptCredential } from "@/lib/credential-crypto";
import { can, PERMISSIONS } from "@/lib/authz";
import { routes } from "@/config/routes";
import {
  PiVaultDuotone,
  PiShieldCheckDuotone,
  PiWarningDuotone,
} from "react-icons/pi";
import CredentialVault, { type CredentialItem } from "./credential-vault";

export const dynamic = "force-dynamic";

export default async function VaultPage() {
  const session = await getSession();

  if (!session?.user) redirect(routes.signIn);
  if (!can(session.user.role, PERMISSIONS.VAULT_VIEW)) notFound();

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      credentialSalt: true,
      accountCredentials: {
        where: { deletedAt: null },
        orderBy: [{ category: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          category: true,
          loginUrl: true,
          username: true,
          passwordEnc: true,
          notesEnc: true,
        },
      },
    },
  });

  if (!user) redirect(routes.signIn);

  const salt = user.credentialSalt;

  const credentials: CredentialItem[] = (user.accountCredentials ?? []).map(
    (cred) => {
      let password = "";
      let notes: string | null = null;
      if (salt) {
        try {
          password = decryptCredential(cred.passwordEnc, userId, salt);
        } catch {
          password = "[Tidak dapat didekripsi]";
        }
        if (cred.notesEnc) {
          try {
            notes = decryptCredential(cred.notesEnc, userId, salt);
          } catch {
            notes = null;
          }
        }
      } else {
        password = "[Kunci belum diinisialisasi]";
      }
      return {
        id: cred.id,
        name: cred.name,
        category: cred.category,
        loginUrl: cred.loginUrl,
        username: cred.username,
        password,
        notes,
      };
    }
  );

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 border-b border-gray-200 pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">
            Portal Pegawai
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl">
            Akun Aplikasi
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Simpan username dan password aplikasi kerja Anda (SIMRS, presensi,
            kepegawaian, WiFi, dll.). Semua data tersimpan terenkripsi dan hanya
            bisa diakses oleh Anda.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
            <PiShieldCheckDuotone className="h-4 w-4" />
            Terenkripsi AES-256-GCM
          </span>
        </div>
      </section>

      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <span className="font-semibold">
          <PiWarningDuotone className="mb-0.5 me-1 inline h-4 w-4" />
          Catatan keamanan:
        </span>{" "}
        Data ini hanya dapat diakses melalui akun Anda yang aktif. Jangan
        bagikan password akun Anda kepada siapapun. Saat password akun diubah,
        semua data vault akan dienkripsi ulang secara otomatis.
      </div>

      <section className="rounded-md border border-gray-200 bg-white p-5">
        <div className="mb-5 flex items-center gap-3 border-b border-gray-200 pb-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-teal-200 bg-teal-50 text-teal-800">
            <PiVaultDuotone className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-gray-950">
              Daftar Akun Tersimpan
            </h2>
            <p className="text-xs text-gray-500">
              {credentials.length === 0
                ? "Belum ada akun — klik Tambah Akun untuk mulai"
                : `${credentials.length} akun tersimpan`}
            </p>
          </div>
        </div>

        <CredentialVault credentials={credentials} />
      </section>
    </div>
  );
}
