"use client";

import { useActionState } from "react";
import { updateMasterConfigAction, MasterConfig, MasterActionState } from "./actions";
import { PiVaultDuotone, PiCoinsDuotone, PiInfoDuotone, PiHouseDuotone } from "react-icons/pi";
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
    <form action={dispatchAction} className="space-y-6 max-w-4xl">
      {/* 1. General Info Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
          <PiHouseDuotone className="h-5 w-5 text-red-800" />
          Informasi & Identitas Koperasi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Koperasi</label>
            <input
              type="text"
              name="cooperativeName"
              defaultValue={config.cooperativeName}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Kantor Koperasi</label>
            <input
              type="text"
              name="cooperativeAddress"
              defaultValue={config.cooperativeAddress}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
            />
          </div>
        </div>
      </div>

      {/* 2. Simpanan Settings Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
          <PiVaultDuotone className="h-5 w-5 text-amber-500" />
          Konfigurasi Simpanan Anggota
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimal Simpanan Pokok (Rp)</label>
            <input
              type="number"
              name="minPokok"
              defaultValue={config.minPokok}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
            />
            <p className="text-xs text-gray-500 mt-1">Setoran wajib pertama saat mendaftar menjadi anggota.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Iuran Simpanan Wajib Bulanan (Rp)</label>
            <input
              type="number"
              name="wajibMonthly"
              defaultValue={config.wajibMonthly}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
            />
            <p className="text-xs text-gray-500 mt-1">Setoran bulanan rutin anggota.</p>
          </div>
        </div>
      </div>

      {/* 3. Pinjaman Settings Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
          <PiCoinsDuotone className="h-5 w-5 text-red-800" />
          Konfigurasi Pinjaman & Perkreditan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bunga Pinjaman (%)</label>
            <input
              type="number"
              step="0.01"
              name="interestRate"
              defaultValue={config.interestRate}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
            />
            <p className="text-xs text-gray-500 mt-1">Bunga per bulan berjalan.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Provisi (%)</label>
            <input
              type="number"
              step="0.01"
              name="provisionRate"
              defaultValue={config.provisionRate}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
            />
            <p className="text-xs text-gray-500 mt-1">Dipotong saat pencairan.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cad. Resiko Kredit (%)</label>
            <input
              type="number"
              step="0.01"
              name="crkRate"
              defaultValue={config.crkRate}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
            />
            <p className="text-xs text-gray-500 mt-1">Cadangan resiko kredit (CRK).</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Denda Terlambat (%)</label>
            <input
              type="number"
              step="0.01"
              name="penaltyRate"
              defaultValue={config.penaltyRate}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
            />
            <p className="text-xs text-gray-500 mt-1">Denda keterlambatan angsuran.</p>
          </div>
        </div>
      </div>

      {/* Info Warning */}
      <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 flex gap-3 text-sm text-amber-850">
        <PiInfoDuotone className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
        <div>
          <span className="font-bold">Pemberitahuan Sistem:</span> Perubahan parameter di atas akan diterapkan pada perhitungan transaksi pinjaman baru dan pelaporan keuangan koperasi KSU Lidia GKJ Manahan di masa mendatang.
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          className="bg-red-800 text-white hover:bg-red-900 shadow-md font-semibold px-6 py-2.5"
        >
          Simpan Konfigurasi Master
        </Button>
      </div>
    </form>
  );
}
