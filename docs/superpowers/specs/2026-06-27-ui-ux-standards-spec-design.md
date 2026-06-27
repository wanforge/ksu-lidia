# UI/UX Standards Spec - Design Document

**Date:** 2026-06-27
**Author:** AI Pair Programmer & User
**Status:** Approved

## 1. Overview & Objective

This design document outlines the technical specifications for implementing consistent UI/UX standards across the `ksulidia` application. The goal is to address existing user feedback regarding date inputs, checkbox component behavior, table filtering capabilities, full-width layouts, component consistency, and text clarity.

The implementation follows a **Hybrid Approach (Approach C)**: atomic form components for universal interaction rules, combined with a declarative configuration approach for dynamic table filtering.

---

## 2. Shared Form Components

All components will be created in `apps/ksulidia/src/components/ui/form/` to establish a single source of truth for form inputs.

### 2.1. `DateInput.tsx`

A controlled date picker component ensuring transaction dates are always explicit, editable, and defaulted correctly.

- **Purpose:** Ensure transaction dates are explicitly presented to the user and editable, rather than silently assigned by the server system date.
- **Default Behavior:** Automatically initializes to current date (`new Date()`) unless overridden via `defaultValue`.
- **Props Interface:**
  ```typescript
  interface DateInputProps {
    name: string;
    label: string;
    defaultValue?: Date;
    required?: boolean;
    helperText?: string;
    tooltipContent?: string;
    onChange?: (date: Date | undefined) => void;
  }
  ```
- **UI Structure:** Wraps standard Next UI / HTML input or `react-day-picker` modal popover with standard styling. Integrates `FormHint` internally.

### 2.2. `CheckboxField.tsx`

A unified, accessible checkbox wrapper ensuring large click targets (label + description).

- **Purpose:** Fix issue where clicking labels or secondary descriptions fails to toggle the checkbox.
- **Props Interface:**
  ```typescript
  interface CheckboxFieldProps {
    name: string;
    label: string;
    description?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
  }
  ```
- **Markup Structure:**
  ```tsx
  <div className="flex items-start gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50/50 cursor-pointer">
    <label className="flex w-full cursor-pointer items-start gap-3">
      <Checkbox name={name} checked={checked} ... />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        {description && <span className="text-xs text-gray-500">{description}</span>}
      </div>
    </label>
  </div>
  ```

### 2.3. `SwitchField.tsx`

Explicit toggle switch component reserved for immediate on/off settings and boolean flags (e.g., `isActive`, system parameters).

- **Purpose:** Provide a visually distinct switch component for instant binary states, keeping `CheckboxField` for list selections or standard form inputs.
- **Props Interface:** Mirrors `CheckboxFieldProps` but renders a styled `Switch` track/thumb component instead of a box.

### 2.4. `FormHint.tsx`

Unified hint delivery mechanism combining inline help with explicit popups.

- **Purpose:** Eliminate inconsistent helper text across forms and add popover info support.
- **Behavior:**
  - Displays `helperText` directly below the input field in muted text (`text-xs text-gray-500`).
  - If `tooltipContent` is provided, renders a `PiQuestionDuotone` icon inline with the field label. Hovering or clicking the icon triggers a lightweight popover tooltip containing the detailed guidance.

---

## 3. Data Table Standards

### 3.1. Declarative Table Filtering (`DataTableFilters.tsx`)

To replace single-field search bars with thorough, column-specific filters.

- **Location:** `apps/ksulidia/src/components/ui/table/DataTableFilters.tsx`
- **Filter Schema Definition:**
  ```typescript
  export type FilterType = 'text' | 'numberRange' | 'select' | 'boolean' | 'dateRange';

  export interface ColumnFilterConfig {
    key: string;
    label: string;
    type: FilterType;
    options?: { label: string; value: string | boolean }[]; // for 'select'
    placeholder?: string;
  }
  ```
- **Usage Pattern:**
  Workspaces (e.g., `AnggotaWorkspace`, `PinjamanWorkspace`) pass an array of `ColumnFilterConfig` to `DataTableFilters`. The component automatically builds a responsive filter row with appropriate controls (Dropdowns, Range inputs, Text search).

### 3.2. Cell Layout & Formatting

- **Multi-Line Cells:** Unmerge concatenated data columns. For instance, in `Pinjaman Aktif`, the loan status ("Ada") and the loan amount ("Rp 15.000.000") must be rendered on separate lines inside the cell rather than packed into a single string.
- **Numeric Formatting:** All monetary values must run through `formatNumber()` for strict currency localization (`Rp X.XXX.XXX`).

### 3.3. Action Buttons (`TableActionButton.tsx`)

- **Location:** `apps/ksulidia/src/components/ui/table/TableActionButton.tsx`
- **Rules:**
  1. EVERY table action button MUST render a Duotone icon (`react-icons/pi` `Pi...Duotone`).
  2. Strict button styling variants (`primary`, `neutral`, `danger`, `outline`).
- **Props Interface:**
  ```typescript
  interface TableActionButtonProps extends ButtonProps {
    icon: IconType; // React Icon component
    label: string;
    variant?: 'primary' | 'secondary' | 'neutral' | 'danger';
  }
  ```

---

## 4. Layout & Typography Constraints

### 4.1. Full-Width Grid Pages

- **Container Constraint:** Remove narrow container restrictions (e.g., `max-w-4xl`, `max-w-2xl`) from settings, parameter, and profile pages (`Profil`, `Parameter Koperasi`). Form containers must be `w-full`.
- **Inner Layout:** Form fields within full-width containers must use responsive CSS Grid (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`) to prevent extremely stretched single-column inputs while utilizing full screen real estate.

### 4.2. Zero Abbreviation Policy

- **Rule:** No truncated words in UI labels, column headers, placeholders, or tooltips.
- **Examples of mandatory replacements across codebase:**
  - `bln` → `bulan`
  - `no` / `no.` → `nomor`
  - `jlm` → `jumlah`
  - `ket` → `keterangan`
  - `tgl` → `tanggal`

---

## 5. Migration Strategy

1. **Phase 1: Foundation Components** — Create `DateInput`, `CheckboxField`, `SwitchField`, `FormHint`, `DataTableFilters`, and `TableActionButton`.
2. **Phase 2: Core Workspace Refactor** — Update `anggota-workspace.tsx` to utilize new action buttons, multi-line loan cells, and standard filters.
3. **Phase 3: Form & Page Audit** — Refactor `Profil` and `Parameter Koperasi` forms to full-width grid layouts. Audit all forms for editable transaction date defaults and zero-abbreviation compliance.

---

## 6. Verification Plan

- **Visual / Manual Check:** Verify clicking anywhere on checkbox/switch rows updates state correctly. Confirm popover tooltips function on form labels.
- **Table Test:** Ensure multi-line cell display in loan tables and verify multi-column filter functionality.
- **Text Sweep:** Grep codebase for remaining abbreviations (`bln`, `tgl`, `ket`) to ensure 100% compliance.
