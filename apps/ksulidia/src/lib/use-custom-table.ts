import { useState, useMemo } from "react";
import {
  exportToCsv as csvUtil,
  exportToExcel as excelUtil,
  exportToPdf as pdfUtil,
} from "./export";

// NEW: Advanced filter config type, assuming it will be defined elsewhere
// and imported here. For now, defining it inline.
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

export interface SortConfig<T> {
  key: keyof T | null;
  direction: "asc" | "desc" | null;
}

export function useCustomTable<T extends Record<string, any>>({
  items,
  initialSort = { key: null, direction: null },
  initialPageSize = 10,
  searchFields = [],
  advancedFilterConfig = [], // NEW: Add advanced filter config
}: {
  items: T[];
  initialSort?: SortConfig<T>;
  initialPageSize?: number;
  searchFields?: string[]; // Make optional to phase out
  advancedFilterConfig?: ColumnFilterConfig[]; // NEW
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>(
    {}
  ); // NEW
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(initialSort);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const getFieldValue = (obj: any, path: string): any => {
    return path.split(".").reduce((acc, part) => {
      if (acc && acc[part] !== undefined && acc[part] !== null)
        return acc[part];
      return "";
    }, obj);
  };

  const filteredItems = useMemo(() => {
    let result = [...items];

    // 1. Legacy text search (will be phased out)
    const q = searchQuery.toLowerCase().trim();
    if (q && searchFields.length > 0) {
      result = result.filter((item) => {
        return searchFields.some((field) => {
          const val = getFieldValue(item, field);
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    // 2. New advanced filtering
    Object.keys(advancedFilters).forEach((filterKey) => {
      const filterValue = advancedFilters[filterKey];
      if (
        filterValue === null ||
        filterValue === undefined ||
        filterValue === ""
      )
        return;

      const config = advancedFilterConfig.find((c) => c.key === filterKey);
      if (!config) return;

      result = result.filter((item) => {
        const itemValue = getFieldValue(item, filterKey);

        switch (config.type) {
          case "text":
            return String(itemValue)
              .toLowerCase()
              .includes(String(filterValue).toLowerCase());
          case "numberRange":
            const min = parseFloat(filterValue.min);
            const max = parseFloat(filterValue.max);
            const numItemValue = parseFloat(itemValue);
            if (!isNaN(min) && numItemValue < min) return false;
            if (!isNaN(max) && numItemValue > max) return false;
            return true;
          case "select":
            // Handle boolean values from 'select' options
            const filterValStr = String(filterValue);
            if (filterValStr === "true" || filterValStr === "false") {
              return String(itemValue) === filterValStr;
            }
            return String(itemValue) === filterValStr;
          case "boolean":
            return Boolean(itemValue) === Boolean(filterValue);
          case "dateRange":
            const startDate = filterValue.start
              ? new Date(filterValue.start)
              : null;
            const endDate = filterValue.end ? new Date(filterValue.end) : null;
            const itemDate = itemValue ? new Date(itemValue) : null;
            if (itemDate && startDate && itemDate < startDate) return false;
            if (itemDate && endDate && itemDate > endDate) return false;
            return true;
          default:
            return true;
        }
      });
    });

    return result;
  }, [items, searchQuery, searchFields, advancedFilters, advancedFilterConfig]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleAdvancedFilterChange = (filters: Record<string, any>) => {
    setAdvancedFilters(filters);
    setCurrentPage(1);
  };

  const sortedItems = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredItems;

    const key = sortConfig.key;
    const dir = sortConfig.direction;

    return [...filteredItems].sort((a, b) => {
      const aVal = getFieldValue(a, key as string) ?? "";
      const bVal = getFieldValue(b, key as string) ?? "";

      if (typeof aVal === "number" && typeof bVal === "number") {
        return dir === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (aStr < bStr) return dir === "asc" ? -1 : 1;
      if (aStr > bStr) return dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortConfig]);

  const handleSort = (key: keyof T) => {
    let direction: "asc" | "desc" | null = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    } else if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = null;
      key = null as any;
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);

  const startIndex = (activePage - 1) * pageSize;
  const paginatedItems = useMemo(() => {
    return sortedItems.slice(startIndex, startIndex + pageSize);
  }, [sortedItems, startIndex, pageSize]);

  const exportToCsv = (
    filename: string,
    columns: { label: string; key: string }[]
  ) => csvUtil(filename, columns, sortedItems);

  const exportToExcel = (
    filename: string,
    columns: { label: string; key: string }[]
  ) => excelUtil(filename, columns, sortedItems);

  const exportToPdf = (
    filename: string,
    columns: { label: string; key: string }[],
    title?: string
  ) => pdfUtil(filename, columns, sortedItems, title);

  return {
    searchQuery,
    setSearchQuery: handleSearchChange,
    sortConfig,
    handleSort,
    currentPage: activePage,
    setCurrentPage,
    pageSize,
    setPageSize: (size: number) => {
      setPageSize(size);
      setCurrentPage(1);
    },
    totalPages,
    totalItems: sortedItems.length,
    startIndex: sortedItems.length === 0 ? 0 : startIndex + 1,
    endIndex: Math.min(startIndex + pageSize, sortedItems.length),
    paginatedItems,
    exportToCsv,
    exportToExcel,
    exportToPdf,
    advancedFilters,
    setAdvancedFilters: handleAdvancedFilterChange,
  };
}
