// apps/ksulidia/src/components/ui/table/__tests__/DataTableFilters.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DataTableFilters, ColumnFilterConfig } from "../DataTableFilters";
import dayjs from "dayjs";

// Mocking DateInput, CheckboxField, SwitchField to avoid their internal complexities
vi.mock("../form/DateInput", () => ({
  DateInput: vi.fn(({ name, label, onChange, defaultValue }) => (
    <input
      data-testid={name}
      aria-label={label}
      value={defaultValue ? dayjs(defaultValue).format("MM/DD/YYYY") : ""}
      onChange={(e) =>
        onChange?.(e.target.value ? dayjs(e.target.value).toDate() : undefined)
      }
    />
  )),
}));

vi.mock("../form/CheckboxField", () => ({
  CheckboxField: vi.fn(({ name, label, onChange, checked }) => (
    <input
      type="checkbox"
      data-testid={name}
      aria-label={label}
      checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
    />
  )),
}));

vi.mock("../form/SwitchField", () => ({
  SwitchField: vi.fn(({ name, label, onChange, checked }) => (
    <input
      type="checkbox"
      role="switch"
      data-testid={name}
      aria-label={label}
      checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
    />
  )),
}));

describe("DataTableFilters", () => {
  const mockOnFilterChange = vi.fn();
  const commonFilters: ColumnFilterConfig[] = [
    { key: "name", label: "Name", type: "text" },
    { key: "amount", label: "Amount", type: "numberRange" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
    { key: "isArchived", label: "Archived", type: "boolean" },
    { key: "createdAt", label: "Created At", type: "dateRange" },
  ];

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  it("should render all filter inputs based on config", () => {
    render(
      <DataTableFilters
        filterConfig={commonFilters}
        onFilterChange={mockOnFilterChange}
        currentFilters={{}}
      />
    );

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByLabelText("Archived")).toBeInTheDocument(); // SwitchField
    expect(screen.getByText("Created At")).toBeInTheDocument();
  });

  it("should call onFilterChange with text filter", async () => {
    render(
      <DataTableFilters
        filterConfig={commonFilters}
        onFilterChange={mockOnFilterChange}
        currentFilters={{}}
      />
    );

    const nameInput = screen.getByPlaceholderText("Cari name...");
    fireEvent.change(nameInput, { target: { value: "John" } });
    fireEvent.click(screen.getByRole("button", { name: /Filter/i }));

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({ name: "John" });
    });
  });

  it("should call onFilterChange with number range filter", async () => {
    render(
      <DataTableFilters
        filterConfig={commonFilters}
        onFilterChange={mockOnFilterChange}
        currentFilters={{}}
      />
    );

    const minAmountInput = screen.getByPlaceholderText("Min");
    const maxAmountInput = screen.getByPlaceholderText("Max");
    fireEvent.change(minAmountInput, { target: { value: "100" } });
    fireEvent.change(maxAmountInput, { target: { value: "200" } });
    fireEvent.click(screen.getByRole("button", { name: /Filter/i }));

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        amount: { min: "100", max: "200" },
      });
    });
  });

  it("should call onFilterChange with select filter", async () => {
    render(
      <DataTableFilters
        filterConfig={commonFilters}
        onFilterChange={mockOnFilterChange}
        currentFilters={{}}
      />
    );

    const statusSelect = screen.getByLabelText("Status");
    fireEvent.change(statusSelect, { target: { value: "active" } });
    fireEvent.click(screen.getByRole("button", { name: /Filter/i }));

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({ status: "active" });
    });
  });

  it("should clear all filters when Clear button is clicked", async () => {
    render(
      <DataTableFilters
        filterConfig={commonFilters}
        onFilterChange={mockOnFilterChange}
        currentFilters={{ name: "Test" }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Clear/i }));

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({});
    });
  });
});
