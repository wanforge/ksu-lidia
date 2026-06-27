import Link from "next/link";
import {
  PiCaretLeftBold,
  PiCaretRightBold,
  PiCaretDoubleLeftBold,
  PiCaretDoubleRightBold,
} from "react-icons/pi";
import { formatNumber } from "@/lib/format";

type PaginationProps = {
  basePath: string;
  currentPage: number;
  pageCount: number;
  total: number;
  pageSize: number;
  /** Query params to preserve across page links (filters, search). */
  params?: Record<string, string | undefined>;
  /** How many page numbers to show on each side of the current page. */
  siblingCount?: number;
};

function buildHref(
  basePath: string,
  params: Record<string, string | undefined>,
  page: number
) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  if (page > 1) query.set("page", String(page));
  const queryString = query.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

/**
 * Bootstrap-style page list with ellipsis. Always shows page 1 and the last
 * page; shows `siblingCount` pages on each side of the current page; collapses
 * the rest into "…".
 */
function getPageItems(
  current: number,
  pageCount: number,
  siblingCount: number
): (number | "ellipsis-left" | "ellipsis-right")[] {
  // Total slots: first + last + current + 2*siblings + 2 ellipsis
  const totalNumbers = siblingCount * 2 + 5;
  if (pageCount <= totalNumbers) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, pageCount);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < pageCount - 1;

  const items: (number | "ellipsis-left" | "ellipsis-right")[] = [1];

  if (showLeftEllipsis) {
    items.push("ellipsis-left");
  } else {
    for (let p = 2; p < leftSibling; p += 1) items.push(p);
  }

  for (let p = leftSibling; p <= rightSibling; p += 1) {
    if (p !== 1 && p !== pageCount) items.push(p);
  }

  if (showRightEllipsis) {
    items.push("ellipsis-right");
  } else {
    for (let p = rightSibling + 1; p < pageCount; p += 1) items.push(p);
  }

  items.push(pageCount);
  return items;
}

const baseBtn =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2.5 text-sm font-semibold transition";
const enabled =
  "border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50";
const disabled = "pointer-events-none border-gray-200 text-gray-300";
const activePage = "border-red-700 bg-red-700 text-white hover:bg-red-800";

export default function Pagination({
  basePath,
  currentPage,
  pageCount,
  total,
  pageSize,
  params = {},
  siblingCount = 1,
}: PaginationProps) {
  if (total === 0) return null;

  const firstRow = (currentPage - 1) * pageSize + 1;
  const lastRow = Math.min(currentPage * pageSize, total);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < pageCount;

  const pageItems = getPageItems(currentPage, pageCount, siblingCount);

  return (
    <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-600">
        Menampilkan{" "}
        <span className="font-semibold text-gray-900">
          {formatNumber(firstRow)}
        </span>
        –
        <span className="font-semibold text-gray-900">
          {formatNumber(lastRow)}
        </span>{" "}
        dari{" "}
        <span className="font-semibold text-gray-900">
          {formatNumber(total)}
        </span>{" "}
        data
      </p>

      <nav className="flex items-center gap-1" aria-label="Navigasi halaman">
        {/* First */}
        {hasPrev ? (
          <Link
            href={buildHref(basePath, params, 1)}
            className={`${baseBtn} ${enabled}`}
            aria-label="Halaman pertama"
          >
            <PiCaretDoubleLeftBold className="h-4 w-4" />
          </Link>
        ) : (
          <span className={`${baseBtn} ${disabled}`} aria-hidden>
            <PiCaretDoubleLeftBold className="h-4 w-4" />
          </span>
        )}

        {/* Prev */}
        {hasPrev ? (
          <Link
            href={buildHref(basePath, params, currentPage - 1)}
            className={`${baseBtn} ${enabled}`}
            rel="prev"
            aria-label="Sebelumnya"
          >
            <PiCaretLeftBold className="h-4 w-4" />
          </Link>
        ) : (
          <span className={`${baseBtn} ${disabled}`} aria-hidden>
            <PiCaretLeftBold className="h-4 w-4" />
          </span>
        )}

        {/* Numbered pages */}
        {pageItems.map((item) => {
          if (item === "ellipsis-left" || item === "ellipsis-right") {
            return (
              <span
                key={item}
                className="inline-flex h-9 min-w-9 items-center justify-center px-1 text-sm text-gray-400"
              >
                …
              </span>
            );
          }
          const isActive = item === currentPage;
          return (
            <Link
              key={item}
              href={buildHref(basePath, params, item)}
              aria-current={isActive ? "page" : undefined}
              className={`${baseBtn} ${isActive ? activePage : enabled}`}
            >
              {item}
            </Link>
          );
        })}

        {/* Next */}
        {hasNext ? (
          <Link
            href={buildHref(basePath, params, currentPage + 1)}
            className={`${baseBtn} ${enabled}`}
            rel="next"
            aria-label="Berikutnya"
          >
            <PiCaretRightBold className="h-4 w-4" />
          </Link>
        ) : (
          <span className={`${baseBtn} ${disabled}`} aria-hidden>
            <PiCaretRightBold className="h-4 w-4" />
          </span>
        )}

        {/* Last */}
        {hasNext ? (
          <Link
            href={buildHref(basePath, params, pageCount)}
            className={`${baseBtn} ${enabled}`}
            aria-label="Halaman terakhir"
          >
            <PiCaretDoubleRightBold className="h-4 w-4" />
          </Link>
        ) : (
          <span className={`${baseBtn} ${disabled}`} aria-hidden>
            <PiCaretDoubleRightBold className="h-4 w-4" />
          </span>
        )}
      </nav>
    </div>
  );
}
