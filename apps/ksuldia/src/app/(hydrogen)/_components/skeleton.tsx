import cn from "@core/utils/class-names";

/**
 * Skeleton primitives — pulse-animated placeholders. Compose into route-level
 * loading.tsx fallbacks so content has a consistent loading state.
 */

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200/80", className)}
      aria-hidden
    />
  );
}

/** Page header (eyebrow + title + subtitle). */
export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 border-b border-gray-200 pb-5">
      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
    </div>
  );
}

/** Row of stat cards — mirrors the real pages' `grid-cols-1 md:grid-cols-N`. */
const STAT_GRID: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
};

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  const gridClass = STAT_GRID[count] ?? "md:grid-cols-4";

  return (
    <div className={`grid grid-cols-1 gap-4 ${gridClass}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-md border border-gray-200 bg-white p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

/** Table with a header row + N body rows. */
export function TableSkeleton({
  rows = 8,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
      {/* filter bar */}
      <div className="flex flex-wrap gap-3 border-b border-gray-200 p-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-28" />
      </div>
      {/* header */}
      <div className="flex gap-4 border-b border-gray-200 bg-gray-50 px-3 py-2">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 flex-1" />
        ))}
      </div>
      {/* rows */}
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-3 py-2.5">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton
                key={c}
                className={cn("h-4 flex-1", c === 0 && "max-w-[40%]")}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Generic content card block. */
export function CardSkeleton({ lines = 6 }: { lines?: number }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-5">
      <Skeleton className="h-5 w-40" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

/** Standard list page: header + stat cards + table. */
export function ListPageSkeleton({
  stats = 4,
  columns = 5,
}: {
  stats?: number;
  columns?: number;
}) {
  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeaderSkeleton />
      <StatCardsSkeleton count={stats} />
      <TableSkeleton columns={columns} />
    </div>
  );
}
