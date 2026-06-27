import type { FormHTMLAttributes, ReactNode } from "react";
import { PiMagnifyingGlassBold } from "react-icons/pi";
import cn from "@core/utils/class-names";

/**
 * Shared filter-bar primitives so every table filter looks identical: a single
 * flex-wrap row of labelled fields that grows the search box and keeps selects /
 * date pickers at a sensible fixed width, with the actions pinned to the end.
 *
 * All of these are server-safe (presentational only). Date inputs use the
 * client `DateField` component (see ./date-field).
 */

/** Shared control look for native <input>/<select> used inside a FilterField. */
export const filterControlClass =
  "h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-700";

export const filterSubmitClass =
  "inline-flex h-10 items-center rounded-md bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-800";

export const filterResetClass =
  "inline-flex h-10 items-center rounded-md border border-gray-300 px-3 text-sm font-semibold text-gray-700 transition hover:border-gray-500";

export function FilterBar({
  children,
  className,
  ...props
}: FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form
      className={cn(
        "flex flex-wrap items-end gap-3 border-b border-gray-200 p-4",
        className
      )}
      {...props}
    >
      {children}
    </form>
  );
}

export function FilterField({
  label,
  htmlFor,
  grow,
  className,
  children,
}: {
  label?: string;
  htmlFor?: string;
  /** Let this field expand to fill leftover space (use for the search box). */
  grow?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5",
        grow ? "min-w-[220px] flex-1" : "min-w-[160px]",
        className
      )}
    >
      {label ? (
        <label htmlFor={htmlFor} className="text-xs font-medium text-gray-500">
          {label}
        </label>
      ) : null}
      {children}
    </div>
  );
}

export function FilterActions({ children }: { children: ReactNode }) {
  return <div className="flex items-end gap-2">{children}</div>;
}

/** Search box with a leading magnifier icon, styled like the other controls. */
export function SearchInput({
  name,
  id,
  defaultValue,
  placeholder,
}: {
  name: string;
  id?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <PiMagnifyingGlassBold className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        id={id}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={cn(filterControlClass, "pl-9")}
      />
    </div>
  );
}
