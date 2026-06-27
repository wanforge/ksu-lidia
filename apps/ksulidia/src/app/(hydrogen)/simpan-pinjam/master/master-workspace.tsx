"use client";

import { useActionState } from "react";
import {
  updateMasterConfigAction,
  MasterConfig,
  MasterActionState,
} from "./actions";
import {
  PiVaultDuotone,
  PiCoinsDuotone,
  PiInfoDuotone,
  PiHouseDuotone,
} from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { useActionFeedback } from "@/app/shared/use-action-feedback";

type MasterWorkspaceProps = {
  config: MasterConfig;
};

export default function MasterWorkspace({ config }: MasterWorkspaceProps) {
  const [state, dispatchAction] = useActionState<MasterActionState, FormData>(
    updateMasterConfigAction,
    { success: false, message: "" }
  );

  useActionFeedback(state);

  return (
    <form action={dispatchAction} className="w-full space-y-6">
      {/* 1. General Info Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
          <PiHouseDuotone className="h-5 w-5 text-red-700" />
          Informasi & Identitas Koperasi
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nama Koperasi
            </label>
            <input
              type="text"
              name="cooperativeName"
              defaultValue={config.cooperativeName}
              required
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500">
              Nama resmi Koperasi Simpan Usaha (KSU).
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Alamat Kantor Koperasi
            </label>
            <input
              type="text"
              name="cooperativeAddress"
              defaultValue={config.cooperativeAddress}
              required
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500">
              Alamat lengkap kantor pusat/operasional Koperasi.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Simpanan Settings Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
          <PiVaultDuotone className="h-5 w-5 text-amber-500" />
          Konfigurasi Simpanan Anggota
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Minimal Simpanan Pokok (Rp)
            </label>
            <input
              type="number"
              name="minPokok"
              defaultValue={config.minPokok}
              required
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500">
              Setoran wajib pertama saat mendaftar menjadi anggota.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Iuran Simpanan Wajib Bulanan (Rp)
            </label>
            <input
              type="number"
              name="wajibMonthly"
              defaultValue={config.wajibMonthly}
              required
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500">
              Setoran bulanan rutin anggota.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Pinjaman Settings Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
          <PiCoinsDuotone className="h-5 w-5 text-red-700" />
          Konfigurasi Pinjaman & Perkreditan
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Bunga Pinjaman (%)
            </label>
            <input
              type="number"
              step="0.01"
              name="interestRate"
              defaultValue={config.interestRate}
              required
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500">
              Bunga per bulan berjalan.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Biaya Provisi (%)
            </label>
            <input
              type="number"
              step="0.01"
              name="provisionRate"
              defaultValue={config.provisionRate}
              required
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500">
              Dipotong saat pencairan.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Cadangan Resiko Kredit (%)
            </label>
            <input
              type="number"
              step="0.01"
              name="crkRate"
              defaultValue={config.crkRate}
              required
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500">
              Cadangan resiko kredit (CRK).
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Denda Terlambat (%)
            </label>
            <input
              type="number"
              step="0.01"
              name="penaltyRate"
              defaultValue={config.penaltyRate}
              required
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500">
              Denda keterlambatan angsuran.
            </p>
          </div>
        </div>
      </div>

      {/* Info Warning */}
      <div className="text-amber-850 flex gap-3 rounded-xl border border-amber-100 bg-amber-50/50 p-4 text-sm">
        <PiInfoDuotone className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <span className="font-bold">Pemberitahuan Sistem:</span> Perubahan
          parameter di atas akan diterapkan pada perhitungan transaksi pinjaman
          baru dan pelaporan keuangan koperasi KSU Lidia GKJ Manahan di masa
          mendatang.
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button type="submit" size="md">
          Simpan Konfigurasi Master
        </Button>
      </div>
    </form>
  );
}
