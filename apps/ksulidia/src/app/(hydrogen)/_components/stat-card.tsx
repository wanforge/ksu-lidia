import type { ComponentType, ReactNode } from "react";
import cn from "@core/utils/class-names";

/**
 * Semantic colour tones for summary/stat cards so each metric reads at a glance:
 * neutral/slate = totals, teal = positive/done, amber = needs attention,
 * rose = problem/expired, blue = in-progress/info, violet = special/segment.
 */
export type StatTone =
  | "neutral"
  | "slate"
  | "teal"
  | "amber"
  | "rose"
  | "blue"
  | "violet";

const TONES: Record<
  StatTone,
  { card: string; label: string; value: string; icon: string }
> = {
  neutral: {
    card: "border-gray-200 bg-white",
    label: "text-gray-500",
    value: "text-gray-950",
    icon: "border-gray-200 bg-gray-50 text-gray-600",
  },
  slate: {
    card: "border-slate-200 bg-slate-50",
    label: "text-slate-600",
    value: "text-slate-900",
    icon: "border-slate-200 bg-white text-slate-700",
  },
  teal: {
    card: "border-red-200 bg-red-50/70",
    label: "text-red-700",
    value: "text-red-900",
    icon: "border-red-200 bg-white text-red-700",
  },
  amber: {
    card: "border-amber-200 bg-amber-50/70",
    label: "text-amber-700",
    value: "text-amber-900",
    icon: "border-amber-200 bg-white text-amber-700",
  },
  rose: {
    card: "border-rose-200 bg-rose-50/70",
    label: "text-rose-700",
    value: "text-rose-900",
    icon: "border-rose-200 bg-white text-rose-700",
  },
  blue: {
    card: "border-blue-200 bg-blue-50/70",
    label: "text-blue-700",
    value: "text-blue-900",
    icon: "border-blue-200 bg-white text-blue-700",
  },
  violet: {
    card: "border-violet-200 bg-violet-50/70",
    label: "text-violet-700",
    value: "text-violet-900",
    icon: "border-violet-200 bg-white text-violet-700",
  },
};

type StatCardProps = {
  label: string;
  value: ReactNode;
  tone?: StatTone;
  icon?: ComponentType<{ className?: string }>;
  hint?: ReactNode;
  /** Compact variant for tight header clusters (smaller padding + value). */
  compact?: boolean;
  className?: string;
};

export default function StatCard({
  label,
  value,
  tone = "neutral",
  icon: Icon,
  hint,
  compact = false,
  className,
}: StatCardProps) {
  const t = TONES[tone];
  return (
    <div
      className={cn(
        "rounded-md border",
        t.card,
        compact ? "px-4 py-3 text-center" : "p-5",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2",
          compact ? "justify-center" : "justify-between"
        )}
      >
        <p className={cn("text-sm font-medium", t.label)}>{label}</p>
        {Icon && !compact ? (
          <span
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md border",
              t.icon
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "font-bold",
          t.value,
          compact ? "mt-1 text-lg" : "mt-3 text-3xl"
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className={cn("text-xs", compact ? "mt-0.5" : "mt-1", t.label)}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
