// apps/ksulidia/src/components/ui/table/DataTableFilters.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PiFunnelDuotone, PiXBold } from "react-icons/pi";

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
}

export const DataTableFilters: React.FC<DataTableFiltersProps> = ({
  filterConfig,
  onFilterChange,
  currentFilters,
}) => {
  const [localFilters, setLocalFilters] =
    useState<Record<string, any>>(currentFilters);

  // Sync state with parent's active filters
  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleFilterInputChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    onFilterChange({});
  };

  return (
    <div className="flex flex-wrap items-end gap-3 border-b border-gray-200 bg-gray-50/20 p-4">
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
                config.placeholder || `Cari ${config.label.toLowerCase()}...`
              }
              value={localFilters[config.key] || ""}
              onChange={(e) =>
                handleFilterInputChange(config.key, e.target.value)
              }
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-700"
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
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-900 outline-none transition focus:border-red-700"
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
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-900 outline-none transition focus:border-red-700"
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
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-red-700"
            >
              <option value="">Semua</option>
              {config.options?.map((option) => (
                <option key={String(option.value)} value={String(option.value)}>
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
      <div className="flex h-10 gap-2 self-end">
        <Button onClick={handleApplyFilters} size="md">
          <PiFunnelDuotone className="mr-1.5 h-4 w-4" />
          Filter
        </Button>
        <Button onClick={handleClearFilters} size="md" variant="neutral">
          <PiXBold className="mr-1.5 h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
};
