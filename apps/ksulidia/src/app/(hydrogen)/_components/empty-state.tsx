import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  PiTrayDuotone,
  PiWarningCircleDuotone,
  PiXCircleDuotone,
  PiInfoDuotone,
} from "react-icons/pi";

export type EmptyStateTone = "default" | "warn" | "error" | "info";

const toneIcon: Record<EmptyStateTone, IconType> = {
  default: PiTrayDuotone,
  warn: PiWarningCircleDuotone,
  error: PiXCircleDuotone,
  info: PiInfoDuotone,
};

const toneIconClass: Record<EmptyStateTone, string> = {
  default: "text-gray-300",
  warn: "text-amber-400",
  error: "text-rose-400",
  info: "text-red-400",
};

type EmptyStateProps = {
  /** Big headline, e.g. "Belum ada data anggota". */
  title: string;
  /** Optional supporting line(s) under the title. */
  description?: ReactNode;
  /** Override the icon; defaults to a tone-appropriate icon. */
  icon?: IconType;
  /** Visual intent — controls the default icon & its color. */
  tone?: EmptyStateTone;
  /** Optional action (button/link) rendered below the text. */
  action?: ReactNode;
  className?: string;
};

/**
 * Centered, large empty/blank-content placeholder used across pages, tables,
 * and access guards so every "nothing here" state looks the same: a big icon,
 * a headline, and an optional description.
 */
export default function EmptyState({
  title,
  description,
  icon,
  tone = "default",
  action,
  className,
}: EmptyStateProps) {
  const Icon = icon ?? toneIcon[tone];
  return (
    <div
      className={`flex flex-col items-center justify-center px-5 py-14 text-center ${
        className ?? ""
      }`}
    >
      <Icon className={`h-14 w-14 ${toneIconClass[tone]}`} />
      <p className="mt-4 text-base font-semibold text-gray-900 md:text-lg">
        {title}
      </p>
      {description ? (
        <p className="mt-1.5 max-w-md text-sm leading-6 text-gray-500">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
