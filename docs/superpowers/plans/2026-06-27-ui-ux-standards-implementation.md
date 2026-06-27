# UI/UX Standards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement consistent UI/UX standards for forms, tables, and layouts across the `ksulidia` application, as detailed in the approved design document `docs/superpowers/specs/2026-06-27-ui-ux-standards-spec-design.md`.

**Architecture:** This plan adopts a hybrid approach, establishing atomic shared components for common UI elements (date inputs, checkboxes, switches, hints, table action buttons) and a declarative configuration system for flexible, column-specific table filtering. Layout and abbreviation rules are applied globally.

**Tech Stack:** React, Next.js, TypeScript, Tailwind CSS, ShadCN UI (for base components like Button, Checkbox, Switch), `react-icons/pi`, `react-day-picker` (for DateInput).

## Global Constraints

- Date input: `defaultValue` always to current date if not specified.
- Checkbox/Switcher: Checkbox for lists/multi-select; Switcher for instant on/off settings.
- Form width: Full-width container with responsive grid layout (e.g., `md:grid-cols-2`) for fields.
- Pop-up hints: Combined (tooltip icon + helper text).
- Action button icons: Always Duotone icons.
- Abbreviations: Strictly forbidden in UI labels, descriptions, messages. Full words only.

---

### Task 1: Create `FormHint` Component

**Files:**
- Create: `apps/ksulidia/src/components/ui/form/FormHint.tsx`
- Test: `apps/ksulidia/src/components/ui/form/__tests__/FormHint.test.tsx` (using vitest or similar, if configured, otherwise simple assertion)

**Interfaces:**
- Produces: `FormHint` component with `helperText` and optional `tooltipContent` props.

- [ ] **Step 1: Write the failing test**
Create a test that verifies FormHint renders helperText and tooltip icon when tooltipContent is provided.
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Write minimal implementation**
Write the `FormHint.tsx` component.
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 2: Create `DateInput` Component

**Files:**
- Create: `apps/ksulidia/src/components/ui/form/DateInput.tsx`
- Test: `apps/ksulidia/src/components/ui/form/__tests__/DateInput.test.tsx`

**Interfaces:**
- Consumes: `FormHint`
- Produces: `DateInput` component

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Write minimal implementation**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 3: Create `CheckboxField` Component

**Files:**
- Create: `apps/ksulidia/src/components/ui/form/CheckboxField.tsx`
- Test: `apps/ksulidia/src/components/ui/form/__tests__/CheckboxField.test.tsx`

**Interfaces:**
- Produces: `CheckboxField` component

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Write minimal implementation**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 4: Create `SwitchField` Component

**Files:**
- Create: `apps/ksulidia/src/components/ui/form/SwitchField.tsx`
- Test: `apps/ksulidia/src/components/ui/form/__tests__/SwitchField.test.tsx`

**Interfaces:**
- Produces: `SwitchField` component

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Write minimal implementation**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 5: Create `TableActionButton` Component

**Files:**
- Create: `apps/ksulidia/src/components/ui/table/TableActionButton.tsx`
- Test: `apps/ksulidia/src/components/ui/table/__tests__/TableActionButton.test.tsx`

**Interfaces:**
- Consumes: `Button`
- Produces: `TableActionButton` component

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Write minimal implementation**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 6: Create `DataTableFilters` Component and update `useCustomTable`

**Files:**
- Create: `apps/ksulidia/src/components/ui/table/DataTableFilters.tsx`
- Modify: `apps/ksulidia/src/lib/use-custom-table.ts`
- Test: `apps/ksulidia/src/components/ui/table/__tests__/DataTableFilters.test.tsx`

**Interfaces:**
- Consumes: `DateInput`, `CheckboxField`, `SwitchField`
- Produces: `DataTableFilters` component, updated `useCustomTable` supporting advanced filters.

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Write minimal implementation**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 7: Update `anggota-workspace.tsx` for New Components

**Files:**
- Modify: `apps/ksulidia/src/app/(hydrogen)/simpan-pinjam/anggota/anggota-workspace.tsx`
- Test: (Verify manually or use existing workspace test if configured)

**Interfaces:**
- Consumes: `DateInput`, `CheckboxField`, `FormHint`, `TableActionButton`, `DataTableFilters`
- Produces: Updated `anggota-workspace.tsx` with date inputs, action buttons, dynamic filters, and multi-line loan cells.

- [ ] **Step 1: Update code structure to use new components**
- [ ] **Step 2: Verify compilation and tests**
- [ ] **Step 3: Commit**

---

### Task 8: Refactor `profil` and `parameter koperasi` Forms for Full-Width Grid

**Files:**
- Modify: `apps/ksulidia/src/app/(hydrogen)/profile/page.tsx`
- Modify: `apps/ksulidia/src/app/(hydrogen)/pengaturan/koperasi/page.tsx`

**Interfaces:**
- Produces: Full-width grid layouts for both pages.

- [ ] **Step 1: Refactor profile/page.tsx**
- [ ] **Step 2: Refactor koperasi/page.tsx**
- [ ] **Step 3: Commit**

---

### Task 9: Abbreviations Audit and Fix

**Files:**
- Modify: All `.tsx` and `.ts` files containing abbreviation violations (e.g., `anggota-workspace.tsx` and others).

**Interfaces:**
- Produces: Full-word UI text throughout.

- [ ] **Step 1: Find and replace all abbreviations**
- [ ] **Step 2: Commit**
