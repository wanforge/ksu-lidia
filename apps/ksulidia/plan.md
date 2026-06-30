# Plan Standarisasi UI — KSU Lidia

> Tanggal: 2026-06-30
> Status: DRAFT — belum dieksekusi

---

## Konteks Saat Ini

### Komponen yang sudah ada (jangan duplikasi)

| Komponen | Path | Status |
|---|---|---|
| `Button` | `src/components/ui/button.tsx` | ✅ Solid — variants: primary, danger, neutral, ghost, dll |
| `TableActionButton` | `src/components/ui/table/TableActionButton.tsx` | ✅ Ada — icon+label, tapi render inline bukan popup |
| `DataTableFilters` | `src/components/ui/table/DataTableFilters.tsx` | ✅ Ada — text/select/boolean/dateRange/numberRange |
| `TableControls` | `src/app/(hydrogen)/_components/table-controls.tsx` | ⚠️ Partial — pagination prev/next saja, export CSV saja |
| `SortableHeader` (client) | `src/app/(hydrogen)/_components/table-controls.tsx` | ✅ Ada — untuk client-side table |
| `SortableHeader` (server) | `src/app/(hydrogen)/_components/sortable-header.tsx` | ✅ Ada — untuk server-side table (URL-based) |
| `FilterBar` / `SearchInput` | `src/app/(hydrogen)/_components/filters.tsx` | ✅ Ada — untuk server-side filter form |
| `DateInput` | `src/components/ui/form/DateInput.tsx` | ✅ Ada |
| `CheckboxField` | `src/components/ui/form/CheckboxField.tsx` | ✅ Ada |
| `SwitchField` | `src/components/ui/form/SwitchField.tsx` | ✅ Ada |
| `FormHint` | `src/components/ui/form/FormHint.tsx` | ✅ Ada |

### Pages dengan table (target standarisasi)

- `simpan-pinjam/anggota` — anggota-workspace.tsx — pakai `DataTableFilters` + `TableActionButton` ✅ terdepan
- `simpan-pinjam/pinjaman` — pinjaman-workspace.tsx — pakai manual `query` state, tombol ad-hoc
- `simpan-pinjam/master` — master-workspace.tsx — perlu audit dulu
- `simpan-pinjam/shu` — shu-workspace.tsx — perlu audit dulu
- `toko/produk` — produk-workspace.tsx — pakai manual `query` + `categoryFilter` state
- `toko/transaksi` — transaksi-workspace.tsx — perlu audit dulu
- `toko/buku-kas` — buku-kas-view.tsx — perlu audit dulu
- `audit` — audit-log-view.tsx + data-change-log-view.tsx — server-side, pakai FilterBar ✅

---

## FASE 1: Standarisasi Table

### 1.1 Action Button — Popup/Dropdown

**Masalah**: `TableActionButton` render tombol inline berjejer, banyak tombol bikin row lebar.
**Target**: Ganti dengan dropdown popup — satu tombol "Aksi ⋮" trigger popover berisi daftar aksi.

**Rencana**:
1. Buat `src/components/ui/table/TableActionsMenu.tsx`
   - Props: `actions: { label, icon, onClick, variant?, disabled? }[]`
   - Trigger: button `PiDotsThreeVerticalDuotone`
   - Dropdown: posisi `bottom-right`, z-50, tutup saat klik luar (useRef + useEffect)
   - Gunakan native div — tidak perlu lib baru
   - Aksesibilitas: `role="menu"`, `aria-label="Aksi"`
2. Update semua workspace yang pakai `TableActionButton` inline berjejer → `TableActionsMenu`
   - anggota: 5 tombol → 1 dropdown
   - pinjaman, produk, transaksi: audit dan migrasikan

> `TableActionButton` tetap ada untuk single-action standalone (mis. tombol "Cetak" di mutasi).

---

### 1.2 Filter & Search — Konsisten Semua Halaman

**Masalah**: anggota pakai `DataTableFilters`, pinjaman/produk pakai raw `useState` + input manual.
**Target**: Semua client-side table pakai `DataTableFilters` + `useCustomTable`.

**Rencana**:
1. Client-side tables (workspace) → migrasikan ke `DataTableFilters` dengan `ColumnFilterConfig`
   - pinjaman-workspace: ganti `query` state → config filter
   - produk-workspace: ganti `query` + `categoryFilter` → config filter
   - master, shu, transaksi: audit dulu, migrasikan
2. Server-side tables (audit, buku-kas) → tetap `FilterBar` (sudah benar)
3. `DataTableFilters` tambah mode collapsed — panel tersembunyi by default, badge jumlah filter aktif, expand saat klik

---

### 1.3 Tombol Tambah Data — Posisi & Styling Konsisten

**Masalah**: Posisi "Tambah" tidak konsisten — ada di tab, ada di dalam filter area.
**Target**: Tombol Tambah selalu di kanan atas, sejajar filter row.

**Layout yang disepakati**:
```
┌───────────────────────────────────────────────────┐
│  [🔍 Filter / Search]            [+ Tambah Data]  │
├───────────────────────────────────────────────────┤
│  table rows...                                     │
└───────────────────────────────────────────────────┘
```

**Rencana**:
1. Toolbar: `flex items-center justify-between gap-3 p-4 border-b border-gray-200`
2. Kiri: `DataTableFilters` atau `FilterBar`
3. Kanan: `<Button variant="primary" size="md"><PiPlusDuotone /> Tambah X</Button>`
4. Tombol Tambah trigger modal, bukan pindah tab (lebih konsisten antar halaman)
5. Anggota saat ini pakai tab — evaluasi pindah ke modal (konfirmasi dulu, lihat Keputusan #1)

---

### 1.4 Pagination — Konsisten & Lengkap

**Masalah**: `TableControls` hanya prev/next. Tidak ada page numbers.
**Target**: Page numbers dengan ellipsis, konsisten dengan `Pagination` server-side.

**Rencana**:
1. Update `TableControls` — tambah page number buttons
   - Logika sama seperti `pagination.tsx` (getPageItems: first, …, siblings, current, …, last)
   - Aktif page: `bg-red-700 text-white border-red-700`
   - Max 7 item per row
2. Pastikan semua workspace pass semua props ke `TableControls`

---

### 1.5 Export Data — CSV, Excel, PDF

**Masalah**: Hanya ada `exportToCsv`. Tidak ada Excel/PDF.
**Target**: Export CSV, Excel (.xlsx), PDF tersedia di semua table.

**Rencana**:
1. Install deps:
   ```bash
   pnpm add xlsx jspdf jspdf-autotable
   ```
2. Buat `src/lib/export.ts`:
   - `exportToCsv(filename, columns, rows)`
   - `exportToExcel(filename, columns, rows)`
   - `exportToPdf(filename, columns, rows, title?)`
3. Update `useCustomTable` — tambah method `exportToExcel` dan `exportToPdf`
4. Update `TableControls` — ganti satu tombol → dropdown export:
   ```
   [⬇ Export ▼] → dropdown: [CSV] [Excel] [PDF]
   ```
5. Update semua workspace untuk pass kolom ke setiap format

---

### 1.6 Sorting — Visual Konsisten

**Masalah**: Dua `SortableHeader` (client + server) punya styling yang sedikit beda.
**Target**: Visual identik, hanya logika berbeda.

**Rencana**:
1. Align client `SortableHeader` ke styling server version:
   - Icon: `PiArrowUpBold` / `PiArrowDownBold` / `PiArrowsDownUpBold` (bukan caret)
   - Aktif: `text-gray-900`, tidak aktif: `text-gray-300 group-hover:text-gray-400`
2. Ukuran icon: `h-3 w-3`
3. Server version sudah bagus — jadikan referensi

---

### 1.7 Styling Table — Konsisten

**Masalah**: Header bg, padding cell, hover row belum 100% seragam.
**Target**: Satu set class constants untuk semua table.

**Rencana**:
1. Buat `src/lib/table-styles.ts`:
   ```ts
   export const tableHeadRow = "bg-gray-50"
   export const tableHeadCell = "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
   export const tableBodyRow = "border-b border-gray-100 hover:bg-gray-50/50"
   export const tableBodyCell = "px-4 py-3 text-sm text-gray-900"
   ```
2. Apply di setiap workspace saat migrasi filter/action

---

## FASE 2: Standarisasi Icon & Button

### 2.1 Icon — Duotone Konsisten

**Masalah**: Mix `*Bold`, `*Fill`, `*Duotone` — tidak konsisten.
**Target**: Duotone untuk semua icon UI. Bold hanya untuk icon navigasional/inline kecil.

**Aturan**:
- Icon di tombol, table action, sidebar, stat card, tab → **Duotone**
- Icon chevron/caret/arrow navigasi → **Bold** (directional semantic)
- Icon di dalam badge/tag inline (< 14px) → **Bold** (Duotone kurang kontras kecil)

**Rencana**:
1. Audit per-file, list icon `*Bold` yang seharusnya `*Duotone`
2. Ganti file-per-file (bukan global replace)
3. Prioritas: action buttons, stat cards, empty states, tab icons

---

### 2.2 Button & Tab Navigation

**Masalah**: Ada raw `<button className="...">` ad-hoc untuk tab di anggota-workspace.
**Target**: Semua tombol pakai `Button` component. Tab navigation pakai komponen reusable.

**Rencana**:
1. Buat `src/components/ui/Tabs.tsx`:
   ```tsx
   <Tabs tabs={[{ id, label, icon, badge? }]} activeTab={tab} onChange={setTab} />
   ```
   - Styling: `border-b-2 border-red-700 text-red-700` untuk aktif
   - Icon: Duotone
   - Badge: angka opsional (mis. jumlah anggota)
2. Refactor tab di `anggota-workspace.tsx` → `<Tabs>`
3. Cek workspace lain yang mungkin pakai tab pattern

---

## FASE 3: Standarisasi Form Input

### 3.1 FormField Wrapper

**Masalah**: Setiap field duplikasi `<label>`, helper text, error text dengan class inline berulang.
**Target**: Wrapper `FormField` yang handle semua elemen field.

**Rencana**:
1. Buat `src/components/ui/form/FormField.tsx`:
   ```tsx
   <FormField label="Nama" hint="Nama sesuai KTP" error={errors?.name?.[0]} required>
     <input name="name" ... className={inputClass} />
   </FormField>
   ```
   - `label` + optional `required` asterisk
   - `hint`: text kecil abu di bawah input
   - `error`: text kecil merah di bawah hint (override hint slot)
   - `tooltipHint`: string panjang → icon `PiInfoDuotone` dengan tooltip hover

2. Buat `src/components/ui/form/TextInput.tsx`:
   - Class dasar: `h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-gray-700`
   - Prop `error?: boolean` → `border-rose-500 focus:border-rose-600`

3. Buat `src/components/ui/form/SelectInput.tsx` — styled `<select>` same height/radius

4. Buat `src/components/ui/form/TextareaInput.tsx` — styled `<textarea>`

5. Update form di workspace secara bertahap:
   - Prioritas: anggota create/edit, pinjaman create, produk create/edit

---

### 3.2 Hint dengan Tooltip

**Masalah**: Helper text selalu visible — padat secara vertikal di form banyak field.
**Target**: Hint pendek inline, hint panjang sebagai tooltip icon hover.

**Rencana**:
1. Buat `src/components/ui/Tooltip.tsx` — pakai native `title` attribute dulu (MVP)
   - Upgrade path: custom CSS popover jika butuh formatting/multiline
2. Aturan di `FormField`:
   - `hint` ≤ 60 karakter → tampil inline di bawah input
   - `tooltipHint` → `PiInfoDuotone` kecil di sebelah label, hover show tooltip
3. Existing `FormHint` component → integrasikan ke `FormField`

---

## FASE 4: Responsiveness

### 4.1 Table Responsive

1. Semua table container: pastikan `overflow-x-auto` wrapping `<Table>`
2. Kolom prioritas mobile: kolom paling penting selalu visible
   - Hidden di mobile: `hidden sm:table-cell`
   - Contoh anggota: `No, Nama, Aksi` visible — `Pokok, Wajib, Sukarela, Total, Pinjaman` hidden sm:table-cell
3. Per-halaman audit kolom prioritas

### 4.2 Layout & Max-Width

1. Tidak ada `max-w-*` di level `<main>` container halaman
2. Padding: `px-4 sm:px-6 lg:px-8` — breathing room tapi tidak cap width
3. Grid form: `grid-cols-1 md:grid-cols-2` — sudah ada di beberapa, standardkan

### 4.3 Touch Target

1. Tombol aksi di mobile: min `h-10` (40px) — size `md` bukan `sm`
2. Dropdown menu item: min-height `44px`
3. Form input sudah `h-10` — aman

### 4.4 Typography

1. Body text minimum `text-sm` (14px) — audit `text-xs` di table cells
2. Kontras warna: pastikan semua teks abu-abu minimal WCAG AA

---

## FASE 5: RBAC & Log

### 5.1 RBAC Gate

1. Audit `src/components/rbac/` — lihat apa yang sudah ada
2. Setiap aksi di table (edit, hapus, tambah, export) → gate dengan permission
3. Komponen yang tidak diizinkan: **tidak tampil** (bukan just disabled) — UX bersih
4. Gate di dua layer:
   - Server action: `checkPermission(user, 'resource:action')` di awal setiap action
   - UI: conditional render berdasarkan session permissions

### 5.2 Audit Log Coverage

1. Audit `src/lib/` — cek utility logging yang sudah ada
2. Jika belum ada, buat `src/lib/audit.ts`:
   ```ts
   createAuditLog({ userId, action, resource, resourceId, before?, after? })
   ```
3. Semua mutation actions wajib call `createAuditLog` setelah sukses:
   - create, update, delete — semua entitas
   - bulk actions (bulk delete, import)
4. Halaman `/audit` sudah ada — pastikan semua entitas sudah di-log

---

## Urutan Eksekusi yang Disarankan

```
FASE 1.3  →  Tombol Tambah konsisten         (cepat, high impact visual)
FASE 1.1  →  TableActionsMenu dropdown       (cepat, semua halaman rapi)
FASE 1.7  →  table-styles.ts constants       (cepat, fondasi)
FASE 1.6  →  Sorting styling align           (cepat)
FASE 1.4  →  Pagination page numbers         (medium)
FASE 1.2  →  Filter konsisten semua halaman  (medium, per-halaman)
FASE 1.5  →  Export Excel + PDF              (medium, install deps dulu)
FASE 2.2  →  Tabs component                  (cepat)
FASE 2.1  →  Icon audit Duotone              (medium, file-per-file)
FASE 3.1  →  FormField wrapper + inputs      (medium)
FASE 3.2  →  Tooltip hint                    (cepat setelah FormField)
FASE 4    →  Responsiveness audit            (medium, per-halaman)
FASE 5.1  →  RBAC audit & gate              (tergantung existing setup)
FASE 5.2  →  Audit log coverage             (tergantung existing setup)
```

---

## Keputusan yang Perlu Dikonfirmasi

1. **Tambah Data**: tetap pakai tab (seperti anggota sekarang) atau pindah ke **modal**?
   → Rekomendasi: **modal** — lebih konsisten antar halaman

2. **Export format**: split button (satu klik CSV, dropdown Excel/PDF) atau satu dropdown semua?
   → Rekomendasi: **satu dropdown** — lebih clean

3. **Filter collapsed by default**: panel filter tersembunyi saat load, expand saat klik?
   → Rekomendasi: **ya, collapsed** — hemat vertikal space, badge jumlah filter aktif

4. **Tooltip**: native `title` attribute atau custom CSS popover?
   → Rekomendasi: **native `title` dulu**, upgrade nanti jika butuh multiline/formatting

5. **RBAC existing setup**: perlu dicek `src/components/rbac/` sebelum FASE 5

---

## File Baru yang Akan Dibuat

- `src/components/ui/table/TableActionsMenu.tsx` — dropdown action menu
- `src/components/ui/Tabs.tsx` — tab navigation component
- `src/components/ui/Tooltip.tsx` — tooltip wrapper
- `src/components/ui/form/FormField.tsx` — field wrapper (label + hint + error)
- `src/components/ui/form/TextInput.tsx` — styled text input
- `src/components/ui/form/SelectInput.tsx` — styled select
- `src/components/ui/form/TextareaInput.tsx` — styled textarea
- `src/lib/export.ts` — CSV/Excel/PDF export utilities
- `src/lib/table-styles.ts` — shared table class constants

## File yang Akan Dimodifikasi Signifikan

- `src/app/(hydrogen)/_components/table-controls.tsx` — tambah page numbers
- `src/lib/use-custom-table.ts` — tambah exportToExcel/exportToPdf
- `simpan-pinjam/pinjaman/pinjaman-workspace.tsx` — filter, action, toolbar
- `simpan-pinjam/master/master-workspace.tsx` — audit dulu
- `simpan-pinjam/shu/shu-workspace.tsx` — audit dulu
- `toko/produk/produk-workspace.tsx` — filter, action, toolbar
- `toko/transaksi/transaksi-workspace.tsx` — audit dulu
- Semua form di workspace — FormField wrapper
