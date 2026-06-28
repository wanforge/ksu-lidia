"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { PiPrinterDuotone, PiXBold } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { ProductTxType } from "@prisma/client";

interface PrintStrukModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
}

export function PrintStrukModal({
  isOpen,
  onClose,
  transaction,
}: PrintStrukModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef: printRef });

  if (!isOpen || !transaction) return null;

  const isSale = transaction.type === ProductTxType.SALE;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Cetak Struk Transaksi
          </h3>
          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
          >
            <PiXBold className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Area Container */}
        <div className="flex justify-center rounded-xl bg-gray-50 p-4 shadow-inner">
          <div
            ref={printRef}
            className="w-full bg-white p-4 font-mono text-[11px] leading-tight text-gray-900 shadow-lg print:shadow-none"
            style={{ width: "58mm", minHeight: "100px", margin: "0 auto" }}
          >
            {/* Header */}
            <div className="mb-4 text-center">
              <h2 className="text-sm font-bold">KSU LIDIA</h2>
              <p>Jl. Contoh Alamat No. 123</p>
              <p>Telp: (021) 1234567</p>
              <div className="mt-2 border-b border-dashed border-gray-900"></div>
            </div>

            {/* Meta */}
            <div className="mb-4 space-y-1">
              <div className="flex justify-between">
                <span>Tgl:</span>
                <span>
                  {new Intl.DateTimeFormat("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(transaction.date))}
                </span>
              </div>
              <div className="flex justify-between">
                <span>No:</span>
                <span>{transaction.id.split("-")[0].toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tipe:</span>
                <span>
                  {isSale
                    ? "PENJUALAN"
                    : transaction.type === ProductTxType.PURCHASE
                      ? "PEMBELIAN"
                      : "PENYESUAIAN"}
                </span>
              </div>
              {transaction.notes && (
                <div className="flex justify-between">
                  <span>Ket:</span>
                  <span className="max-w-[120px] truncate">
                    {transaction.notes}
                  </span>
                </div>
              )}
              <div className="mt-2 border-b border-dashed border-gray-900"></div>
            </div>

            {/* Items */}
            <div className="mb-4 space-y-2">
              {transaction.items.map((item: any) => (
                <div key={item.id}>
                  <div>{item.product.name}</div>
                  <div className="flex justify-between">
                    <span>
                      {item.quantity} x {formatNumber(Number(item.unitPrice))}
                    </span>
                    <span>{formatNumber(Number(item.totalPrice))}</span>
                  </div>
                </div>
              ))}
              <div className="mt-2 border-b border-dashed border-gray-900"></div>
            </div>

            {/* Totals */}
            <div className="mb-6 space-y-1">
              <div className="flex justify-between text-[12px] font-bold">
                <span>TOTAL:</span>
                <span>Rp {formatNumber(transaction.totalAmountVal)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p>Terima Kasih</p>
              <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</p>
              <div className="mt-4 border-b border-dashed border-gray-900"></div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="neutral" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={() => reactToPrintFn()} className="gap-2">
            <PiPrinterDuotone className="h-5 w-5" />
            Cetak Struk (58mm)
          </Button>
        </div>
      </div>
    </div>
  );
}
