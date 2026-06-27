"use client";

import React from "react";

function SkeletonCard({
  children,
  className,
  icon,
  title,
  badge,
}: {
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col rounded-md border border-gray-200 bg-white animate-pulse${className ? ` ${className}` : ""}`}
    >
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
        {icon ? (
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-200 text-gray-300">
            {icon}
          </span>
        ) : (
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-200" />
        )}
        {title ? (
          <span className="flex-1 text-sm font-semibold text-gray-300">
            {title}
          </span>
        ) : (
          <span className="h-4 w-3/5 flex-1 rounded bg-gray-200" />
        )}
        {badge}
      </div>
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}

function SkeletonRow({
  className,
  valueClassName,
}: {
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 py-2 last:border-0${className ? ` ${className}` : ""}`}
    >
      <span
        className={`h-3 w-2/5 rounded bg-gray-200${valueClassName ? ` ${valueClassName}` : ""}`}
      />
      <span
        className={`h-3 w-1/4 rounded bg-gray-200${valueClassName ? ` ${valueClassName}` : ""}`}
      />
    </div>
  );
}

function SkeletonProgressBar({ className }: { className?: string }) {
  return (
    <div
      className={`mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200${className ? ` ${className}` : ""}`}
    />
  );
}

export { SkeletonCard, SkeletonRow, SkeletonProgressBar };
