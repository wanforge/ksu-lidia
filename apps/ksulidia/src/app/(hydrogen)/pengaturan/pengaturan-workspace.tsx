"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PiStorefrontDuotone, PiCoinsDuotone, PiFloppyDiskDuotone } from "react-icons/pi";
import { useActionState } from "react";
import { useActionFeedback } from "@/app/shared/use-action-feedback";
import { updateSettingsAction, closeBookAction } from "./actions";
import { SystemSettings } from "@/lib/settings";

export default function PengaturanWorkspace({ initialSettings }: { initialSettings: SystemSettings }) {
  const [state, formAction] = useActionState(updateSettingsAction, {
    success: false,
    message: "",
  });

  useActionFeedback(state);

  return (
    <div className="mx-auto w-full max-w-4xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <form action={formAction} className="space-y-8">
        {/* Profil Koperasi */}
        <section>
          <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
            <PiStorefrontDuotone className="h-6 w-6 text-red-700" />
            <h2 className="text-lg font-bold text-gray-900">Profil Koperasi</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="col-span-full">
              <label className="mb-1 block text-sm font-semibold text-gray-800">Nama Koperasi</label>
              <input
                type="text"
                name="name"
                defaultValue={initialSettings.profile.name}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none transition focus:border-red-700"
                required
              />
            </div>
            <div className="col-span-full">
              <label className="mb-1 block text-sm font-semibold text-gray-800">Alamat Lengkap</label>
              <textarea
                name="address"
                defaultValue={initialSettings.profile.address}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-red-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-800">Nomor Telepon</label>
              <input
                type="text"
                name="phone"
                defaultValue={initialSettings.profile.phone}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none transition focus:border-red-700"
              />
            </div>
          </div>
        </section>

        {/* Parameter Finansial */}
        <section>
          <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
            <PiCoinsDuotone className="h-6 w-6 text-red-700" />
            <h2 className="text-lg font-bold text-gray-900">Parameter Finansial Dasar</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-800">Bunga Pinjaman (%)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  name="defaultInterestRate"
                  defaultValue={initialSettings.financial.defaultInterestRate}
                  className="h-10 w-full rounded-md border border-gray-300 px-3 pr-8 text-sm outline-none transition focus:border-red-700"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-800">Denda Keterlambatan (%)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  name="defaultPenaltyRate"
                  defaultValue={initialSettings.financial.defaultPenaltyRate}
                  className="h-10 w-full rounded-md border border-gray-300 px-3 pr-8 text-sm outline-none transition focus:border-red-700"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-800">Biaya Admin (Rp)</label>
              <input
                type="number"
                name="adminFee"
                defaultValue={initialSettings.financial.adminFee}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none transition focus:border-red-700"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <Button type="submit" className="bg-red-700 text-white hover:bg-red-800">
            <PiFloppyDiskDuotone className="mr-2 h-5 w-5" />
            Simpan Pengaturan
          </Button>
        </div>
      </form>

      {/* Tutup Buku */}
      <section className="mt-12 border-t border-gray-200 pt-8">
        <div className="mb-4 flex items-center gap-2">
          <PiFloppyDiskDuotone className="h-6 w-6 text-red-700" />
          <h2 className="text-lg font-bold text-gray-900">Tutup Buku Tahunan</h2>
        </div>
        <p className="mb-4 text-sm text-gray-600">
          Proses tutup buku akan menghitung Sisa Hasil Usaha (SHU) tahunan secara sederhana dan mencatat log tutup buku. Fitur ini masih dalam tahap simulasi.
        </p>
        <form action={async () => {
          const res = await closeBookAction();
          if (res.success) {
            alert(res.message);
          } else {
            alert(res.message);
          }
        }}>
          <Button type="submit" variant="outline" className="border-red-700 text-red-700 hover:bg-red-50">
            Jalankan Tutup Buku
          </Button>
        </form>
      </section>
    </div>
  );
}
