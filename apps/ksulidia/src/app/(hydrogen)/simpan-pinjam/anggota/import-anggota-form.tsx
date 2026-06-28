"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PiUploadSimpleDuotone, PiFileXDuotone } from "react-icons/pi";
import * as XLSX from "xlsx";
import { importMembersAction } from "./actions";
import { useActionState } from "react";
import { useActionFeedback } from "@/app/shared/use-action-feedback";

type ParsedMember = {
  no: string;
  name: string;
  phone?: string;
  address?: string;
};

export function ImportAnggotaForm({ onSuccess }: { onSuccess: () => void }) {
  const [parsedData, setParsedData] = useState<ParsedMember[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const [state, formAction] = useActionState(importMembersAction, {
    success: false,
    message: "",
  });

  useActionFeedback(state, () => {
    if (state.success) {
      setParsedData([]);
      onSuccess();
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const mapped: ParsedMember[] = data
          .map((row: any) => ({
            no: String(row.no || row.No || row.Nomor || "").trim(),
            name: String(row.name || row.Name || row.Nama || "").trim(),
            phone: row.phone || row.Phone || row.Telepon || row.NoHP || "",
            address: row.address || row.Address || row.Alamat || "",
          }))
          .filter((m) => m.no && m.name);

        setParsedData(mapped);
      } catch (err) {
        console.error(err);
        alert("Gagal memproses file Excel/CSV.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isProcessing}
          />
          <label
            htmlFor="file-upload"
            className="inline-flex cursor-pointer flex-col items-center gap-2 text-gray-500 transition hover:text-red-700"
          >
            <PiUploadSimpleDuotone className="h-10 w-10 text-gray-400" />
            <span className="font-semibold text-gray-900">
              {isProcessing ? "Memproses..." : "Klik untuk Upload File"}
            </span>
            <span className="text-sm">Mendukung format .xlsx, .xls, .csv</span>
          </label>
          <div className="mt-4 inline-block rounded-md bg-gray-50 p-4 text-left text-xs text-gray-500">
            <p className="mb-1 font-bold">Panduan Format Kolom:</p>
            <ul className="list-disc space-y-1 pl-4">
              <li>
                <b>no</b> atau <b>Nomor</b> (wajib)
              </li>
              <li>
                <b>name</b> atau <b>Nama</b> (wajib)
              </li>
              <li>
                <b>phone</b> atau <b>Telepon</b> atau <b>NoHP</b> (opsional)
              </li>
              <li>
                <b>address</b> atau <b>Alamat</b> (opsional)
              </li>
            </ul>
          </div>
        </div>

        {parsedData.length > 0 && (
          <div className="rounded-lg border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h3 className="font-semibold text-gray-900">
                Preview Data ({parsedData.length} baris)
              </h3>
              <button
                type="button"
                onClick={() => setParsedData([])}
                className="text-gray-500 hover:text-red-700"
              >
                <PiFileXDuotone className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto p-4 text-sm">
              <table className="w-full text-left">
                <thead className="bg-white">
                  <tr>
                    <th className="pb-2 font-medium text-gray-500">Nomor</th>
                    <th className="pb-2 font-medium text-gray-500">Nama</th>
                    <th className="pb-2 font-medium text-gray-500">Telepon</th>
                    <th className="pb-2 font-medium text-gray-500">Alamat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {parsedData.slice(0, 50).map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-2 pr-2">{row.no}</td>
                      <td className="py-2 pr-2">{row.name}</td>
                      <td className="py-2 pr-2">{row.phone}</td>
                      <td className="py-2 pr-2">{row.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.length > 50 && (
                <div className="mt-2 text-center text-xs text-gray-500">
                  Menampilkan 50 baris pertama dari {parsedData.length} total
                  baris.
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <form action={formAction} className="flex justify-end gap-3">
                <input
                  type="hidden"
                  name="membersJson"
                  value={JSON.stringify(parsedData)}
                />
                <Button
                  variant="neutral"
                  onClick={() => setParsedData([])}
                  type="button"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-red-700 text-white hover:bg-red-800"
                >
                  Impor {parsedData.length} Anggota
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
