"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  PiArrowUpBold,
  PiArrowDownBold,
  PiArrowsDownUpBold,
} from "react-icons/pi";
import cn from "@core/utils/class-names";

type SortableHeaderProps = {
  /** Sort key written to ?sort= (must be in the page's allow-list). */
  field: string;
  label: string;
  className?: string;
  align?: "left" | "right" | "center";
};

/**
 * Clickable column header for server-rendered tables. Toggles ?sort/?dir in the
 * URL (resetting ?page) so the server re-queries with the new order. Pair with
 * `parseSort` (src/lib/table-query.ts) on the page side.
 */
export default function SortableHeader({
  field,
  label,
  className,
  align = "left",
}: SortableHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const activeSort = params.get("sort");
  const activeDir = params.get("dir") === "asc" ? "asc" : "desc";
  const isActive = activeSort === field;

  function toggle() {
    const next = new URLSearchParams(params.toString());
    if (isActive) {
      next.set("dir", activeDir === "asc" ? "desc" : "asc");
    } else {
      next.set("sort", field);
      next.set("dir", "asc");
    }
    next.delete("page"); // kembali ke halaman 1 saat sort berubah
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <th
      className={cn(
        "px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500",
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
        onClick={toggle}
        className={cn(
          "group inline-flex items-center gap-1.5 transition-colors hover:text-gray-900",
          align === "right" && "flex-row-reverse",
          isActive && "text-gray-900"
        )}
        aria-label={`Urutkan berdasarkan ${label}`}
      >
        {label}
        {isActive ? (
          activeDir === "asc" ? (
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
