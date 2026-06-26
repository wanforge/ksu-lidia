import { getSession } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import fs from "fs/promises";
import path from "path";
import MasterWorkspace from "./master-workspace";

export const dynamic = "force-dynamic";

export default async function MasterConfigPage() {
  const session = await getSession();

  // Only Admin can configure master rules
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return (
      <div className="mx-auto w-full max-w-[900px] rounded-md border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800">
        Hanya administrator yang memiliki wewenang untuk merubah konfigurasi master KSU Lidia.
      </div>
    );
  }

  // Read config from file
  const configPath = path.join(process.cwd(), "src/config/cooperative.json");
  let config = {
    interestRate: 1.0,
    provisionRate: 1.0,
    crkRate: 10.0,
    penaltyRate: 5.0,
    minPokok: 100000,
    wajibMonthly: 10000,
    cooperativeName: "KSU Lidia GKJ Manahan",
    cooperativeAddress: "Jl. Adi Sucipto No. 12, Manahan, Surakarta, Jawa Tengah",
  };

  try {
    const raw = await fs.readFile(configPath, "utf-8");
    config = JSON.parse(raw);
  } catch (e) {
    console.error("Gagal membaca file konfigurasi master:", e);
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 border-b border-gray-200 pb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-red-700">
            Administrasi & Pengaturan
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl">
            Pengaturan Master Koperasi
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Atur parameter dasar koperasi: persentase bunga pinjaman bulanan, potongan biaya provisi pencairan, cadangan resiko kredit (CRK), iuran wajib bulanan, dan identitas lembaga.
          </p>
        </div>
      </section>

      <MasterWorkspace config={config} />
    </div>
  );
}
