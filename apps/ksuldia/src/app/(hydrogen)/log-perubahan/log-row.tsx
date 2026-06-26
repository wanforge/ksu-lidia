"use client";

import { useState } from "react";
import { PiCaretRightBold } from "react-icons/pi";
import { Button } from "@/components/ui/button";

type DiffEntry = { from: unknown; to: unknown };

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

export type LogRowData = {
  id: string;
  createdAtLabel: string;
  model: string;
  recordId: string | null;
  rowCountLabel: string | null;
  operation: string;
  operationLabel: string;
  operationToneClass: string;
  actorLabel: string;
  diff: unknown;
  before: unknown;
  after: unknown;
  payload: unknown;
  correlationId: string | null;
  correlationHref: string | null;
};

const cell = "px-4 py-2.5 align-top";

// ── Split git-style diff (before | after) ─────────────────────────────────────

function SplitDiff({
  diff,
  before,
  after,
  operation,
}: Pick<LogRowData, "diff" | "before" | "after" | "operation">) {
  // UPDATE — side-by-side before/after per field
  if (diff && typeof diff === "object" && Object.keys(diff).length > 0) {
    const entries = Object.entries(diff as Record<string, DiffEntry>);
    return (
      <div className="overflow-hidden rounded-md border border-gray-200 font-mono text-[11px] leading-relaxed">
        <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-50 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
          <div className="px-2 py-1">Sebelum</div>
          <div className="border-l border-gray-200 px-2 py-1">Sesudah</div>
        </div>
        {entries.map(([field, change], i) => (
          <div key={field} className={i > 0 ? "border-t border-gray-200" : ""}>
            <div className="bg-gray-50/70 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
              {field}
            </div>
            <div className="grid grid-cols-2">
              <div className="flex gap-1.5 bg-rose-50 px-2 py-1 text-rose-700">
                <span className="select-none font-bold text-rose-400">-</span>
                <span className="whitespace-pre-wrap break-all">
                  {formatValue(change?.from)}
                </span>
              </div>
              <div className="flex gap-1.5 border-l border-gray-200 bg-emerald-50 px-2 py-1 text-emerald-700">
                <span className="select-none font-bold text-emerald-500">
                  +
                </span>
                <span className="whitespace-pre-wrap break-all">
                  {formatValue(change?.to)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // CREATE — all fields as additions
  if (operation.startsWith("create") || operation === "upsert") {
    if (after && typeof after === "object") {
      const entries = Object.entries(after as Record<string, unknown>).filter(
        ([, v]) => v !== null && v !== undefined
      );
      if (entries.length > 0) {
        return (
          <div className="overflow-hidden rounded-md border border-emerald-200 font-mono text-[11px] leading-relaxed">
            {entries.map(([field, value], i) => (
              <div
                key={field}
                className={`flex gap-1.5 bg-emerald-50 px-2 py-1 text-emerald-700 ${i > 0 ? "border-t border-emerald-100" : ""}`}
              >
                <span className="select-none font-bold text-emerald-500">
                  +
                </span>
                <span className="shrink-0 font-semibold text-gray-400">
                  {field}:
                </span>
                <span className="whitespace-pre-wrap break-all">
                  {formatValue(value)}
                </span>
              </div>
            ))}
          </div>
        );
      }
    }
  }

  // DELETE — all fields as deletions
  if (operation.startsWith("delete")) {
    if (before && typeof before === "object") {
      const entries = Object.entries(before as Record<string, unknown>).filter(
        ([, v]) => v !== null && v !== undefined
      );
      if (entries.length > 0) {
        return (
          <div className="overflow-hidden rounded-md border border-rose-200 font-mono text-[11px] leading-relaxed">
            {entries.map(([field, value], i) => (
              <div
                key={field}
                className={`flex gap-1.5 bg-rose-50 px-2 py-1 text-rose-700 ${i > 0 ? "border-t border-rose-100" : ""}`}
              >
                <span className="select-none font-bold text-rose-400">-</span>
                <span className="shrink-0 font-semibold text-gray-400">
                  {field}:
                </span>
                <span className="whitespace-pre-wrap break-all">
                  {formatValue(value)}
                </span>
              </div>
            ))}
          </div>
        );
      }
    }
  }

  return (
    <p className="text-[11px] text-gray-400">Tidak ada rincian perubahan.</p>
  );
}

// ── Row (summary + full-width expandable detail) ──────────────────────────────

export default function LogRow({ row }: { row: LogRowData }) {
  const [open, setOpen] = useState(false);

  const fieldCount =
    row.diff && typeof row.diff === "object" ? Object.keys(row.diff).length : 0;

  return (
    <>
      <tr className="align-top">
        <td className={`${cell} whitespace-nowrap text-gray-600`}>
          {row.createdAtLabel}
        </td>
        <td className={`${cell} font-medium text-gray-900`}>
          {row.model}
          {row.recordId ? (
            <p className="mt-0.5 text-xs text-gray-400">{row.recordId}</p>
          ) : null}
          {row.rowCountLabel ? (
            <p className="mt-0.5 text-xs text-gray-400">{row.rowCountLabel}</p>
          ) : null}
        </td>
        <td className={cell}>
          <span
            className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${row.operationToneClass}`}
          >
            {row.operationLabel}
          </span>
        </td>
        <td className={`${cell} text-gray-700`}>{row.actorLabel}</td>
        <td className={cell}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-500">
              {fieldCount > 0 ? (
                <>{fieldCount} field diubah</>
              ) : row.operation.startsWith("create") ? (
                <span className="text-teal-700">Data baru</span>
              ) : row.operation.startsWith("delete") ? (
                <span className="text-rose-700">Data dihapus</span>
              ) : (
                "—"
              )}
            </span>
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => setOpen((v) => !v)}
            >
              <PiCaretRightBold
                className={`h-3 w-3 transition-transform ${open ? "rotate-90" : ""}`}
              />
              {open ? "Tutup" : "Detail"}
            </Button>
          </div>
        </td>
      </tr>

      {open ? (
        <tr>
          <td
            colSpan={5}
            className="border-t border-gray-100 bg-gray-50/40 px-4 py-3"
          >
            <SplitDiff
              diff={row.diff}
              before={row.before}
              after={row.after}
              operation={row.operation}
            />
            <details className="mt-2">
              <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-gray-400 hover:text-gray-600">
                Payload mentah
                {row.correlationHref ? (
                  <>
                    {" · "}
                    <a
                      href={row.correlationHref}
                      className="font-mono normal-case text-teal-700 underline hover:text-teal-900"
                    >
                      aksi {row.correlationId?.slice(0, 8)}
                    </a>
                  </>
                ) : null}
              </summary>
              <pre className="mt-1 overflow-x-auto rounded-md bg-white p-2 text-[11px] text-gray-700">
                {JSON.stringify(row.payload, null, 2)}
              </pre>
            </details>
          </td>
        </tr>
      ) : null}
    </>
  );
}
