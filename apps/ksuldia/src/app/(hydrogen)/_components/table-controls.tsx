"use client";

import { Button } from "@/components/ui/button";
import {
  PiDownloadSimpleBold,
  PiCaretUpBold,
  PiCaretDownBold,
  PiCaretUpDownBold,
} from "react-icons/pi";

interface TableControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onExport: () => void;
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
  exportLabel = "Export CSV",
}: TableControlsProps) {
  return (
    <div className="flex flex-col gap-4 border-t border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Entries Info & Page Size */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>Tampilkan</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-sm outline-none focus:border-teal-700"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>baris</span>
        </div>
        <span className="hidden sm:inline">•</span>
        <span>
          Menampilkan {startIndex} - {endIndex} dari {totalItems} data
        </span>
      </div>

      {/* Action and Navigation buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
        <Button
          size="sm"
          variant="primary-soft"
          onClick={onExport}
          className="border-teal-700 text-teal-700 hover:bg-teal-50"
        >
          <PiDownloadSimpleBold className="mr-1.5 h-4 w-4" />
          {exportLabel}
        </Button>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="neutral"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="border-gray-200 text-gray-700 disabled:opacity-50"
          >
            Sebelumnya
          </Button>
          <div className="px-2 text-sm font-medium text-gray-700">
            Halaman {currentPage} dari {totalPages}
          </div>
          <Button
            size="sm"
            variant="neutral"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="border-gray-200 text-gray-700 disabled:opacity-50"
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  );
}

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
      className={`inline-flex items-center gap-1 hover:text-gray-900 focus:outline-none ${className}`}
    >
      <span>{label}</span>
      {isSorted ? (
        activeDirection === "asc" ? (
          <PiCaretUpBold className="h-3 w-3 font-bold text-teal-700" />
        ) : (
          <PiCaretDownBold className="h-3 w-3 font-bold text-teal-700" />
        )
      ) : (
        <PiCaretUpDownBold className="h-3.5 w-3.5 text-gray-400 opacity-60" />
      )}
    </button>
  );
}
