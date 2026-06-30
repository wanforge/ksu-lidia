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

  const memberNo = String(member.no).padStart(4, "0");
  const qrValue = `KSU-LIDIA:${memberNo}:${member.id}`;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        {/* Modal header */}
        <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Cetak ID Card Anggota</h3>
            <p className="mt-0.5 text-xs text-gray-500">Pratinjau sebelum cetak</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
          >
            <PiXBold className="h-5 w-5" />
          </button>
        </div>

        {/* Preview area */}
        <div className="flex justify-center rounded-xl bg-gray-100 px-8 py-10 shadow-inner">
          {/* Card — CR80 ratio 85.6×54mm, scaled ~3× */}
          <div
            ref={printRef}
            className="relative flex h-[220px] w-[350px] flex-col overflow-hidden rounded-2xl shadow-2xl print:rounded-none print:shadow-none"
          >
            {/* ── Header band ── */}
            <div
              className="relative flex shrink-0 items-center justify-between px-5 py-3"
              style={{
                background: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 60%, #b91c1c 100%)",
              }}
            >
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-red-200">
                  Koperasi Serba Usaha
                </p>
                <p className="text-lg font-black leading-none tracking-tight text-white">
                  KSU LIDIA
                </p>
              </div>
              <div className="rounded-md border border-red-400/50 bg-white/10 px-2.5 py-1 backdrop-blur-sm">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white">
                  Kartu Anggota
                </p>
              </div>
            </div>

            {/* ── Body ── */}
            <div
              className="flex flex-1 gap-3 px-5 py-4"
              style={{
                background: "linear-gradient(160deg, #ffffff 0%, #fef2f2 100%)",
              }}
            >
              {/* Left: member info */}
              <div className="flex flex-1 flex-col justify-between">
                <div className="space-y-2.5">
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-widest text-gray-400">
                      No. Anggota
                    </p>
                    <p className="font-mono text-xl font-black leading-none tracking-wider text-red-800">
                      {memberNo}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-widest text-gray-400">
                      Nama Lengkap
                    </p>
                    <p className="text-sm font-bold leading-tight text-gray-900">
                      {member.name}
                    </p>
                  </div>
                  {member.phone && (
                    <div>
                      <p className="text-[8px] font-semibold uppercase tracking-widest text-gray-400">
                        No. Telepon
                      </p>
                      <p className="text-[10px] font-medium text-gray-700">
                        {member.phone}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom tagline */}
                <p className="text-[8px] font-medium italic text-red-400">
                  Gotong Royong Membangun Kesejahteraan
                </p>
              </div>

              {/* Right: QR */}
              <div className="flex shrink-0 flex-col items-center justify-center gap-1.5">
                <div className="rounded-lg border border-red-100 bg-white p-2 shadow-sm">
                  <QRCode
                    value={qrValue}
                    size={72}
                    level="M"
                    fgColor="#7f1d1d"
                  />
                </div>
                <p className="text-[7px] font-medium text-gray-400">Scan untuk verifikasi</p>
              </div>
            </div>

            {/* ── Footer strip ── */}
            <div
              className="shrink-0 px-5 py-1.5"
              style={{
                background: "linear-gradient(90deg, #7f1d1d 0%, #b91c1c 100%)",
              }}
            >
              <p className="text-[7px] font-medium tracking-widest text-red-200/80">
                KSU LIDIA • KARTU KEANGGOTAAN RESMI
              </p>
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
