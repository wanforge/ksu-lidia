"use client";

import { useState, useMemo } from "react";

export interface SortConfig<T> {
  key: keyof T | null;
  direction: "asc" | "desc" | null;
}

export function useCustomTable<T extends Record<string, any>>({
  items,
  initialSort = { key: null, direction: null },
  initialPageSize = 10,
  searchFields = [],
}: {
  items: T[];
  initialSort?: SortConfig<T>;
  initialPageSize?: number;
  searchFields: string[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(initialSort);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Helper to resolve nested object fields like "member.name"
  const getFieldValue = (obj: any, path: string): string => {
    return (
      path
        .split(".")
        .reduce((acc, part) => {
          if (acc && acc[part] !== undefined && acc[part] !== null)
            return acc[part];
          return "";
        }, obj)
        ?.toString() || ""
    );
  };

  // 1. Filtering
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return items;
    return items.filter((item) => {
      return searchFields.some((field) => {
        const val = getFieldValue(item, field);
        return val.toLowerCase().includes(q);
      });
    });
  }, [items, searchQuery, searchFields]);

  // Reset page when searching
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // 2. Sorting
  const sortedItems = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredItems;

    const key = sortConfig.key;
    const dir = sortConfig.direction;

    return [...filteredItems].sort((a, b) => {
      const aVal = a[key as string] ?? "";
      const bVal = b[key as string] ?? "";

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

  // 3. Pagination
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);

  const startIndex = (activePage - 1) * pageSize;
  const paginatedItems = useMemo(() => {
    return sortedItems.slice(startIndex, startIndex + pageSize);
  }, [sortedItems, startIndex, pageSize]);

  // 4. Export CSV
  const exportToCsv = (
    filename: string,
    columns: { label: string; key: string }[]
  ) => {
    // Generate headers
    const headers = columns
      .map((c) => `"${c.label.replace(/"/g, '""')}"`)
      .join(",");

    // Generate rows
    const rows = sortedItems.map((item) => {
      return columns
        .map((c) => {
          const val = getFieldValue(item, c.key);
          // Clean values for CSV
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(",");
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
  };
}
