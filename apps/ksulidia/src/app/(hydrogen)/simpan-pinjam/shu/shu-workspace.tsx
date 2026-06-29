"use client";

import React, { useActionState, useMemo, useState } from "react";
import { calculateAndSaveShuAction, ShuActionState } from "./actions";
import { utils, writeFile } from "xlsx";
import {
  PiCalculatorDuotone,
  PiMicrosoftExcelLogoDuotone,
  PiDownloadSimpleBold,
  PiFloppyDiskDuotone,
  PiWarningDuotone,
} from "react-icons/pi";

type MemberShu = {
  id: string;
  no: number;
  name: string;
  year: number;
  shuSimpanan: any;
  shuPinjaman: any;
  totalShu: any;
};

type ShuWorkspaceProps = {
  currentYear: number;
  existingYears: number[];
  distributions: MemberShu[];
  selectedYear: number;
  totalSimpanan: number;
  totalPinjaman: number;
};

const formatIDR = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);

export default function ShuWorkspace({
  currentYear,
  existingYears,
  distributions,
  selectedYear,
  totalSimpanan,
  totalPinjaman,
}: ShuWorkspaceProps) {
  const [viewYear, setViewYear] = useState(selectedYear);
  const [inputYear, setInputYear] = useState(currentYear);
  const [totalShuSimpanan, setTotalShuSimpanan] = useState("");
  const [totalShuPinjaman, setTotalShuPinjaman] = useState("");

  const [state, formAction, isPending] = useActionState<ShuActionState, FormData>(
    calculateAndSaveShuAction,
    { success: false, message: "" }
  );

  const filtered = useMemo(
    () => distributions.filter((d) => d.year === viewYear),
    [distributions, viewYear]
  );

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, d) => ({
          shuSimpanan: acc.shuSimpanan + Number(d.shuSimpanan),
          shuPinjaman: acc.shuPinjaman + Number(d.shuPinjaman),
          totalShu: acc.totalShu + Number(d.totalShu),
        }),
        { shuSimpanan: 0, shuPinjaman: 0, totalShu: 0 }
      ),
    [filtered]
  );

  // Preview kalkulasi sebelum simpan
  const previewRows = useMemo(() => {
    const tSimpanan = parseFloat(totalShuSimpanan) || 0;
    const tPinjaman = parseFloat(totalShuPinjaman) || 0;
    if (tSimpanan === 0 && tPinjaman === 0) return [];
    return distributions
      .filter((d) => d.year === inputYear)
      .map((d) => ({
        ...d,
        preview: true,
        shuSimpanan: totalSimpanan > 0 ? (Number(d.shuSimpanan) / totalSimpanan) * tSimpanan : 0,
        shuPinjaman: totalPinjaman > 0 ? (Number(d.shuPinjaman) / totalPinjaman) * tPinjaman : 0,
        totalShu:
          totalSimpanan > 0
            ? (Number(d.shuSimpanan) / totalSimpanan) * tSimpanan +
              (totalPinjaman > 0 ? (Number(d.shuPinjaman) / totalPinjaman) * tPinjaman : 0)
            : 0,
      }));
  }, [distributions, inputYear, totalShuSimpanan, totalShuPinjaman, totalSimpanan, totalPinjaman]);

  const handleExport = () => {
    if (filtered.length === 0) return;
    const ws = utils.json_to_sheet(
      filtered.map((d, i) => ({
        No: i + 1,
        "No. Anggota": d.no,
        Nama: d.name,
        "SHU Simpanan (Rp)": Number(d.shuSimpanan),
        "SHU Pinjaman (Rp)": Number(d.shuPinjaman),
        "Total SHU (Rp)": Number(d.totalShu),
      }))
    );
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, `SHU_${viewYear}`);
    writeFile(wb, `SHU_KSU_Lidia_${viewYear}.xlsx`);
  };

  const years = Array.from({ length: 8 }, (_, i) => currentYear - 3 + i);

  return (
    <div className="space-y-6">
      {/* Kalkulasi Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
          <PiCalculatorDuotone className="h-5 w-5 text-red-700" />
          Hitung SHU Tahunan
        </h2>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Tahun
              </label>
              <select
                name="year"
                value={inputYear}
                onChange={(e) => setInputYear(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Total Dana SHU Simpanan (Rp)
              </label>
              <input
                type="number"
                name="totalShuSimpanan"
                value={totalShuSimpanan}
                onChange={(e) => setTotalShuSimpanan(e.target.value)}
                placeholder="cth: 5000000"
                min={0}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Total Dana SHU Pinjaman (Rp)
              </label>
              <input
                type="number"
                name="totalShuPinjaman"
                value={totalShuPinjaman}
                onChange={(e) => setTotalShuPinjaman(e.target.value)}
                placeholder="cth: 3000000"
                min={0}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
              />
            </div>
          </div>

          {state.message && (
            <div
              className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${
                state.success
                  ? "bg-green-50 text-green-800"
                  : "bg-rose-50 text-rose-800"
              }`}
            >
              {!state.success && <PiWarningDuotone className="h-4 w-4 shrink-0" />}
              {state.message}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
            >
              <PiFloppyDiskDuotone className="h-4 w-4" />
              {isPending ? "Memproses..." : "Hitung & Simpan SHU"}
            </button>
            <span className="text-xs text-gray-500">
              Akan menimpa data SHU {inputYear} jika sudah ada.
            </span>
          </div>
        </form>
      </div>

      {/* Tabel Distribusi */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Tahun:</span>
            <select
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-red-600 focus:outline-none"
            >
              {existingYears.length > 0 ? (
                existingYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))
              ) : (
                <option value={currentYear}>{currentYear}</option>
              )}
            </select>
            {filtered.length > 0 && (
              <span className="text-sm text-gray-500">{filtered.length} anggota</span>
            )}
          </div>
          {filtered.length > 0 && (
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <PiMicrosoftExcelLogoDuotone className="h-4 w-4 text-green-600" />
              <PiDownloadSimpleBold className="h-3.5 w-3.5" />
              Export Excel
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-400">
            Belum ada data SHU untuk tahun {viewYear}.
            <br />
            Gunakan form di atas untuk menghitung SHU.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-red-800 text-xs font-bold uppercase text-white">
                <tr>
                  <th className="px-4 py-3.5 text-center">No</th>
                  <th className="px-4 py-3.5 text-left">Nama Anggota</th>
                  <th className="px-4 py-3.5 text-right">SHU Simpanan</th>
                  <th className="px-4 py-3.5 text-right">SHU Pinjaman</th>
                  <th className="px-4 py-3.5 text-right">Total SHU</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center text-gray-500">{d.no}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                    <td className="px-4 py-3 text-right">{formatIDR(Number(d.shuSimpanan))}</td>
                    <td className="px-4 py-3 text-right">{formatIDR(Number(d.shuPinjaman))}</td>
                    <td className="px-4 py-3 text-right font-bold text-red-800">
                      {formatIDR(Number(d.totalShu))}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold text-gray-900">
                  <td colSpan={2} className="px-4 py-3.5">TOTAL</td>
                  <td className="px-4 py-3.5 text-right">{formatIDR(totals.shuSimpanan)}</td>
                  <td className="px-4 py-3.5 text-right">{formatIDR(totals.shuPinjaman)}</td>
                  <td className="px-4 py-3.5 text-right text-red-800">
                    {formatIDR(totals.totalShu)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
