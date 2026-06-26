# Changelog

Versioning restarts at 0.0.1 for the Persona application. Detailed,
commit-level history before this reset is preserved in git.

## 0.0.77 - 2026-06-11

### Changed

- **User terhapus jadi tab di Manajemen User** (seperti pola pegawai): tab
  "User Terhapus (N)" di samping "Daftar User" / "Tambah User", lengkap dengan
  penjelasan soft-delete + tombol Pulihkan per user. Seksi terpisah di bawah
  halaman dihapus.

## 0.0.76 - 2026-06-11

### Changed

- **Tombol aksi baris diseragamkan** (`DetailLink`): label konsisten "Detail"
  dengan panah yang **bergeser ke kanan saat hover**. Mengganti tautan "Buka"/
  "Detail" ad-hoc di Dokumen, Data Saya, Pegawai, dan detail pegawai. Animasi
  panah yang sama juga dipakai pada "Kelola" di Master Referensi.
- **Filter "Yang dinonaktifkan" → switch warna danger** (`SwitchField`, pure-CSS,
  tetap jalan di form GET native) di halaman Pegawai dan Laporan. Kartu
  "Dinonaktifkan" di Pegawai memakai warna danger (rose), bukan warning (amber).

## 0.0.75 - 2026-06-10

### Changed

- **Form "Tambah Dokumen" dirapikan**: di layout master–detail (kolom kiri sempit),
  input "Label Dokumen" jadi kecil karena sebaris dengan tombol. Sekarang
  ditumpuk vertikal — input lebar penuh (lebih tinggi) dan tombol lebar penuh.

## 0.0.74 - 2026-06-10

### Changed

- **Dev server pakai Turbopack**: script `dev` → `next dev --turbopack --port 3002`
  untuk kompilasi lokal lebih cepat. Tidak ada custom webpack di `next.config.js`
  sehingga kompatibel; diverifikasi boot bersih (Ready ~1.5s).

## 0.0.73 - 2026-06-10

### Security

- **Logging untuk semua ekspor laporan**: action audit baru `EXPORT` (migrasi
  `add_audit_export_action`). Ketiga route ekspor CSV — data pegawai, rekap
  dokumen, dan statistik — kini mencatat audit trail (aktor, role, sumber,
  jumlah baris, filter yang dipakai, dan apakah PII penuh). Sebelumnya hanya
  unduh lampiran (DOWNLOAD) yang tercatat; ekspor laporan tidak. Label "Export"
  ditambahkan ke filter & tampilan halaman Audit.

## 0.0.72 - 2026-06-10

### Changed

- **Halaman dokumen per jenis dirombak ke master–detail**: daftar dokumen ringkas
  (bisa di-scroll) di kiri, panel detail terfokus di kanan. Editor metadata &
  lampiran **selalu tampil** di panel terpilih — tidak perlu buka-tutup tiap
  kartu, dan halaman tak lagi memanjang ke bawah. Panel detail sticky di layar
  lebar.
- **Skeleton pratinjau diperbaiki**: pakai `min-height` (60vh) + kerangka kartu
  (shimmer header + ikon badan) agar area stabil dan tidak terlihat "jelek" saat
  memuat.

## 0.0.71 - 2026-06-10

### Changed

- **Statistik — chart panjang pakai "Lihat semua"**: bar horizontal (profesi,
  pendidikan, golongan, unit) runtuh ke Top 8 dengan tombol "Lihat semua";
  saat diperluas, card ikut memanjang (tanpa max-height/clip) dan halaman
  men-scroll. Cap 15 unit dihapus agar semua unit tampil.
- **Tombol lampiran dokumen distandarkan & dirapikan**: pada halaman detail
  dokumen, kolom Aksi kini rata kanan; "Ganti" bergaya tombol (amber) dan
  "Hapus" memakai komponen `<Button>` (danger-soft) dengan konfirmasi SweetAlert
  + toast + audio. Tombol "Detail" pada log perubahan juga memakai `<Button>`.

### Added

- **Skeleton pratinjau berkas**: modal pratinjau menampilkan skeleton (animate-
  pulse) saat gambar/PDF dimuat, lalu media muncul dengan transisi fade.

## 0.0.70 - 2026-06-10

### Added

- **Form filter pada Laporan**: setiap laporan kini punya form filter sebelum
  unduh. Data Pegawai — cari + unit, profesi, jabatan, status aktif, status
  kepegawaian, pendidikan, golongan, dan opsi sertakan nonaktif. Rekap Dokumen —
  cari + kelengkapan, verifikasi, masa berlaku. Form GET native langsung mengunduh
  CSV terfilter.
- **Statistik divisualisasikan lengkap (bukan hanya bar)**: donut komposisi
  (status aktif, status kepegawaian, kelengkapan & masa berlaku dokumen), radial
  status verifikasi, dan bar horizontal (profesi, pendidikan, golongan, unit) via
  recharts — plus tabel rincian yang bisa diperluas. KPI diperluas: total/aktif
  pegawai, total dokumen, % lengkap, perlu verifikasi, serta peringatan dokumen
  kedaluwarsa/≤90 hari.

### Changed

- **Ekspor pegawai diperkaya**: route `/api/persona/employees/export` menerima
  filter presisi berbasis id master (unitId, professionId, jobPositionId,
  employmentStatusId, employeeStatusId, educationLevelId, gradeId) selain q/status/
  showInactive.
- **Ekspor statistik dilengkapi statistik dokumen**: selain komposisi pegawai,
  CSV kini memuat ringkasan dokumen (total, kelengkapan, status verifikasi, dan
  masa berlaku kedaluwarsa/≤90 hari).
- Halaman Statistik & tombol "Ekspor CSV" tersedia langsung dari header
  statistik.

## 0.0.69 - 2026-06-10

### Added

- **Pratinjau berkas in-app** (`src/components/file-preview/file-preview-button.tsx`):
  modal pratinjau gambar (`<img>`) & PDF (`<iframe>`) langsung di aplikasi lewat
  route terotorisasi `/api/persona/attachments/{id}?mode=inline`, dengan tombol
  Unduh di dalam modal. Menggantikan semua tautan langsung ke file di
  manajemen dokumen pegawai dan halaman verifikasi.

### Changed

- **Halaman Verifikasi → workspace master–detail satu halaman**: daftar antrean
  di kiri, panel pemeriksaan sticky di kanan (metadata, pratinjau lampiran
  in-app, riwayat verifikasi, aksi Setujui/Revisi/Tolak) — tanpa pindah halaman.
  Responsif: menumpuk di layar kecil. (`verification-workspace.tsx` menggantikan
  `verification-row.tsx`.)
- **Umpan balik aksi (toast + audio) dilengkapi** pada 9 form yang sebelumnya
  hanya menampilkan pesan inline: form jenis dokumen (buat/aturan/section),
  tambah dokumen opsional, buat user, generate checklist, reset password, dan
  kedua vault kredensial (sukses/gagal kini bertoast + suara).

### Security

- **Pengerasan akses berkas**: route attachment & foto kini di-**rate-limit**
  (120/menit per user+IP) untuk mencegah enumerasi/brute-force ID; menambah
  `X-Content-Type-Options: nosniff`; attachment inline memakai
  `Content-Security-Policy: sandbox` dan hanya MIME aman (gambar/PDF) yang boleh
  dirender inline, selain itu dipaksa unduh. Akses tetap butuh sesi +
  `canAccessEmployee` + dicatat di audit (DOWNLOAD). Tidak ada path file langsung.

## 0.0.68 - 2026-06-10

### Added

- **Menu & fitur Laporan** (`/laporan`): hub unduh laporan berisi kartu **Data
  Pegawai**, **Rekap Dokumen**, dan **Statistik Kepegawaian** (CSV), masing-masing
  digate per-permission dan menghormati penyamaran PII. Item menu "Laporan" di
  bagian Operasional.
- **Ekspor statistik** (`GET /api/persona/statistics/export`): CSV rekap jumlah
  & persentase pegawai per status, status kepegawaian, profesi, pendidikan,
  golongan, dan unit kerja (permission `report.export`).
- **Dokumentasi permission lengkap** (`docs/PERMISSIONS.md`): matriks
  permission → role → tempat penegakan, pemetaan route, route dinamis, dan
  prinsip penegakan berlapis.

### Changed

- **RBAC dilengkapi**: permission baru `report.view` & `report.export` (diberikan
  ke OPERATOR/VERIFIER/VIEWER + ADMIN). Rule middleware ditambah `/laporan` →
  `report.view` dan `/me/akun-aplikasi` → `vault.view` (lebih spesifik dari
  `/me`). Tidak ada permission yatim.

## 0.0.67 - 2026-06-10

### Fixed

- **Halaman signin saat sudah login**: `/signin` kini server-redirect ke landing
  per role (`defaultLandingPath`) bila sesi aktif — pengguna yang sudah login
  tidak lagi bisa membuka halaman masuk.

### Changed

- **Redesign halaman legal** (`/privacy`, `/terms`): `LegalShell` dirombak —
  top bar sticky, hero gradient teal + ikon, kartu konten dengan tipografi
  eksplisit (heading beraksen, bullet kustom, tautan teal) tanpa bergantung pada
  plugin `@tailwindcss/typography` yang tidak terpasang, plus subtitle + footer
  kepemilikan.
- **CI/CD hemat kuota Actions**: `ci.yml` tidak lagi berjalan di push ke `main`
  (hanya branch `dev`, PR ke `dev`, atau `workflow_dispatch`); `deploy.yml`
  dibuat **manual saja** (trigger tag dinonaktifkan). Doc `docs/CICD.md`
  diperbarui.

## 0.0.66 - 2026-06-10

### Added

- **Tombol standar aplikasi** (`src/components/ui/button.tsx`): satu komponen
  `<Button>` (variant primary/primary-soft/danger/danger-soft/warning/neutral/
  ghost, size sm/md/lg, `isLoading`, `as="a"`). ~35 tombol aksi dimigrasi dari
  `<button>` inline; semua CTA utama diseragamkan ke teal (sebelumnya campur
  `bg-gray-900`), termasuk `filterSubmitClass`, dashboard, dan halaman 404.
- **Ekspor data pegawai (CSV)**: `GET /api/persona/employees/export` (RBAC
  `employee.view`, NIK/NIP ter-mask untuk non-admin, mengikuti filter
  q/unit/status) + tombol "Ekspor CSV" di halaman Pegawai.
- **Halaman legal publik**: `/privacy` (Kebijakan Privasi) & `/terms`
  (Ketentuan Layanan), ditaut dari footer signin & aplikasi.
- **Pegawai & akun demo "Sugeng Sulistiyawan" (unit IT)** via
  `prisma/data/demo.ts`: 5 akun (satu per role), akun EMPLOYEE tertaut ke
  pegawai. Nonaktif via `SEED_DEMO_USER=false`.
- **Pulihkan user terhapus**: `restoreUserByAdmin` + seksi "User Terhapus" di
  Manajemen User dengan tombol Pulihkan (konfirmasi SweetAlert + toast/audio).
- **CI/CD aktif**: `ci.yml` + `deploy.yml` dipindah ke `.github/workflows/`,
  Dependabot github-actions diaktifkan. Dokumen `docs/CICD.md` (secrets/variables
  aman, integrasi `deploy/*.sh`). Dokumen baru: `docs/AUDIT.md`,
  `docs/OWNERSHIP.md`, `docs/RINGKASAN-PERUBAHAN.md`.

### Changed

- **Seeder default = data nyata** (`SEED_MODE=real`, memuat
  `prisma/data/.backup/employees.real.json`). Kode dummy faker dipertahankan,
  hanya dipakai bila `SEED_MODE=dummy`.
- **Popup profil header**: ganti uploader foto (+"Tambah foto") dengan Avatar
  baca-saja (gaya isomorphic); kontrol ganti avatar dipindah ke halaman `/me`.
- **Halaman Verifikasi**: redesign tanpa pindah halaman — baris expand inline
  (metadata, lampiran view/download, riwayat) + aksi Setujui/Minta Revisi/Tolak
  dengan konfirmasi SweetAlert + toast/audio.
- **Dashboard**: dirombak lebih ringkas & visual (greeting, kartu metrik, grid
  Aksi Cepat per-role, progress kelengkapan).
- **Permintaan data**: UX dirombak dua sisi (picker kartu, badge status, resolve
  inline) dengan toast/SweetAlert.
- **Aksi kritis** (hapus user, hapus permanen sampah) memakai konfirmasi
  SweetAlert + toast/audio; manajemen user kini menampilkan toast hasil aksi.
- **`COMPLIANCE.md` & `AUDIT.md` diselaraskan**: NIK **disimpan plaintext** di
  database (keputusan operasional) — proteksi via masking + reveal teraudit +
  RBAC, bukan enkripsi kolom. Klaim enkripsi NIK yang keliru dihapus.
- **Storage lokal**: env `STORAGE_LOCAL_ROOT` (path absolut) agar upload tidak
  gagal saat working directory berbeda di server.

### Fixed

- **Form metadata dokumen tanpa masa berlaku**: field Berlaku Mulai/Sampai/
  Status Masa Berlaku kini disembunyikan untuk dokumen non-berkala, dan
  `validityStatus` dibuat opsional di schema — simpan tidak lagi gagal validasi
  (server mengisi `NOT_LISTED` otomatis).
- **Log perubahan**: soft-delete/restore (perubahan `deletedAt`) kini diberi tag
  "Hapus (soft)"/"Pulihkan", bukan sekadar "Ubah".

## 0.0.65 - 2026-06-04

### Changed

- **Upload Lampiran: tampilan drag-and-drop bergaya isomorphic.** Ganti
  `<input type="file">` polos di `UploadForm` dengan komponen `Upload` dari
  `@core/ui/upload` — area dashed dengan teks "Seret & lepas / klik untuk
  memilih". Setelah file dipilih, muncul preview card (nama, ukuran, icon PDF/
  gambar) dengan tombol × untuk membatalkan. File input di-reset otomatis
  setelah upload berhasil.

## 0.0.64 - 2026-06-04

### Fixed

- **`next.config.js`: pindahkan `serverActions.bodySizeLimit` ke bawah
  `experimental`.** Next.js 15.2.4 tidak mengenali `serverActions` sebagai
  top-level key; dipindah ke `experimental.serverActions.bodySizeLimit: "10mb"`.
- **`seed-rsud.ts`: tambah `import 'dotenv/config'` + normalisasi prefix URL.**
  Ketika dijalankan langsung via `tsx` (bukan `prisma db seed`), `.env` tidak
  ter-load otomatis sehingga `DATABASE_URL` kosong. Ditambah import dotenv dan
  replace prefix `mysql://` → `mariadb://` agar sesuai format yang diterima
  `@prisma/adapter-mariadb`.

### Changed

- **Font: beralih dari `next/font/google` ke `next/font/local`.** Inter dan
  Lexend Deca di-host secara lokal (`public/fonts/`), menghindari kegagalan
  build karena timeout fetch ke `fonts.gstatic.com` saat build.
- **`.gitignore`: hapus pengecualian `prisma/data/.backup/`.** File
  `employees.real.json` kini di-track git bersama repo.

## 0.0.63 - 2026-06-03

### Changed

- **Izin & visibilitas catatan pegawai.**
  - **Hapus**: hanya admin atau pembuat catatan (sebelumnya semua pemilik izin
    `EMPLOYEE_EDIT`). Dienforce di `deleteEmployeeNoteAction` dan tombol hapus
    per-catatan (`canDelete`).
  - **Lihat**: admin melihat semua catatan; non-admin hanya catatan buatannya
    sendiri (difilter di query `notesLog`). Panel Catatan hanya dirender untuk
    admin atau pengguna ber-izin `EMPLOYEE_EDIT`.
  - Menambah catatan tetap butuh `EMPLOYEE_EDIT` (`canAdd`).

## 0.0.62 - 2026-06-03

### Added

- **Catatan pegawai (log multi-entri).** Model `EmployeeNote` baru (migration
  `0004_add_employee_notes`): tiap catatan menyimpan isi, penulis, dan waktu.
  Di halaman Detail Pegawai kini ada panel **Catatan** untuk menambah/menghapus
  catatan (soft-delete), tampil sebagai riwayat terurut terbaru. Tambah/hapus
  butuh izin `EMPLOYEE_EDIT`. Aksi: `addEmployeeNoteAction` /
  `deleteEmployeeNoteAction`; komponen `employee-notes.tsx`.
- **Tampilkan `Employee.notes` (catatan ringkas).** Field catatan tunggal yang
  sudah ada kini ditampilkan di halaman Detail Pegawai (sebelumnya hanya bisa
  diisi lewat form, tidak pernah dirender).

## 0.0.61 - 2026-06-03

### Changed

- **Konfigurasi environment terpusat & tervalidasi.** Tambah `config/env.ts`
  (server, divalidasi zod, dibaca SEKALI saat modul dimuat) dan
  `config/env.client.ts` (variabel publik `NEXT_PUBLIC_*`, dirujuk literal agar
  di-inline Next). Komponen/library kini mengimpor `env`/`clientEnv`, tidak lagi
  membaca `process.env` mentah.
  - Dimigrasikan: `users/actions.ts` (`appBaseUrl`), `lib/credential-crypto.ts`,
    `lib/storage/index.ts` + `lib/storage/s3-driver.ts`, `lib/captcha.ts`,
    `lib/prisma.ts`, `lib/diagnostics/ntp.ts` + `system-info.ts`,
    `api/auth/captcha/route.ts`, serta komponen client `signin/recaptcha-provider`,
    `signin/page`, `_components/captcha-field`.
  - `appBaseUrl` (NEXTAUTH_URL → APP_PUBLIC_URL) dipakai untuk link reset —
    melanjutkan perbaikan host header injection (0.0.60).
  - `getServerEnvIssues()` mengekspos kelengkapan env wajib/produksi untuk
    pengecekan diagnostics/startup.
  - Tidak meng-crash build: tiap field punya default/coerce/`.catch`. Guard
    runtime mencegah `config/env.ts` terimpor di sisi client.
  - Catatan: `config/app.ts` (branding) & `diagnostics/config-check.ts`
    (inspektur env) tetap membaca env secara langsung sesuai perannya.

## 0.0.60 - 2026-06-03

### Security

- **Cegah host header injection pada link reset password.** `getBaseUrl()` di
  `users/actions.ts` di-pin ke sumber server tepercaya (`NEXTAUTH_URL` →
  `APP_PUBLIC_URL`), bukan dari header `Host`/`x-forwarded-host` yang dapat
  dimanipulasi klien. Mencegah token reset diarahkan ke domain penyerang.
  (Temuan automated security review atas v0.0.59.)

## 0.0.59 - 2026-06-03

### Added

- **Foto pegawai.** Field `Employee.photoKey` + migration `0003_add_profile_photos`.
  Unggah/ganti/hapus di halaman **Edit Pegawai** (`employee-photo-card.tsx`,
  action `uploadEmployeePhotoAction`/`removeEmployeePhotoAction`). Ditampilkan di
  halaman Detail Pegawai dan "Data Saya". Maks 5 MB, format JPG/PNG/WebP.
- **Foto profil akun.** Field `User.image`. Unggah/hapus dari menu profil
  (`profile-photo/profile-photo-uploader.tsx`, action `updateOwnPhotoAction`/
  `removeOwnPhotoAction`). Avatar pojok kanan & header dropdown memakai foto
  (fallback inisial). Session next-auth membawa `image` (di-refresh via
  `session.update()` setelah ganti foto).
- **Storage foto** (`lib/storage`): koleksi `employee-photos` & `user-photos`,
  helper `savePhoto`/`readPhoto`/`deletePhoto` (validasi image-only).
- **Route serving** `GET /api/persona/photo/[scope]/[id]` (scope: `employee` |
  `user`) dengan auth + authz (pegawai: `canAccessEmployee`; user: pemilik/ADMIN).

### Fixed

- **Link reset sekali pakai kini absolut (ada domain).** `issuePasswordResetLinkAction`
  membangun URL penuh dari base URL server (`NEXTAUTH_URL`) — sebelumnya hanya
  `/reset-password/<token>` tanpa host. (Lihat 0.0.60 untuk pengerasan keamanan.)

### Changed

- **Konfirmasi hapus pakai SweetAlert2** (sebelumnya `window.confirm` native):
  Hapus user (`user-manage-panel.tsx`), Hapus dokumen & Hapus file lampiran
  (`document-items-manager.tsx`). Aksi destruktif lain sudah memakai SweetAlert.

### Catatan deploy

- Jalankan `pnpm prisma generate` lalu `pnpm prisma migrate deploy` (kolom
  `users.image` & `employees.photoKey`) sebelum `pnpm build`.

## 0.0.58 - 2026-06-03

### Changed

- **Halaman Sampah — tombol Pulihkan & Hapus Permanen didesain ulang.**
  Sebelumnya kedua tombol hanya berupa plain text (`font-semibold text-teal/rose-700`)
  tanpa border atau background — sulit dikenali sebagai tombol. Sekarang:
  - "Pulihkan": pill teal dengan border (`border-teal-300 bg-teal-50`)
  - "Pulihkan" (disabled): pill gray dengan `cursor-not-allowed`
  - "Hapus permanen": pill rose dengan border (`border-rose-300 bg-rose-50`)

- **Halaman Data Saya — state "Akun belum terhubung" didesain ulang.**
  Sebelumnya hanya `EmptyState` generik (ikon besar + teks kecil di tengah halaman
  kosong). Sekarang ditampilkan dalam card penuh dengan header halaman, ikon amber
  berlatar rounded-full, judul, deskripsi kontekstual, dan callout amber dengan
  instruksi menghubungi administrator.

- **StatCard "Menunggu" di Data Saya:** `tone="blue"` → `tone="slate"` agar
  konsisten dengan penghapusan warna biru dari tema.

## 0.0.57 - 2026-06-03

### Fixed

- **Server Action body size limit** — tambah `serverActions.bodySizeLimit: "4mb"`
  di `next.config.js`. Default 1 MB menyebabkan error 413 saat submit form besar.

### Changed

- **Tema warna** — hilangkan biru/violet/ungu yang tidak selaras dengan primary
  teal/green:
  - Stat card "Total pegawai" di Statistik: `blue` → `slate`
  - Stat card "Unit kerja terbanyak" di Statistik: `violet` → `amber`
  - Stat card "Profesi Khusus" di Jenis Dokumen: `violet` → `slate`
  - Ikon edit hover di vault (me & pegawai): `hover:blue-600` → `hover:teal-600`
  - Ikon link eksternal di vault: `blue-500/700` → `teal-500/700`
  - Ikon aksi di `document-type-actions`: `blue-200/50/700` → `teal-200/50/700`

## 0.0.56 - 2026-06-03

### Fixed

- **Lint:** gabung duplicate import di `admin-credential-vault.tsx` (dua baris
  import dari modul yang sama → satu baris). Pre-existing warning `no-duplicate-imports`.
- **Lint/Type:** `tx: any` di `credential-crypto.ts` diganti dengan `TxClient`
  (tipe Prisma transaction client yang proper); hapus komentar
  `eslint-disable-next-line @typescript-eslint/no-explicit-any` yang menyebabkan
  error karena rule tidak terdaftar di ESLint config.
- **Format:** Prettier reformatting menyeluruh — semua file yang melewati `pnpm format`
  kini seragam (line-wrap panjang, atribut SVG, objek multi-baris, dll.).

### Build

- `pnpm lint` — 0 warnings, 0 errors
- `pnpm build` — sukses, 35 routes, tanpa error

## 0.0.55 - 2026-06-03

### Changed

- **Hilangkan ambiguitas "nonaktif" vs "status kepegawaian" di halaman detail pegawai.**
  Dua konsep yang berbeda sebelumnya sama-sama menggunakan kata "aktif/nonaktif":
  - `deletedAt` (pengarsipan rekod dari sistem) → kini menggunakan kata **arsip/pulihkan**:
    - Banner: "dinonaktifkan" → "diarsipkan dari sistem"
    - Card bawah: "Nonaktifkan Pegawai" → "Arsipkan Pegawai", tombol "Nonaktifkan" → "Arsipkan"
    - Card restore: "Aktifkan Kembali Pegawai" → "Pulihkan dari Arsip", tombol "Aktifkan Kembali" → "Pulihkan"
  - `employeeStatus` (status keaktifan HR) → label InfoItem "Status Aktif" → **"Keaktifan"**
  - `employmentStatus` (jenis ikatan kerja PNS/PPPK/Kontrak) → label InfoItem "Status Pegawai" → **"Jenis Kepegawaian"**

## 0.0.54 - 2026-06-03

### Changed

- **Checklist dokumen pegawai kini berbasis profesi dan aturan jenis dokumen.**
  Sebelumnya setiap pegawai baru mendapat semua jenis dokumen aktif tanpa
  memperhatikan `isRequiredByDefault` dan `requiredForProfessions`. Sekarang:
  - `requiredForProfessions` non-kosong → hanya profesi yang terdaftar yang
    mendapat checklist jenis dokumen tersebut.
  - `requiredForProfessions` kosong + `isRequiredByDefault=true` → semua pegawai.
  - `requiredForProfessions` kosong + `isRequiredByDefault=false` → tidak
    di-assign otomatis (opsional, bisa ditambah manual).

- **Sync otomatis saat profesi pegawai diubah** (`updateEmployeeAction`).
  Baris checklist yang tidak lagi relevan dan masih kosong di-soft-delete;
  baris yang baru berlaku ditambahkan.

- **Tombol "Sinkron Checklist"** (`ensureEmployeeChecklistAction`) kini
  melakukan full sync dua arah: tambah yang kurang + hapus yang kosong dan
  tidak berlaku — bukan hanya menambah.

- **Tombol "Tambah Dokumen Lain"** di halaman detail pegawai. Dropdown
  menampilkan semua jenis dokumen aktif yang belum ada di checklist pegawai
  (termasuk yang `isRequiredByDefault=false`). Admin dapat menambahkannya
  satu per satu secara manual.

- **`seed.ts`** diperbarui menggunakan logika filtering yang sama sehingga
  seeding awal sudah menghasilkan checklist yang sesuai profesi masing-masing
  pegawai.

### Added

- `src/lib/checklist.ts` — helper `getApplicableDocumentTypeIds` dan
  `syncEmployeeChecklist` yang dapat dipakai di dalam maupun di luar transaksi
  Prisma.

## 0.0.53 - 2026-06-03

### Fixed

- **`validateDOMNesting`: `<form>` bersarang di `document-type-rule-form.tsx`.**
  Tombol hapus menggunakan `<form action={deleteFormAction}>` yang dirender di
  dalam `<form action={formAction}>` — invalid HTML yang menyebabkan error
  `validateDOMNesting` di halaman Jenis Dokumen (mode edit). Difix dengan
  memindahkan delete form ke luar sebagai sibling tersembunyi (`className="hidden"`)
  dan mengaksesnya via `useRef`, sehingga tidak ada lagi form bersarang.

- **React key warning di `credential-vault.tsx` dan `admin-credential-vault.tsx`.**
  Fragment pendek `<>` di dalam `.map()` tidak mendukung prop `key` — sama
  dengan bug yang sudah diperbaiki di halaman Jenis Dokumen (v0.0.52). Keduanya
  difix ke `<Fragment key={cred.id}>`.

### Changed

- **Vault pegawai — empty state & info akun terhubung didesain ulang.**
  Halaman `/pegawai/[id]/akun-aplikasi` saat pegawai belum punya akun sistem
  kini menampilkan empty state penuh (card putih, ikon `PiUserCirclePlusDuotone`,
  judul, deskripsi, tombol CTA ke Manajemen Users) menggantikan banner amber
  sederhana. Info "akun terhubung" juga didesain ulang: menampilkan avatar ikon,
  email pegawai, dan badge enkripsi AES-256-GCM secara horizontal.

- **Badge profesi khusus di Jenis Dokumen didesain ulang.**
  Pill `rounded-full` violet diganti dengan tag rectangular `rounded` indigo
  (`text-[10px] uppercase tracking-wide`) — lebih rapi dan tidak bertabrakan
  secara visual dengan badge Wajib/Verifikasi/Berlaku di atasnya.

## 0.0.52 - 2026-06-03

### Fixed

- **Bug migrasi: kolom `account_credentials` dan `credentialSalt` pakai snake\_case.**
  `prisma/migrations/0002_add_account_credentials_vault/migration.sql` membuat
  kolom dengan nama snake\_case (`credential_salt`, `user_id`, `password_enc`,
  `notes_enc`, `sort_order`, `login_url`, `created_at`, `updated_at`,
  `deleted_at`) padahal Prisma schema tidak menggunakan `@map` sehingga ORM
  mengharapkan camelCase. Semua nama kolom dikoreksi ke camelCase agar konsisten
  dengan `0001_init`. Dampak: seluruh fitur vault akun aplikasi (baca, tulis,
  enkripsi) gagal dengan `P2022 ColumnNotFound` sebelum fix ini.

- **React key warning di halaman Jenis Dokumen (`/master/jenis-dokumen`).**
  Fragment pendek `<>` di dalam `.map()` tidak mendukung prop `key`; `key` hanya
  diletakkan di `<tr>` di dalamnya sehingga React mengeluarkan error
  _"Each child in a list should have a unique key prop"_ yang di Next.js 15 dev
  mode dielevasi menjadi unhandled error. Difix dengan mengganti `<>` menjadi
  `<Fragment key={item.id}>` (import `Fragment` dari `react` ditambahkan).

## 0.0.51 - 2026-06-03

### Changed

- **dr. SAERONI kini Direktur (bukan Plt.).** `RSUD_JOB_POSITIONS` di
  `prisma/data/rsud-trenggalek.ts` diperbarui: `Plt. Direktur RSUD dr. Soedomo
  Kab. Trenggalek` → `Direktur RSUD dr. Soedomo Kab. Trenggalek` (code
  `DIREKTUR_RSUD_DR_SOEDOMO_KAB_TRENGGALEK`).
  > Catatan: data pegawai nyata di-seed dari `prisma/data/.backup/employees.real.json`
  > (gitignored, di server). Perbarui juga field `position` dr. SAERONI di file
  > itu—atau jabatan pegawai langsung di DB—agar seed ulang tidak mengembalikan
  > label lama.

## 0.0.50 - 2026-06-03

### Added

- **Golongan `XI`** ditambahkan ke `RSUD_GRADES`
  (`prisma/data/rsud-trenggalek.ts`). Golongan PPPK XI sah namun belum tercakup
  pada snapshot sebelumnya; ditambahkan agar master grade selaras dengan data
  staff nyata (sinkron dengan normalisasi di project asik-scrap / laporan
  kehadiran).

## 0.0.49 - 2026-06-03

### Added

- **Seed data nyata RSUD (805 pegawai).** `seed-rsud.ts` kini membaca data
  pegawai nyata dari `prisma/data/.backup/employees.real.json` (gitignored —
  PII tidak di-commit) menggantikan array fiktif. Master tables (unit, profesi,
  jabatan, pangkat, golongan, pendidikan, spesialisasi) dibangun otomatis dari
  data nyata via normalisasi yang sama dengan `seed.ts`. NIP dipakai sebagai
  natural key (upsert idempoten) dan checklist dokumen dibuat otomatis untuk
  semua pegawai. Jalankan: `pnpm run db:seed:rsud`.

- **Snapshot master arrays nyata** di `prisma/data/rsud-trenggalek.ts`
  (`RSUD_UNITS`, `RSUD_JOB_POSITIONS`, `RSUD_RANKS`, `RSUD_GRADES`,
  `RSUD_EDUCATION_LEVELS`, `RSUD_SPECIALTIES`) sebagai referensi yang
  mencerminkan output seed. Data palsu (`RSUD_EMPLOYEES` dengan NIK fiktif)
  dihapus.

### Changed

- **Domain organisasi RSUD** diperbarui ke `rsud.trenggalekkab.go.id` (email
  akun seed mengikuti, mis. `admin@rsud.trenggalekkab.go.id`).

- **Normalisasi nama master lebih konsisten** (`normalizeName` / `normGrade` di
  `seed.ts` & `seed-rsud.ts`) sehingga data yang masuk DB rapi dan seragam:
  - Koreksi typo ejaan: `Nerologi→Neurologi`, `Dorter`/`doker`→`Dokter`,
    `Skretaris→Sekretaris`, `Stoke→Stroke`, `Laboraturium→Laboratorium`,
    `Management→Manajemen`, `KesehatanTerampil→Kesehatan Terampil`.
  - Akronim dipertahankan huruf besar: `PPI`, `BDRS`, `ISS`, `MOD`, `GSP`,
    `VCT`, `ROI`, `RR`, `SMEA`, `SKKA`.
  - Gelar `dr.` / `drg.` tetap huruf kecil (mis. `dr. Soedomo`, bukan `Dr.`).
  - Golongan distandarkan ke format `III/a` (angka Romawi besar + huruf kecil).
  - Istilah `Penyakit Dalam` tidak lagi salah menjadi `Penyakit dalam`.
  - Unit duplikat `Ruang Inap Ruang X` digabung menjadi `Ruang X` (anchored,
    tidak mengubah struktur nama jabatan).

### Security

- **XSS via `javascript:` URL** pada field `loginUrl` vault akun aplikasi
  ditambal dengan dua lapis pertahanan: validasi skema (zod) menolak protokol
  selain `http`/`https` saat data disimpan, dan render-time hanya menampilkan
  `<a href>` bila URL cocok `^https?://` (mencegah eksekusi URL berbahaya yang
  sudah terlanjur ada di DB).

### CI/CD

- GitHub Actions third-party deps sempat di-pin ke commit SHA immutable
  (mitigasi supply-chain), lalu dikembalikan ke floating tag `@v4` sesuai
  preferensi maintainer.

## 0.0.48 - 2026-06-02

### Added

- **Vault Akun Aplikasi (fitur baru).** Pegawai dapat menyimpan username +
  password aplikasi kerja (SIMRS, presensi, kepegawaian, WiFi, dll.) di vault
  terenkripsi per-akun. Tersedia di portal pegawai (`/me/akun-aplikasi`) dan
  halaman detail pegawai untuk admin (`/pegawai/[id]/akun-aplikasi`). Enkripsi
  menggunakan AES-256-GCM dengan kunci turunan per-user; saat password persona
  diubah, semua credential vault di-re-enkripsi otomatis dalam satu transaksi.
  Kategori: Sistem RS, Kepegawaian, Presensi, Email, Jaringan, Keuangan,
  Lainnya. Toggle show/hide password + copy-to-clipboard per baris.

- **Seed akun semua role.** `pnpm run db:seed` kini membuat satu akun demo
  untuk setiap role (ADMIN, OPERATOR, VERIFIER, VIEWER) dengan email
  `<role>@<ORG_EMAIL_DOMAIN>` dan password default terdokumentasi.

- **Seed data RSUD dr. Soedomo Trenggalek.** `pnpm run db:seed:rsud`
  (atau `bash deploy/seed-rsud.sh`) mengisi master data lengkap RSUD Tipe C:
  38 unit kerja, 38 profesi, 23 jabatan, 13 pangkat, 10 jenjang pendidikan,
  17 spesialisasi, dan ~55 pegawai representatif (nama fiktif, struktur nyata).

- **Deploy scripts** di `deploy/`: `setup.sh` (inisialisasi server), `deploy.sh`
  (update aplikasi dengan zero-downtime check), `rollback.sh` (darurat),
  `health-check.sh`, `seed-demo.sh`, `seed-rsud.sh`.

- **CI/CD GitHub Actions** di `.github/workflows/`: `ci.yml` (typecheck + lint
  + build + test on push/PR) dan `deploy.yml` (deploy ke server via SSH on tag
  push atau manual trigger, dengan pre/post health check).

### Changed

- **RBAC:** Dua permission baru — `vault.view` (baca/kelola vault sendiri,
  dimiliki semua role termasuk EMPLOYEE) dan `vault.manageAny` (kelola vault
  semua user, hanya ADMIN).

- **`admin-user-lifecycle.ts`:** `resetUserPasswordByAdmin` dan
  `consumePasswordResetToken` kini men-generate `credentialSalt` baru dan
  me-re-enkripsi semua vault credential dalam satu transaksi atomik saat
  password diubah.

- **Menu sidebar** mendapat item "Akun Aplikasi" (`PiVaultDuotone`) di seksi
  "Akses Pribadi".

- **Halaman detail pegawai** mendapat tombol "Akun Aplikasi" di header untuk
  pengguna dengan role ADMIN.

- **`package.json`** mendapat script `db:seed:rsud` dan `db:migrate:deploy`.

- **`.env.example`** mendapat variabel `CREDENTIAL_ENCRYPTION_KEY`.

### Security

- Credential vault terenkripsi AES-256-GCM; plaintext tidak pernah disimpan
  ke database. Kunci turunan dari `CREDENTIAL_ENCRYPTION_KEY` env var +
  `userId` + `credentialSalt` via PBKDF2 (100.000 iterasi, SHA-256).
- Re-enkripsi otomatis saat password berubah memastikan credential tidak bisa
  didekripsi dengan salt lama setelah password diganti.

## 0.0.27 - 2026-05-31

### Added

- **Dynamic command-palette search (⌘K / Ctrl K).** The header search now
  queries real data through `/api/persona/search` — matching pegawai (name /
  NIP) and dokumen (number, label, institution, owner, type), permission-gated
  and with NIP masked for non-admins. Results are grouped (Pegawai / Dokumen /
  Halaman), keyboard-navigable (↑ ↓ to move, ↵ to open, esc to close), and the
  modal is larger with a hint bar and live result count.

### Changed

- **Tidied every table filter into a shared `FilterBar`.** Audit, Log
  Perubahan, Pegawai, Dokumen, and Verifikasi filters now use consistent
  labelled fields (`FilterBar` / `FilterField` / `SearchInput`) that wrap
  cleanly instead of a rigid single-row grid, each with a Reset action.
- **Date-range filters use a proper date-picker component** (`DateField`
  wrapping the themed calendar) instead of the bare native `type="date"` input,
  while still submitting `yyyy-mm-dd` to the same GET form.

### Fixed

- **Invisible confirm button on the "Nonaktifkan Pegawai" (and other danger)
  dialogs.** Tailwind's `content` glob only scanned `.tsx`, so the SweetAlert
  button classes built in `src/app/shared/confirm.ts` (notably `bg-rose-600`)
  were purged — the OK button rendered as white text on a transparent
  background. The glob now also scans `.ts`.
- **Black 404 flash after deactivating an employee.** Soft-delete no longer
  revalidates the (now-gone) detail path, and the screen navigates with
  `router.replace` to the list — so re-rendering the soft-deleted detail page
  can't throw `notFound()` mid-flow.
- **Friendly 404 page.** Added branded `not-found` boundaries — a global one
  and an in-dashboard one (rendered inside the sidebar/header shell) — replacing
  Next.js's bare black default with a card that explains the situation and
  offers links back to the Dashboard / Daftar Pegawai.

### Added

- **Thousand separators on every displayed number.** New `formatNumber` helper
  (`src/lib/format.ts`, `Intl.NumberFormat` with the app locale) applied across
  notifications, pagination summaries, and all stat/count displays (Pegawai,
  Dokumen, Audit, Verifikasi, Statistik, Master Jenis Dokumen, Pegawai detail,
  /me, Log Perubahan, Users, Sampah) so counts read e.g. `1.234`, not `1234`.

### Changed

- **NIK and NIP now reveal through separate audited endpoints.** The reveal
  action splits into `/api/persona/employees/:id/nik` and `.../nip`, each
  ADMIN-only and each writing its own audit-trail entry, so the two identifiers
  are disclosed and logged independently (UU PDP accountability).

## 0.0.25 - 2026-05-31

### Added

- **Sortable table headers across the app.** Click a column header to sort.
  Server-rendered, paginated tables (Audit, Log Perubahan, Pegawai, Dokumen,
  Master Jenis Dokumen) sort via `?sort`/`?dir` in the URL (correct across
  pages) using `SortableHeader` + `parseSort` (`src/lib/table-query.ts`).
  In-memory client tables (Users, Master Referensi, Sampah) sort instantly via
  `useClientSort` + `ClientSortHeader`.
- **Date-range filter + numbered pagination on Audit Log and Log Perubahan
  Data.** New `from`/`to` date inputs (`dateRangeWhere` helper) narrow by
  `createdAt`; both pages now paginate (50/page) instead of capping at 100, and
  the layout/filters were tidied with a Reset action.

### Changed

- Audit Log & Log Perubahan use the shared timezone-aware `formatDateTime`.

## 0.0.24 - 2026-05-31

### Added

- **Sampah / Trash (Google-Drive-style)** at `/sampah`: documents and
  attachments that are deleted go to trash instead of vanishing. Restore brings
  them back; permanent delete (admin-only, 2-step confirm) removes them for
  good. Deleted files are moved to a `.trash/<original path>` prefix in storage
  (kept, not erased) and only removed on permanent delete. New
  `pnpm storage:purge-trash [days]` retention cleaner (default 30 days).
- **Document attachment lifecycle**: per-file Delete + Replace (pick file →
  auto-submit), allowed only while the document isn't verified. Once a document
  is **Verified it locks** — metadata, uploads, replace, and delete are blocked.
  Any attachment change resets the document to pending review.
- **Permission-matrix RBAC** (`src/lib/rbac/*`): access is per-feature, not
  per-role. Menu items, routes (middleware), and buttons auto-hide/deny based on
  a single editable matrix. New `<Can>` + `usePermissions()` for client gating.
- **CAPTCHA on sign-in**: Google reCAPTCHA v3 (invisible) or Cloudflare
  Turnstile, else a self-managed `svg-captcha` fallback. See `docs/CAPTCHA.md`.

### Changed

- Numbered pagination (Bootstrap-style: first/prev, page numbers + ellipsis,
  next/last) replacing prev/next only.
- Skeleton loading states (`loading.tsx`) for the main pages.
- Footer moved out of the sidebar into a full-width `AppFooter` at the bottom.
- Sign-in page redesign; storage drivers gained `move`/`delete`.

### Fixed

- Admins can edit their own account (disabled toggles no longer submit empty).
- Removed FK constraints on `audit_logs.actorId` / `users.createdById` so audit
  history survives user/DB resets (was breaking every audited form after a seed).

## 0.0.23 - 2026-05-31

### Changed

- **NIP is now masked like NIK, role-based.** Both NIK and NIP are shown masked
  (`1990••••••••0012`) everywhere except for **admins** and the **data subject's
  own `/me`** page. Non-admin back-office roles (operator/verifier/viewer) only
  ever see masked values.
  - Employee detail: NIK + NIP both masked; the audited "Lihat" reveal is now
    **admin-only** (the reveal endpoint returns both and is gated to ADMIN).
  - Masked for non-admins in the employee list, document recap, verification
    queue, the employee picker (search API), and CSV export. Search still
    matches on the full value (masking is display-only).
  - New `canViewFullPii(role)` (admins only) + `maskNip()`; `RevealableNik`
    generalized to `RevealableId` (handles NIK and NIP, gated by `canReveal`).

## 0.0.22 - 2026-05-31

### Changed

- **Dropped NIK at-rest encryption — masking is now UI-only.** NIK is stored as
  plaintext; sensitive values are masked purely at the frontend (the back-office
  detail still shows `3503••••••••1234` with an audited reveal, `/me` shows the
  owner's own NIK). `PII_ENCRYPTION_KEY` is no longer needed. NIK search remains
  exact full-16-digit match (no substring lookup).

### Removed

- `src/lib/crypto/nik-cipher.ts`, the `pii:encrypt-nik` script
  (`scripts/encrypt-employee-nik.ts`), the cipher unit test, the
  `PII_ENCRYPTION_KEY` env var, and its System Diagnostics config check.
- Seed/faker now generate plaintext dummy NIK (migrate fresh + reseed: 2000
  employees, all NIK plaintext).

## 0.0.21 - 2026-05-31

### Added

- **Multi-institution, zero-config branding.** All institution-specific strings
  (app/organisation name, email domain, logo alt, support contact, copyright)
  now come from a single `src/config/app.ts` driven by `NEXT_PUBLIC_*` env
  vars. With no env set, neutral defaults apply ("Persona", no org name), so the
  same build runs for any instansi out of the box. See `.env.example`.
- **Timezone support.** Display timezone + locale are configurable
  (`NEXT_PUBLIC_APP_TIMEZONE`, default `Asia/Jakarta`; `NEXT_PUBLIC_APP_LOCALE`,
  default `id-ID`) via a shared `src/lib/datetime.ts`.
- **System Diagnostics page (`/sistem`, admin-only):** configuration self-check
  (no secrets exposed), database server timezone + clock drift, and an NTP
  (UDP/123) sync check against a public time source (`NTP_SERVER`), to keep time
  consistent across services.
- Proprietary `LICENSE` and `package.json` author/license metadata — copyright
  Wanforge (wanforge.asia) — Sugeng Sulistiyawan.

### Changed

- **Seed now uses faker dummy data (locale id_ID), not real staffing data.** The
  real export was moved to `prisma/data/.backup/` (gitignored, removed from
  tracking) so seeds carry no real PII. `prisma/data/dummy.ts` generates a
  reproducible set of employees (default 2000, `SEED_EMPLOYEE_COUNT`) across
  much larger reference pools (professions, units, ranks, grades, education,
  specialties), with encrypted dummy NIK. Document-type preset is selectable
  (`SEED_DOC_PRESET=medis|generik`, default `medis`), and the admin account is
  env-driven (`SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`, default
  `admin@<ORG_EMAIL_DOMAIN>` / `Admin@1234`).

## 0.0.20 - 2026-05-31

### Changed

- Restructured the per-employee document model into two levels so one checklist
  type can hold many real documents. A document _type_ (e.g. "Ijazah") is now a
  checklist item (`EmployeeDocument`, unique per employee × type); each concrete
  document (SD/SMP/SMA/S-1/S-2 ijazah, STR 2024, etc.) is a new `DocumentItem`
  with its own metadata, attachments, and verification history. Attachments are
  flexible: one document can be a single PDF or several per-page files ordered
  by page number.
  - Document detail page is now a per-item manager (`DocumentItemsManager`): add
    documents, edit metadata + upload attachments per document, and delete a
    document. A checklist type counts as complete once at least one of its
    documents is complete.
  - Verification operates per document (`DocumentItem`); the queue, decision
    panel, and history all key off the individual document.
  - Read-side rollups updated across the recap (`/dokumen`), dashboard,
    employee detail, employee portal (`/me`), notifications, secure attachment
    download (ownership now via `documentItem → employeeDocument`), and CSV
    export (now one row per document, with a Label column).

### Migration

- `restructure_documents_into_items`: moves document metadata/attachments/
  verifications onto `document_items`, repoints attachment/verification foreign
  keys to `documentItemId`, and adds a unique index on
  `employee_documents(employeeId, documentTypeId)`.

## 0.0.19 - 2026-05-31

### Changed

- Extended field hints + Title Case labels to the remaining forms: document metadata + attachment upload, verification decision, admin password reset link, data-request resolution, and document-type rule. Every form field now has a hint.

## 0.0.18 - 2026-05-31

### Changed

- Established the permanent form convention: every field has a hint and labels are Title Case. Added a shared `LabelWithHint`/`FieldHint` (info icon + tooltip) and applied it to the user create/manage forms and the employee data-request form. Existing employee forms already use field hints.

## 0.0.17 - 2026-05-31

### Fixed

- Seeded/bulk-imported employees had no document checklist (no `EmployeeDocument` rows), so there was nothing to fill or upload. Added a "Buat/Lengkapi Checklist" action on the employee detail (creates missing rows for active document types, audited), a `pnpm employees:backfill-docs` script (backfilled 16,100 rows across 805 employees), and the seed now generates checklists too.

## 0.0.16 - 2026-05-30

### Changed

- Cleaned up the sidebar menu: removed the redundant "Checklist Arsip" and "Arsip Fisik" items (both linked to the same Dokumen page), and gave every menu entry a unique icon (Permintaan Data → lock-key, Log Perubahan Data → history).

## 0.0.15 - 2026-05-30

### Changed

- Employee picker dropdown now shows the NIP as a sub-line under the name in each option, and displays only the name once selected.

## 0.0.14 - 2026-05-30

### Changed

- Replaced on/off (active/inactive) checkboxes with switch toggles across the app via a shared `ToggleSwitch` component: user active status, document type rules (active/required/verification/expiration), and the master reference manager. The login "remember me" stays a checkbox.

## 0.0.13 - 2026-05-30

### Added

- At-rest encryption for NIK (UU PDP Pasal 35): NIK is stored as deterministic AES-256-GCM ciphertext (`enc:1:` envelope) instead of plaintext. Deterministic so the existing `nik @unique` and exact-match lookup keep working with no schema change; substring NIK search becomes exact full-NIK match. Decryption only at masked/audited display points. Configure `PII_ENCRYPTION_KEY` (falls back to `NEXTAUTH_SECRET`); migrate existing rows with `pnpm pii:encrypt-nik` (idempotent).

## 0.0.12 - 2026-05-30

### Added

- Data subject request workflow (UU PDP / UU ITE Pasal 26): employees submit access/correction/erasure requests from `/me` and track their status; back-office reviews and resolves them at `/permintaan-data`. New `DataSubjectRequest` model (standalone, string type/status per the no-DB-enum convention), audited on submit and resolve.

## 0.0.11 - 2026-05-30

### Added

- PII retention: `anonymizeExpiredEmployees` clears NIK/email/phone for employees soft-deleted longer than the retention window (default 365 days) while keeping the anonymized record + document history. Run via `pnpm employees:prune [days]`; the batch is audited. Idempotent.

## 0.0.10 - 2026-05-30

### Added

- NIK masking on the back-office employee detail (`3503••••••••1234`) with an audited "Lihat" reveal via `GET /api/persona/employees/[id]/nik` (back-office only; each reveal is logged). Data-minimization per UU PDP; the employee still sees their own full NIK on `/me`.

## 0.0.9 - 2026-05-30

### Added

- Searchable, AJAX-backed employee picker (select2-style) for linking employees to user accounts, replacing the preloaded `<select>`. Scales to thousands of employees and only loads minimal fields on demand.
- `GET /api/persona/employees/search` — back-office-only typeahead returning just id/name/NIP (data minimization, UU PDP); never exposes NIK or other sensitive PII, and is not reachable by the EMPLOYEE role.

## 0.0.8 - 2026-05-30

### Changed

- Switched all primary key defaults from `cuid()` to `uuid(7)` (UUIDv7) so IDs are time-sortable (creation order) by their string value. UUIDv7 is client-generated by Prisma, so no SQL migration is required — only client regeneration. Existing cuid rows keep their values; reseed for a fully consistent, co-sortable ID set.

## 0.0.7 - 2026-05-30

### Added

- Full user management on `/users`, organized into tabs ("Daftar User" + "Tambah User"):
  - Search and role filter over the user list.
  - Per-user manage panel: edit name/role/linked employee/active status, reset password, generate one-time reset link, and soft delete.
  - Guards: cannot demote/deactivate/delete the last active admin or your own account; audited via the shared audit logger.

## 0.0.6 - 2026-05-30

### Changed

- Made page content full-width: removed the `mx-auto max-w-[1500px]` constraint from all back-office/portal page wrappers, matching the isomorphic app convention (layout padding handles spacing).

## 0.0.5 - 2026-05-30

### Added

- Tightened audit logging across every event:
  - New audited events: `LOGIN`, `LOGOUT` (via NextAuth events) and `DOWNLOAD` (sensitive attachment access).
  - Central `recordAuditLog` helper for a consistent shape (actor, role, source, summary, metadata) that never breaks the primary operation.
  - Every back-office mutation now records its `source` (BACK_OFFICE); login/download record EMPLOYEE_PORTAL vs BACK_OFFICE by role.
- Extended the `AuditAction` enum (`LOGIN`, `LOGOUT`, `DOWNLOAD`) and surfaced them in the audit log filters/labels.

## 0.0.4 - 2026-05-30

### Added

- Functional header notifications: a role-aware `/api/persona/notifications` endpoint surfaces actionable items (pending verifications, expiring/incomplete documents for back-office; needs-revision/incomplete/expiring for the signed-in employee), with a live dot indicator.

### Changed

- Profile menu now uses the real session (name, email, role) with role-aware links (Dashboard, Data Saya, Log Aktivitas) and a proper sign-out redirect.
- Allowed `/api/persona/notifications` through middleware for EMPLOYEE accounts.

### Removed

- Removed the non-functional Messages dropdown from the header (and its demo data).

## 0.0.3 - 2026-05-30

### Changed

- Dashboard sidebar and mobile header now use the Persona logo (`logo.svg` / `logo-short.svg`) instead of the template's built-in wordmark.

## 0.0.2 - 2026-05-30

### Fixed

- Suppressed the benign `JWT_SESSION_ERROR` that NextAuth logged on every root-layout render when a stale/invalid session cookie was present (the console error replayed into the browser on `/signin`). Such a cookie now simply means "logged out".

## 0.0.1 - 2026-05-30

Initial development release of Persona — the personnel document archive for
RSUD dr. Soedomo Trenggalek.

### Features

- Authentication (NextAuth credentials), RBAC for ADMIN, OPERATOR, VERIFIER,
  VIEWER, EMPLOYEE, and per-email login rate limiting.
- Employee master data: list with search/filter, pagination, create/edit,
  soft delete, and per-employee document checklist.
- Master document types (20 required categories) with admin-editable rules.
- Employee documents: metadata editing, multi-file attachment uploads as
  history, completeness computation, and per-type document detail.
- Verification workflow (verify/reject/needs-revision) with history and
  follow-up targets.
- Cross-employee document recap with expiration filters (30/60/90 days) and
  CSV export; dashboard with actionable expiring/verification tables.
- Employee self-service portal (`/me`) scoped by ownership.
- Admin user management, admin-issued one-time password reset links, and an
  audit log with retention pruning (`pnpm audit:prune`).

### Infrastructure

- Prisma 7 + MySQL/MariaDB schema and seed (admin + 20 document types).
- Pluggable document storage (`FILESYSTEM_DISK`): local disk (`./storage`,
  grouped per module) or S3-compatible object storage via standard `AWS_*` env.
- Security headers (CSP, HSTS, etc.), enum-typed constants throughout, and a
  Node-test-runner unit suite (`pnpm test`).

### Branding

- Logo wordmark outlined to Inter vector paths; UI accent and theme aligned to
  the brand teal (#037171) with amber accents.
