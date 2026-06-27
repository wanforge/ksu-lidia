import type { ComponentType } from "react";
import Link from "next/link";
import { PiArrowRightBold } from "react-icons/pi";
import cn from "@core/utils/class-names";

/**
 * Tappable shortcut card for the dashboard quick-actions grid.
 * Pure presentational: a styled next/link (keeps SPA routing), big icon,
 * short label + one-line hint. Teal is the primary brand accent.
 */
export type QuickActionTone = "teal" | "slate" | "amber" | "rose" | "blue";

const TONES: Record<QuickActionTone, { icon: string; ring: string }> = {
  teal: {
    icon: "border-red-200 bg-red-50 text-red-700",
    ring: "group-hover:border-red-400",
  },
  slate: {
    icon: "border-slate-200 bg-slate-50 text-slate-700",
    ring: "group-hover:border-slate-400",
  },
  amber: {
    icon: "border-amber-200 bg-amber-50 text-amber-700",
    ring: "group-hover:border-amber-400",
  },
  rose: {
    icon: "border-rose-200 bg-rose-50 text-rose-700",
    ring: "group-hover:border-rose-400",
  },
  blue: {
    icon: "border-blue-200 bg-blue-50 text-blue-700",
    ring: "group-hover:border-blue-400",
  },
};

type QuickActionProps = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  hint?: string;
  tone?: QuickActionTone;
};

export default function QuickAction({
  label,
  href,
  icon: Icon,
  hint,
  tone = "teal",
}: QuickActionProps) {
  const t = TONES[tone];
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-sm sm:flex-col sm:items-start sm:gap-3",
        t.ring
      )}
    >
      <span
        className={cn(
          "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition",
          t.icon
        )}
      >
        <Icon className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 text-sm font-semibold text-gray-900">
          {label}
          <PiArrowRightBold className="h-3.5 w-3.5 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-700" />
        </span>
        {hint ? (
          <span className="mt-0.5 block truncate text-xs text-gray-500">
            {hint}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
