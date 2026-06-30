"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PiDownloadSimpleDuotone,
  PiCaretUpBold,
  PiCaretDownBold,
  PiCaretUpDownBold,
  PiFileCsvDuotone,
  PiMicrosoftExcelLogoDuotone,
  PiFilePdfDuotone,
} from "react-icons/pi";
import { formatNumber } from "@/lib/format";

// ─── page number helpers ────────────────────────────────────────────────────

function getPageItems(
  current: number,
  total: number,
  sibling = 1
): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const left = Math.max(current - sibling, 2);
  const right = Math.min(current + sibling, total - 1);
  const items: (number | "…")[] = [1];
  if (left > 2) items.push("…");
  for (let p = left; p <= right; p++) items.push(p);
  if (right < total - 1) items.push("…");
  items.push(total);
  return items;
}

// ─── ExportMenu ─────────────────────────────────────────────────────────────

interface ExportMenuProps {
  onCsv: () => void;
  onExcel: () => void;
  onPdf: () => void;
  label?: string;
}

function ExportMenu({
  onCsv,
  onExcel,
  onPdf,
  label = "Export",
}: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Button
        size="sm"
        variant="primary-soft"
        onClick={() => setOpen((v) => !v)}
        className="border-red-200 text-red-700 hover:bg-red-50"
      >
        <PiDownloadSimpleDuotone className="h-4 w-4" />
        {label}
        <PiCaretDownBold className="h-3 w-3 opacity-60" />
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {[
            { icon: PiFileCsvDuotone, label: "CSV", action: onCsv },
            {
              icon: PiMicrosoftExcelLogoDuotone,
              label: "Excel (.xlsx)",
              action: onExcel,
            },
            { icon: PiFilePdfDuotone, label: "PDF", action: onPdf },
          ].map(({ icon: Icon, label: lbl, action }) => (
            <button
              key={lbl}
              type="button"
              onClick={() => {
                action();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <Icon className="h-4 w-4 text-gray-500" />
              {lbl}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TableControls ───────────────────────────────────────────────────────────

interface TableControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  /** CSV export callback (legacy compat) */
  onExport?: () => void;
  /** If provided, export dropdown shows CSV/Excel/PDF */
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  exportLabel?: string;
}

export function TableControls({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onPageSizeChange,
  onExport,
  onExportExcel,
  onExportPdf,
  exportLabel = "Export",
}: TableControlsProps) {
  const pageItems = getPageItems(currentPage, totalPages);

  const btnBase =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-xs font-semibold transition";
  const btnEnabled =
    "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50";
  const btnDisabled = "pointer-events-none border-gray-200 text-gray-300";
  const btnActive = "border-red-700 bg-red-700 text-white";

  return (
    <div className="flex flex-col gap-4 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: page size + info */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>Tampilkan</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs font-semibold text-gray-700 outline-none transition focus:border-red-700"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>baris</span>
        </div>
        <span className="hidden text-gray-300 sm:inline">•</span>
        <span>
          <span className="font-semibold text-gray-900">
            {formatNumber(startIndex)}
          </span>
          –
          <span className="font-semibold text-gray-900">
            {formatNumber(endIndex)}
          </span>{" "}
          dari{" "}
          <span className="font-semibold text-gray-900">
            {formatNumber(totalItems)}
          </span>
        </span>
      </div>

      {/* Right: export + pagination */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Export */}
        {onExport && onExportExcel && onExportPdf ? (
          <ExportMenu
            label={exportLabel}
            onCsv={onExport}
            onExcel={onExportExcel}
            onPdf={onExportPdf}
          />
        ) : onExport ? (
          <Button
            size="sm"
            variant="primary-soft"
            onClick={onExport}
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            <PiDownloadSimpleDuotone className="h-4 w-4" />
            {exportLabel}
          </Button>
        ) : null}

        {/* Page numbers */}
        {totalPages > 1 && (
          <nav
            className="flex items-center gap-1"
            aria-label="Navigasi halaman"
          >
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className={`${btnBase} ${currentPage <= 1 ? btnDisabled : btnEnabled}`}
              aria-label="Sebelumnya"
            >
              ‹
            </button>

            {pageItems.map((item, idx) =>
              item === "…" ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="inline-flex h-8 min-w-8 items-center justify-center px-1 text-xs text-gray-400"
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => onPageChange(item as number)}
                  aria-current={item === currentPage ? "page" : undefined}
                  className={`${btnBase} ${item === currentPage ? btnActive : btnEnabled}`}
                >
                  {item}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={`${btnBase} ${currentPage >= totalPages ? btnDisabled : btnEnabled}`}
              aria-label="Berikutnya"
            >
              ›
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}

// ─── SortableHeader ──────────────────────────────────────────────────────────

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  activeSortKey: string | null;
  activeDirection: "asc" | "desc" | null;
  onSort: (key: any) => void;
  className?: string;
}

export function SortableHeader({
  label,
  sortKey,
  activeSortKey,
  activeDirection,
  onSort,
  className = "",
}: SortableHeaderProps) {
  const isSorted = activeSortKey === sortKey;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`group inline-flex items-center gap-1.5 transition-colors hover:text-gray-900 focus:outline-none ${isSorted ? "text-gray-900" : ""} ${className}`}
    >
      <span>{label}</span>
      {isSorted ? (
        activeDirection === "asc" ? (
          <PiCaretUpBold className="h-3 w-3 text-red-700" />
        ) : (
          <PiCaretDownBold className="h-3 w-3 text-red-700" />
        )
      ) : (
        <PiCaretUpDownBold className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-400" />
      )}
    </button>
  );
}
