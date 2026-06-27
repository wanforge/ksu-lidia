"use client";

import { useState } from "react";
import { DatePicker } from "@core/ui/datepicker";

/**
 * A calendar date picker that plugs into a plain GET <form>. The visible control
 * is the themed `DatePicker` component; the selected day is mirrored into a
 * hidden <input name={name}> as a `yyyy-mm-dd` string so the server page reads
 * it exactly like the old native date input (compatible with `dateRangeWhere`).
 */
function toYmd(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromYmd(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default function DateField({
  name,
  defaultValue,
  placeholder = "Pilih tanggal",
  minDate,
  maxDate,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
}) {
  const [date, setDate] = useState<Date | null>(fromYmd(defaultValue));

  return (
    <>
      <input type="hidden" name={name} value={date ? toYmd(date) : ""} />
      <DatePicker
        selected={date}
        onChange={(value) => setDate(value)}
        dateFormat="d MMM yyyy"
        placeholderText={placeholder}
        minDate={fromYmd(minDate) ?? undefined}
        maxDate={fromYmd(maxDate) ?? undefined}
        isClearable
        showPopperArrow={false}
      />
    </>
  );
}
