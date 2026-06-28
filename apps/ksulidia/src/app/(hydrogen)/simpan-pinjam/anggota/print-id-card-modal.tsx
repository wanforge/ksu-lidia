"use client";

import { useRef } from "react";
import QRCode from "react-qr-code";
import { useReactToPrint } from "react-to-print";
import { PiPrinterDuotone, PiXBold } from "react-icons/pi";
import { Button } from "@/components/ui/button";

interface MemberWithAccounts {
  id: string;
  no: number;
  name: string;
  phone: string | null;
  address: string | null;
}

interface PrintIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberWithAccounts | null;
}

export function PrintIdCardModal({
  isOpen,
  onClose,
  member,
}: PrintIdCardModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef: printRef });

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Cetak ID Card Anggota
          </h3>
          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
          >
            <PiXBold className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Area Container */}
        <div className="flex justify-center rounded-xl bg-gray-50 p-8 shadow-inner">
          <div
            ref={printRef}
            className="flex h-[200px] w-[320px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg print:border-gray-300 print:shadow-none"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
            }}
          >
            {/* Red strip on the left */}
            <div className="w-4 shrink-0 bg-red-700"></div>

            <div className="flex w-full flex-col p-4">
              <div className="flex items-start justify-between border-b border-gray-200 pb-2">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-800">
                    Koperasi Serba Usaha
                  </h4>
                  <h2 className="text-sm font-black text-gray-900">
                    KSU LIDIA
                  </h2>
                </div>
                <div className="rounded-md bg-red-50 px-2 py-0.5">
                  <span className="text-[10px] font-bold text-red-700">
                    ANGGOTA
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-1 items-center gap-4">
                <div className="flex-1 space-y-1.5">
                  <div>
                    <p className="text-[8px] font-semibold uppercase text-gray-400">
                      Nomor RAT
                    </p>
                    <p className="font-mono text-xs font-bold text-gray-900">
                      {String(member.no).padStart(4, "0")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-semibold uppercase text-gray-400">
                      Nama Lengkap
                    </p>
                    <p className="text-sm font-bold leading-tight text-gray-900">
                      {member.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-semibold uppercase text-gray-400">
                      Nomor Telepon
                    </p>
                    <p className="text-[10px] text-gray-700">
                      {member.phone || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-white p-1.5 shadow-sm">
                  <QRCode
                    value={`KSU-${member.no}-${member.id}`}
                    size={64}
                    level="Q"
                    className="h-16 w-16"
                  />
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
            Cetak ID Card
          </Button>
        </div>
      </div>
    </div>
  );
}
