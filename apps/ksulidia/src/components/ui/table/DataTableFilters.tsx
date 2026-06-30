"use client";

// apps/ksulidia/src/components/ui/table/DataTableFilters.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PiFunnelDuotone, PiXBold, PiCaretDownBold } from "react-icons/pi";

import { DateInput } from "@/components/ui/form/DateInput";
import { SwitchField } from "@/components/ui/form/SwitchField";

export type FilterType =
  | "text"
  | "numberRange"
  | "select"
  | "boolean"
  | "dateRange";

export interface ColumnFilterConfig {
  key: string;
  label: string;
  type: FilterType;
  options?: { label: string; value: string | boolean }[];
  placeholder?: string;
}

interface DataTableFiltersProps {
  filterConfig: ColumnFilterConfig[];
  onFilterChange: (filters: Record<string, any>) => void;
  currentFilters: Record<string, any>;
  /** Collapsed by default (recommended). Set false for always-expanded. */
  defaultCollapsed?: boolean;
}

function countActiveFilters(filters: Record<string, any>): number {
  return Object.values(filters).filter((v) => {
    if (v === null || v === undefined || v === "" || v === false) return false;
    if (typeof v === "object") {
      return Object.values(v).some(
        (sub) => sub !== null && sub !== undefined && sub !== ""
      );
    }
    return true;
  }).length;
}

export const DataTableFilters: React.FC<DataTableFiltersProps> = ({
  filterConfig,
  onFilterChange,
  currentFilters,
  defaultCollapsed = true,
}) => {
  const [localFilters, setLocalFilters] =
    useState<Record<string, any>>(currentFilters);
  const [expanded, setExpanded] = useState(!defaultCollapsed);

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleFilterInputChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
    // keep expanded after apply so user can tweak
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    onFilterChange({});
  };

  const activeCount = countActiveFilters(currentFilters);

  return (
    <div className="w-full">
      {/* Collapsed trigger row */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
        >
          <PiFunnelDuotone className="h-4 w-4 text-gray-500" />
          Filter
          {activeCount > 0 && (
            <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-700 px-1.5 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
          <PiCaretDownBold
            className={`h-3 w-3 opacity-50 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800"
          >
            <PiXBold className="h-3 w-3" />
            Hapus filter
          </button>
        )}
      </div>

      {/* Expandable panel */}
      {expanded && (
        <div className="mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-gray-50/60 p-4">
          {filterConfig.map((config) => (
            <div
              key={config.key}
              className="flex min-w-[160px] max-w-xs flex-1 flex-col gap-1"
            >
              {config.type !== "boolean" && (
                <label
                  htmlFor={config.key}
                  className="text-xs font-semibold text-gray-500"
                >
                  {config.label}
                </label>
              )}

              {config.type === "text" && (
                <input
                  id={config.key}
                  type="text"
                  placeholder={
                    config.placeholder ||
                    `Cari ${config.label.toLowerCase()}...`
                  }
                  value={localFilters[config.key] || ""}
                  onChange={(e) =>
                    handleFilterInputChange(config.key, e.target.value)
                  }
                  className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-700"
                />
              )}

              {config.type === "numberRange" && (
                <div className="flex gap-2">
                  <input
                    id={`${config.key}-min`}
                    type="number"
                    placeholder="Min"
                    value={localFilters[config.key]?.min || ""}
                    onChange={(e) =>
                      handleFilterInputChange(config.key, {
                        ...localFilters[config.key],
                        min: e.target.value,
                      })
                    }
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-900 outline-none transition focus:border-red-700"
                  />
                  <input
                    id={`${config.key}-max`}
                    type="number"
                    placeholder="Max"
                    value={localFilters[config.key]?.max || ""}
                    onChange={(e) =>
                      handleFilterInputChange(config.key, {
                        ...localFilters[config.key],
                        max: e.target.value,
                      })
                    }
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-900 outline-none transition focus:border-red-700"
                  />
                </div>
              )}

              {config.type === "select" && (
                <select
                  id={config.key}
                  aria-label={config.label}
                  value={localFilters[config.key] || ""}
                  onChange={(e) =>
                    handleFilterInputChange(config.key, e.target.value)
                  }
                  className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-red-700"
                >
                  <option value="">Semua</option>
                  {config.options?.map((option) => (
                    <option
                      key={String(option.value)}
                      value={String(option.value)}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {config.type === "boolean" && (
                <SwitchField
                  name={config.key}
                  label={config.label}
                  checked={localFilters[config.key] || false}
                  onChange={(checked) =>
                    handleFilterInputChange(config.key, checked)
                  }
                />
              )}

              {config.type === "dateRange" && (
                <div className="flex gap-2">
                  <DateInput
                    name={`${config.key}-start`}
                    label="Mulai"
                    defaultValue={localFilters[config.key]?.start}
                    onChange={(date) =>
                      handleFilterInputChange(config.key, {
                        ...localFilters[config.key],
                        start: date,
                      })
                    }
                    className="flex-1"
                  />
                  <DateInput
                    name={`${config.key}-end`}
                    label="Akhir"
                    defaultValue={localFilters[config.key]?.end}
                    onChange={(date) =>
                      handleFilterInputChange(config.key, {
                        ...localFilters[config.key],
                        end: date,
                      })
                    }
                    className="flex-1"
                  />
                </div>
              )}
            </div>
          ))}

          <div className="flex h-9 gap-2 self-end">
            <Button onClick={handleApplyFilters} size="sm">
              <PiFunnelDuotone className="h-4 w-4" />
              Terapkan
            </Button>
            <Button onClick={handleClearFilters} size="sm" variant="neutral">
              <PiXBold className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
