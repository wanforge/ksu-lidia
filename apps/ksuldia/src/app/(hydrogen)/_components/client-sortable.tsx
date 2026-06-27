"use client";

import { useMemo, useState } from "react";
import {
  PiArrowUpBold,
  PiArrowDownBold,
  PiArrowsDownUpBold,
} from "react-icons/pi";
import cn from "@core/utils/class-names";

export type SortDir = "asc" | "desc";

function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") {
    return a === b ? 0 : a ? 1 : -1;
  }
  return String(a).localeCompare(String(b), "id", { numeric: true });
}

/**
 * Client-side sorting for tables whose rows are already loaded in memory
 * (small datasets, e.g. master reference, trash). Sort by a row key or a
 * custom accessor.
 */
export function useClientSort<T>(
  rows: T[],
  options?: {
    initialKey?: keyof T | null;
    initialDir?: SortDir;
    accessors?: Partial<Record<keyof T, (row: T) => unknown>>;
  }
) {
  const [key, setKey] = useState<keyof T | null>(options?.initialKey ?? null);
  const [dir, setDir] = useState<SortDir>(options?.initialDir ?? "asc");

  const sorted = useMemo(() => {
    if (!key) return rows;
    const accessor = options?.accessors?.[key];
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = accessor ? accessor(a) : a[key];
      const bv = accessor ? accessor(b) : b[key];
      const result = compare(av, bv);
      return dir === "asc" ? result : -result;
    });
    return copy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, key, dir]);

  function requestSort(k: keyof T) {
    if (k === key) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setKey(k);
      setDir("asc");
    }
  }

  return { sorted, sortKey: key, sortDir: dir, requestSort };
}

type ClientSortHeaderProps = {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
  align?: "left" | "right" | "center";
};

/** A <th> with a sort toggle for client-sorted tables. */
export function ClientSortHeader({
  label,
  active,
  dir,
  onClick,
  className,
  align = "left",
}: ClientSortHeaderProps) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500",
        align === "right"
          ? "text-right"
          : align === "center"
            ? "text-center"
            : "text-left",
        className
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "group inline-flex items-center gap-1.5 transition-colors hover:text-gray-900",
          align === "right" && "flex-row-reverse",
          active && "text-gray-900"
        )}
      >
        {label}
        {active ? (
          dir === "asc" ? (
            <PiArrowUpBold className="h-3 w-3" />
          ) : (
            <PiArrowDownBold className="h-3 w-3" />
          )
        ) : (
          <PiArrowsDownUpBold className="h-3 w-3 text-gray-300 group-hover:text-gray-400" />
        )}
      </button>
    </th>
  );
}
