"use client";

import type { ReactNode } from "react";
import { PiInfoBold } from "react-icons/pi";
import { Tooltip } from "rizzui";

/** Small info icon that reveals a field hint on hover/focus. */
export function FieldHint({ content }: { content: ReactNode }) {
  return (
    <Tooltip
      content={content}
      placement="top"
      size="sm"
      className="max-w-[260px] text-xs leading-5"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Penjelasan field"
        className="inline-flex text-gray-400 transition hover:text-gray-600"
      >
        <PiInfoBold className="h-3.5 w-3.5" />
      </button>
    </Tooltip>
  );
}

/**
 * Label text + hint icon, used as the first child of a <label>. Every form
 * field should pair its Title-Case label with a hint (project convention).
 */
export function LabelWithHint({
  text,
  hint,
}: {
  text: string;
  hint: ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5">
      {text}
      <FieldHint content={hint} />
    </span>
  );
}
