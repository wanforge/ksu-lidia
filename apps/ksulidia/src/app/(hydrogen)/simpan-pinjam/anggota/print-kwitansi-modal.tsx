"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { PiPrinterDuotone, PiXBold } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { SavingsTxType } from "@prisma/client";

interface PrintKwitansiModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
  member: any;
}

export function PrintKwitansiModal({
  isOpen,
  onClose,
  transaction,
  member,
}: PrintKwitansiModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef: printRef });

  if (!isOpen || !transaction || !member) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Cetak Kwitansi Transaksi
          </h3>
          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
          >
            <PiXBold className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Area Container */}
        <div className="flex justify-center rounded-xl bg-gray-50 p-4 shadow-inner md:p-8">
          <div
            ref={printRef}
            className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-lg print:border-gray-300 print:shadow-none"
            style={{ width: "210mm", minHeight: "99mm", margin: "0 auto" }}
          >
            {/* Header Kwitansi */}
            <div className="mb-6 flex items-start justify-between border-b-2 border-gray-800 pb-4">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
                  Koperasi Serba Usaha LIDIA
                </h1>
                <p className="mt-1 text-xs text-gray-600">
                  Jl. Contoh Alamat Koperasi No. 123, Kota Anda
                  <br />
                  Telp: (021) 1234567 | Email: info@ksulidia.com
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-light uppercase tracking-widest text-gray-400">
                  Kwitansi
                </h2>
                <p className="mt-2 text-sm font-semibold text-gray-700">
                  No. Ref:{" "}
                  <span className="font-mono text-red-700">
                    {transaction.id.split("-")[0].toUpperCase()}
                  </span>
                </p>
              </div>
            </div>

            {/* Content Kwitansi */}
            <div className="space-y-4">
              <div className="flex">
                <div className="w-48 text-sm font-semibold text-gray-600">
                  Telah terima dari
                </div>
                <div className="flex-1 border-b border-dashed border-gray-400 px-2 font-bold text-gray-900">
                  {transaction.type === SavingsTxType.DEPOSIT
                    ? member.name
                    : "KSU LIDIA"}
                </div>
              </div>

              <div className="flex">
                <div className="w-48 text-sm font-semibold text-gray-600">
                  Uang Sejumlah
                </div>
                <div className="flex-1 rounded bg-gray-100 p-2 font-mono text-lg font-bold text-gray-900">
                  Rp {formatNumber(Number(transaction.amount))}
                </div>
              </div>

              <div className="flex">
                <div className="w-48 text-sm font-semibold text-gray-600">
                  Untuk Pembayaran
                </div>
                <div className="flex-1 border-b border-dashed border-gray-400 px-2 font-medium text-gray-900">
                  {transaction.type === SavingsTxType.DEPOSIT
                    ? "Setoran"
                    : "Penarikan"}{" "}
                  {transaction.savingsType} - {member.name} (No. Anggota:{" "}
                  {member.no})
                  {transaction.description && ` (${transaction.description})`}
                </div>
              </div>
            </div>

            {/* Footer Kwitansi */}
            <div className="mt-12 flex justify-between">
              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-600">Penyetor / Penerima</p>
                <div className="mt-16 w-40 border-b border-gray-400 text-center">
                  {transaction.type === SavingsTxType.DEPOSIT
                    ? member.name
                    : "......................."}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-600">
                  {new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "long",
                  }).format(new Date(transaction.date))}
                </p>
                <p className="text-sm text-gray-600">Petugas Koperasi</p>
                <div className="mt-12 w-40 border-b border-gray-400 text-center font-semibold text-gray-800">
                  {transaction.processedBy?.name || "......................."}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="neutral" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={() => reactToPrintFn()} className="gap-2">
            <PiPrinterDuotone className="h-5 w-5" />
            Cetak Kwitansi
          </Button>
        </div>
      </div>
    </div>
  );
}
