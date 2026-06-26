# Persona RSUD Trenggalek - Implementation Plan

## Ringkasan Produk

Persona adalah aplikasi arsip dokumen kepegawaian RSUD dr. Soedomo Trenggalek. Fokus utama aplikasi ini adalah memastikan setiap pegawai memiliki data dokumen wajib yang terstruktur, bisa diverifikasi, memiliki riwayat upload, dan mudah dipantau kelengkapannya.

Target pengguna utama:

1. Admin SDM: mengelola akun, master data, dan aturan dokumen.
2. Operator arsip: input data pegawai, dokumen, lampiran, dan tindak lanjut.
3. Verifikator: memeriksa kelengkapan dan validitas dokumen.
4. Pimpinan/Viewer: melihat rekap, status, dan dokumen yang perlu tindakan.
5. Pegawai: melihat data dan dokumen miliknya sendiri, serta mengajukan pembaruan/lampiran bila diizinkan.

## Prinsip Produk

1. Data lama tidak ditimpa. Dokumen baru disimpan sebagai riwayat.
2. Setiap item dokumen wajib punya form lampiran, meskipun file belum tersedia.
3. Status lengkap hanya boleh muncul jika metadata dokumen dan lampiran upload sama-sama ada.
4. Dokumen kedaluwarsa tidak dihapus; statusnya diubah menjadi kedaluwarsa/tidak aktif.
5. UI harus nyaman untuk kerja operasional harian: padat, mudah dipindai, dan minim dekorasi.
6. Pegawai hanya boleh mengakses data miliknya sendiri, kecuali ia juga memiliki role back-office.

## Kondisi Saat Ini

Sudah tersedia:

1. Next.js 15 dengan app router.
2. Prisma 7 dan PostgreSQL.
3. NextAuth credentials login.
4. Model `User` dengan role `ADMIN`, `OPERATOR`, dan `VIEWER`.
5. Seed admin awal.
6. Dokumen domain utama di `MAIN DATA.md`.

Masih bawaan template:

1. Dashboard awal.
2. Menu sidebar.
3. Route demo/template.
4. README aplikasi.

Belum tersedia:

1. Model pegawai.
2. Model jenis dokumen wajib.
3. Model dokumen pegawai dan upload lampiran.
4. Workflow verifikasi.
5. Dashboard kelengkapan.
6. RBAC per role.
7. Self-service portal pegawai.
8. Audit log.

## Scope MVP

MVP harus menjawab kebutuhan inti: pegawai bisa dicatat, 20 dokumen wajib bisa dilacak, lampiran bisa diunggah sebagai riwayat, dan status kelengkapan/verifikasi bisa dipantau.

### Fitur MVP

1. Autentikasi dan role dasar
   - Login email/password.
   - Role `ADMIN`, `OPERATOR`, `VERIFIER`, `VIEWER`, `EMPLOYEE`.
   - Proteksi route berdasarkan login.
   - Tidak ada registrasi publik; akun hanya dibuat oleh admin.
   - Tidak ada fitur lupa password publik.
   - Reset password dilakukan oleh admin, atau admin membuat link reset sekali pakai bila dibutuhkan.
   - Batasi aksi mutasi data untuk `VIEWER`.
   - Batasi `EMPLOYEE` agar hanya bisa membaca data dan dokumen miliknya sendiri.
   - Jika self-upload diaktifkan, file dari `EMPLOYEE` masuk sebagai pengajuan/pending dan tetap harus diverifikasi.

2. Dashboard
   - Total pegawai.
   - Total dokumen lengkap, belum lengkap, kedaluwarsa, dan perlu verifikasi.
   - Dokumen mendekati kedaluwarsa.
   - Pegawai dengan dokumen wajib belum lengkap.

3. Master pegawai
   - List pegawai dengan pencarian dan filter unit kerja/status.
   - Tambah/edit/detail pegawai.
   - Soft delete.
   - Data minimal: nama, NIP/NIK, jabatan, profesi, unit kerja, status pegawai, status aktif.

4. Master jenis dokumen
   - Seed 20 dokumen wajib dari `MAIN DATA.md`.
   - Aturan dokumen: wajib semua pegawai, wajib profesi tertentu, masa berlaku, perlu verifikasi, dan deskripsi metadata.
   - Admin dapat mengubah aturan tanpa migrasi kode bila memungkinkan.

5. Dokumen pegawai
   - Checklist 20 dokumen per pegawai.
   - Metadata dokumen sesuai kategori.
   - Status berkas: Asli, Fotokopi, Legalisir.
   - Status masa berlaku: Aktif, Kedaluwarsa, Tidak Tercantum.
   - Status kelengkapan dihitung dari metadata dan lampiran.
   - Satu dokumen aktif/terbaru, dokumen lain menjadi riwayat.

6. Upload lampiran
   - Upload multi-file per dokumen.
   - Simpan nama file asli, nama file arsip, mime type, ukuran, path/url, urutan halaman, petugas upload, dan keterangan perubahan.
   - File upload awal belum wajib, tetapi status lengkap menunggu file tersedia.

7. Verifikasi
   - Verifikator menandai dokumen sudah/belum diverifikasi.
   - Simpan tanggal verifikasi, petugas verifikator, hasil, dan catatan tindak lanjut.
   - Target pelengkapan untuk dokumen belum lengkap.

8. Audit log ringan
   - Catat aksi penting: create, update, upload, verify, soft delete.
   - Simpan aktor, objek, aksi, waktu, dan ringkasan perubahan.

9. Portal pegawai
   - Pegawai login dan melihat profil kepegawaian miliknya.
   - Pegawai melihat checklist dokumen, status kelengkapan, status masa berlaku, catatan tindak lanjut, dan target pelengkapan.
   - Pegawai tidak melihat data pegawai lain.
   - Pegawai tidak bisa mengubah status verifikasi, status kelengkapan final, atau metadata yang sudah dikunci.
   - Pegawai dapat mengajukan perubahan data/lampiran jika kebijakan RSUD mengizinkan.

## RBAC dan Hak Akses

Hak akses dibagi menjadi back-office dan self-service pegawai. Back-office mengelola arsip lintas pegawai; self-service hanya untuk data diri sendiri.

### Role

1. `ADMIN`
   - Kelola user, role, master jenis dokumen, dan konfigurasi sistem.
   - Membuat akun user baru; tidak ada self-registration.
   - Reset password user langsung atau menerbitkan link reset sekali pakai.
   - Baca/tulis semua data pegawai, dokumen, lampiran, verifikasi, dan audit.
   - Bisa melakukan soft delete dan restore jika fitur restore ditambahkan.

2. `OPERATOR`
   - Baca semua data pegawai dan dokumen.
   - Tambah/edit pegawai, metadata dokumen, dan lampiran.
   - Tidak bisa mengubah master jenis dokumen kecuali diberi permission khusus.
   - Tidak bisa melakukan final verify kecuali juga punya role `VERIFIER`.

3. `VERIFIER`
   - Baca semua data pegawai dan dokumen.
   - Memverifikasi, menolak, atau meminta revisi dokumen.
   - Mengisi catatan tindak lanjut dan target pelengkapan.
   - Tidak otomatis boleh mengelola user/master data.

4. `VIEWER`
   - Baca dashboard, rekap, dan detail dokumen sesuai kebutuhan pimpinan.
   - Tidak bisa create/update/delete/upload/verify.
   - Akses file scan bisa dibatasi dengan permission tambahan bila dokumen dianggap sensitif.

5. `EMPLOYEE`
   - Baca profil dan checklist dokumen miliknya sendiri.
   - Baca lampiran miliknya sendiri jika kebijakan mengizinkan preview/download.
   - Lihat status kelengkapan, masa berlaku, verifikasi, catatan revisi, dan target tindak lanjut.
   - Dapat upload lampiran baru sebagai pengajuan bila fitur self-upload aktif.
   - Tidak bisa melihat data pegawai lain.
   - Tidak bisa mengubah hasil verifikasi, audit log, master dokumen, role, atau data pegawai final.

### Matriks Akses MVP

| Fitur | ADMIN | OPERATOR | VERIFIER | VIEWER | EMPLOYEE |
| --- | --- | --- | --- | --- | --- |
| Dashboard global | Ya | Ya | Ya | Ya | Tidak |
| Dashboard pribadi | Ya | Ya | Ya | Tidak | Ya |
| List semua pegawai | Ya | Ya | Ya | Ya | Tidak |
| Detail pegawai lain | Ya | Ya | Ya | Ya | Tidak |
| Detail profil sendiri | Ya | Ya | Ya | Ya | Ya |
| Create/edit pegawai | Ya | Ya | Tidak | Tidak | Tidak |
| Kelola master jenis dokumen | Ya | Tidak | Tidak | Tidak | Tidak |
| Input/edit metadata dokumen | Ya | Ya | Tidak | Tidak | Tidak |
| Upload lampiran back-office | Ya | Ya | Tidak | Tidak | Tidak |
| Upload lampiran pribadi pending | Opsional | Opsional | Tidak | Tidak | Opsional |
| Verifikasi dokumen | Ya | Tidak | Ya | Tidak | Tidak |
| Lihat audit log | Ya | Terbatas | Terbatas | Tidak | Tidak |
| Kelola user/role | Ya | Tidak | Tidak | Tidak | Tidak |

### Aturan Ownership

1. `User.employeeId` menghubungkan akun login pegawai ke satu record `Employee`.
2. Request dari `EMPLOYEE` wajib selalu difilter dengan `employeeId` dari session, bukan dari parameter URL saja.
3. Route seperti `/me` atau `/portal` lebih aman untuk pegawai daripada membuka `/pegawai/[id]`.
4. Jika pegawai memiliki role ganda, misalnya admin yang juga pegawai, akses back-office tetap eksplisit dan akses pribadi tetap tersedia.
5. Semua akses file scan harus melewati authorization server-side; jangan pernah mengandalkan URL publik tanpa kontrol.

### Lifecycle User dan Password

1. Akun hanya boleh dibuat dari halaman admin `/users`.
2. Tidak ada halaman sign up publik dan tidak ada API public registration.
3. Admin menentukan role user saat create/update.
4. Untuk akun pegawai, admin wajib menghubungkan user ke record `Employee` sebelum role `EMPLOYEE` dapat dipakai penuh.
5. Password awal dibuat oleh admin atau digenerate sistem lalu disampaikan lewat kanal internal.
6. Reset password normal dilakukan oleh admin dengan password baru.
7. Jika dibutuhkan, admin dapat menerbitkan link reset sekali pakai yang punya expiry, status used/revoked, dan audit log.
8. Link reset tidak boleh dibuat dari halaman publik "forgot password".
9. User nonaktif, soft-deleted, atau tidak punya `employeeId` saat role `EMPLOYEE` tidak boleh masuk ke data pribadi.

## Model Data Usulan

Model inti:

1. `User`
2. `Employee`
3. `DocumentType`
4. `EmployeeDocument`
5. `DocumentAttachment`
6. `DocumentVerification`
7. `PasswordResetToken`
8. `AuditLog`

Enum penting:

1. `UserRole`: `ADMIN`, `OPERATOR`, `VERIFIER`, `VIEWER`, `EMPLOYEE`
2. `EmploymentStatus`: `PNS`, `PPPK`, `KONTRAK`, `BLUD`, `LAINNYA`
3. `EmployeeStatus`: `ACTIVE`, `INACTIVE`, `RETIRED`, `MUTATION`
4. `DocumentCopyStatus`: `ORIGINAL`, `COPY`, `LEGALIZED`
5. `DocumentValidityStatus`: `ACTIVE`, `EXPIRED`, `NOT_LISTED`
6. `DocumentCompletenessStatus`: `COMPLETE`, `INCOMPLETE`
7. `VerificationStatus`: `PENDING`, `VERIFIED`, `REJECTED`, `NEEDS_REVISION`
8. `ScanQuality`: `CLEAR`, `FAIR`, `UNCLEAR`
9. `AttachmentSource`: `BACK_OFFICE`, `EMPLOYEE_PORTAL`
10. `AttachmentStatus`: `DRAFT`, `PENDING_REVIEW`, `ACCEPTED`, `REJECTED`

Relasi utama:

1. Satu `User` dapat terhubung ke satu `Employee` melalui `employeeId` untuk portal pegawai.
2. Satu pegawai memiliki banyak dokumen.
3. Satu jenis dokumen memiliki banyak dokumen pegawai.
4. Satu dokumen pegawai memiliki banyak lampiran.
5. Satu dokumen pegawai dapat memiliki banyak riwayat verifikasi.
6. Satu dokumen aktif dapat ditandai dengan `isCurrent`.
7. Satu user dapat memiliki banyak token reset password yang diterbitkan admin.

Catatan desain:

1. Metadata khusus dokumen dapat dimulai dengan kolom umum plus `metadata Json`.
2. Untuk MVP, gunakan storage lokal di folder private aplikasi atau provider upload yang sudah ada di stack.
3. Jangan menyimpan file biner di database.
4. Tambahkan `User.employeeId String? @unique` atau relasi setara agar akun pegawai tidak perlu dibuat sebagai admin/operator.
5. Jika satu user perlu banyak role, pertimbangkan `UserRoleAssignment`; untuk MVP, satu enum role cukup asal `EMPLOYEE` tersedia.
6. Simpan token reset password dalam bentuk hash, bukan token mentah.

## Struktur Route MVP

Route aplikasi:

1. `/` - dashboard
2. `/pegawai` - list pegawai
3. `/pegawai/create` - tambah pegawai
4. `/pegawai/[id]` - detail pegawai dan checklist dokumen
5. `/pegawai/[id]/edit` - edit pegawai
6. `/pegawai/[id]/dokumen/[documentTypeId]` - riwayat dokumen per jenis
7. `/dokumen` - rekap dokumen lintas pegawai
8. `/verifikasi` - antrean verifikasi
9. `/master/jenis-dokumen` - master jenis dokumen
10. `/users` - manajemen user admin
11. `/me` - portal data pribadi pegawai
12. `/me/dokumen/[documentTypeId]` - detail dokumen pribadi
13. `/signin` - login

## Urutan Implementasi

### Fase 1 - Fondasi Domain

1. Rapikan README dan environment example.
2. Tambahkan model Prisma domain arsip.
3. Seed 20 jenis dokumen wajib.
4. Generate Prisma client dan jalankan migration.
5. Tambahkan relasi akun pegawai melalui `User.employeeId`.
6. Tambahkan `PasswordResetToken` untuk reset password/admin-issued link.
7. Buat helper status kelengkapan dokumen.
8. Buat helper authorization dasar untuk role dan ownership.

Kriteria selesai:

1. Database punya tabel domain.
2. Seed menghasilkan admin dan 20 jenis dokumen.
3. Akun `EMPLOYEE` bisa dikaitkan ke satu record pegawai.
4. Tidak ada jalur signup publik atau forgot password publik.
5. Type check lulus.

### Fase 2 - Navigasi dan Dashboard

1. Ganti route/menu template menjadi menu Persona.
2. Ganti halaman dashboard template.
3. Buat query statistik dasar.
4. Tampilkan kartu ringkasan, tabel dokumen kedaluwarsa, dan antrean verifikasi.
5. Tambahkan route `/me` untuk dashboard pribadi pegawai.

Kriteria selesai:

1. Sidebar hanya berisi menu aplikasi Persona.
2. Dashboard membaca data database.
3. Pegawai yang login sebagai `EMPLOYEE` diarahkan ke dashboard pribadi, bukan dashboard global.
4. Empty state tersedia saat data belum ada.

### Fase 3 - Pegawai

1. Buat list pegawai dengan search, filter, pagination.
2. Buat form tambah/edit pegawai.
3. Buat detail pegawai.
4. Saat pegawai dibuat, siapkan checklist 20 dokumen wajib.
5. Tambahkan aksi admin untuk menghubungkan akun user ke record pegawai.

Kriteria selesai:

1. Operator bisa membuat pegawai.
2. Detail pegawai menampilkan checklist dokumen.
3. Akun pegawai hanya bisa melihat data miliknya melalui `/me`.
4. Soft delete berjalan.

### Fase 4 - Dokumen dan Lampiran

1. Buat form metadata dokumen.
2. Buat upload multi-file.
3. Buat riwayat dokumen dan lampiran.
4. Hitung status lengkap berdasarkan metadata dan upload.
5. Tandai dokumen aktif/terbaru.
6. Jika self-upload aktif, buat upload pegawai sebagai submission pending yang menunggu operator/verifikator.

Kriteria selesai:

1. Dokumen lama tidak tertimpa.
2. File baru masuk sebagai riwayat.
3. Status lengkap tidak bisa muncul tanpa lampiran.
4. Pegawai tidak bisa mengubah dokumen pegawai lain atau status final.

### Fase 5 - Verifikasi dan Audit

1. Buat antrean dokumen pending verification.
2. Buat aksi verifikasi/revisi/tolak.
3. Buat catatan tindak lanjut dan target pelengkapan.
4. Catat audit log untuk aksi penting.
5. Catat sumber perubahan: back-office atau self-service pegawai.

Kriteria selesai:

1. Verifikator bisa memproses dokumen.
2. Riwayat verifikasi terbaca di detail dokumen.
3. Audit log menyimpan aktor, role, sumber aksi, dan ringkasan aksi.

### Fase 6 - Polishing Operasional

1. Ekspor rekap CSV/XLSX bila dibutuhkan.
2. Tambahkan filter kedaluwarsa dalam 30/60/90 hari.
3. Tambahkan role guard yang lebih ketat.
4. Tambahkan validasi UI dan server.
5. Tambahkan test pada helper domain penting.
6. Tambahkan test ownership untuk akses `/me` dan route file.

Kriteria selesai:

1. Alur harian operator terasa ringkas.
2. Error state dan loading state layak produksi.
3. Build dan type check lulus.

## Skills yang Dibutuhkan

### Product Analyst

Tugas:

1. Menerjemahkan `MAIN DATA.md` menjadi aturan produk.
2. Menentukan status, role, dan alur kerja.
3. Menjaga scope MVP agar tidak melebar.

Output:

1. User story.
2. Acceptance criteria.
3. Daftar edge case operasional.

### Database Architect

Tugas:

1. Mendesain schema Prisma.
2. Menentukan relasi, enum, indexing, dan soft delete.
3. Menjaga auditability dokumen.

Output:

1. Migration Prisma.
2. Seed data.
3. Catatan keputusan model data.

### Next.js Engineer

Tugas:

1. Membuat route app router.
2. Menulis server action/API route.
3. Menyusun query Prisma dan validasi Zod.
4. Menjaga type safety.

Output:

1. Halaman dan form fitur.
2. Server-side mutation.
3. Type check dan build bersih.

### UI/UX Designer

Tugas:

1. Mengubah template menjadi aplikasi kerja SDM.
2. Mendesain dashboard padat dan mudah dipindai.
3. Membuat tabel, filter, badge status, empty state, dan form yang jelas.

Output:

1. Layout dashboard.
2. Komponen status dokumen.
3. Pola form dokumen dan upload.

### QA Engineer

Tugas:

1. Menyusun skenario test untuk alur penting.
2. Mengecek status kelengkapan, upload riwayat, dan verifikasi.
3. Memastikan role guard tidak bocor.

Output:

1. Checklist test manual.
2. Unit test helper domain.
3. Catatan risiko rilis.

### Security and Compliance Reviewer

Tugas:

1. Meninjau akses dokumen pribadi.
2. Menjaga dokumen tidak terbuka publik.
3. Mengecek audit log, soft delete, dan validasi upload.

Output:

1. Checklist keamanan.
2. Rekomendasi storage.
3. Batasan file upload.

## Prompt Utama untuk Codex

Gunakan prompt ini untuk melanjutkan implementasi secara bertahap:

```text
Kita sedang membangun aplikasi Persona RSUD Trenggalek di monorepo ini, fokus pada apps/persona.

Tujuan produk:
Membuat aplikasi arsip dokumen kepegawaian untuk melacak 20 dokumen wajib pegawai, upload lampiran multi-file, riwayat dokumen, status kelengkapan, verifikasi, dan dashboard operasional.

Konteks penting:
- Domain utama ada di apps/persona/MAIN DATA.md.
- Rencana implementasi ada di apps/persona/IMPLEMENTATION_PLAN.md.
- Stack: Next.js 15 app router, React 19, Prisma 7, PostgreSQL, NextAuth credentials, Tailwind/RizzUI/Isomorphic template.
- Model User dan login sudah ada.
- RBAC target: ADMIN, OPERATOR, VERIFIER, VIEWER, EMPLOYEE.
- EMPLOYEE hanya boleh mengakses data dirinya sendiri melalui relasi User.employeeId.
- User tidak bisa daftar sendiri; akun hanya dibuat admin.
- Reset password hanya dari admin, termasuk link reset sekali pakai jika nanti dibutuhkan.
- Jangan hapus riwayat dokumen. Dokumen baru harus ditambahkan sebagai riwayat.
- Status lengkap hanya boleh jika metadata dokumen dan minimal satu lampiran file tersedia.
- UI harus terasa seperti aplikasi operasional SDM/arsip, bukan landing page.

Kerjakan fase berikutnya secara end-to-end:
1. Baca file relevan dulu.
2. Ikuti pola existing codebase.
3. Buat perubahan kecil tapi lengkap.
4. Jalankan type check/build atau jelaskan jika tidak bisa.
5. Jangan mengubah file yang tidak relevan.

Mulai dari: [ISI FASE/TUGAS SPESIFIK DI SINI]
```

## Prompt Fase 1 - Schema dan Seed

```text
Implementasikan Fase 1 untuk apps/persona:

1. Tambahkan model Prisma untuk Employee, DocumentType, EmployeeDocument, DocumentAttachment, DocumentVerification, dan AuditLog.
2. Update UserRole menjadi ADMIN, OPERATOR, VERIFIER, VIEWER, EMPLOYEE.
3. Tambahkan relasi User.employeeId ke Employee untuk portal pegawai.
4. Tambahkan PasswordResetToken untuk link reset yang hanya diterbitkan admin.
5. Tambahkan enum domain yang diperlukan untuk status pegawai, status dokumen, status upload, kualitas scan, lampiran, dan verifikasi.
6. Buat seed 20 DocumentType dari apps/persona/MAIN DATA.md.
7. Pertahankan seed admin yang sudah ada.
8. Tambahkan helper domain untuk menghitung status kelengkapan dokumen:
   - incomplete jika metadata wajib belum cukup
   - incomplete jika belum ada lampiran
   - complete jika metadata cukup dan minimal satu lampiran ada
9. Tambahkan helper authorization untuk role guard dan ownership:
   - back-office boleh akses sesuai role
   - EMPLOYEE hanya boleh akses Employee dengan id yang sama dengan session.user.employeeId
10. Pastikan tidak ada route/API signup publik atau forgot password publik.
11. Jalankan prisma generate dan type check.

Pastikan desain schema mendukung riwayat dokumen, soft delete, dan dokumen aktif/terbaru.
```

## Prompt Fase 2 - Dashboard dan Menu

```text
Implementasikan Fase 2 untuk apps/persona:

1. Ganti route dan sidebar bawaan template menjadi menu Persona:
   - Dashboard
   - Pegawai
   - Dokumen
   - Verifikasi
   - Master Jenis Dokumen
   - Users
   - Data Saya
2. Ganti halaman utama dengan dashboard arsip:
   - total pegawai
   - dokumen lengkap
   - dokumen belum lengkap
   - dokumen kedaluwarsa
   - antrean verifikasi
3. Buat halaman /me untuk dashboard pribadi pegawai:
   - profil ringkas
   - checklist dokumen pribadi
   - dokumen belum lengkap
   - dokumen kedaluwarsa/mendekati kedaluwarsa
   - catatan tindak lanjut
4. Gunakan query Prisma server-side.
5. Pastikan EMPLOYEE tidak bisa melihat dashboard global.
6. Buat empty state yang rapi untuk database kosong.
7. Jangan buat landing page.
8. Jalankan type check.
```

## Prompt Fase 3 - Pegawai

```text
Implementasikan Fase 3 untuk apps/persona:

1. Buat halaman list pegawai dengan search, filter status/unit, dan pagination sederhana.
2. Buat form create/edit pegawai dengan Zod validation.
3. Buat detail pegawai yang menampilkan identitas pegawai dan checklist 20 jenis dokumen.
4. Saat pegawai baru dibuat, siapkan dokumen/checklist wajib berdasarkan DocumentType aktif.
5. Tambahkan cara admin menghubungkan akun User dengan Employee untuk akses portal pegawai.
6. Gunakan server action atau API route sesuai pola paling cocok di codebase.
7. Pastikan VIEWER dan EMPLOYEE tidak bisa create/update/delete pegawai.
8. Pastikan EMPLOYEE hanya bisa membaca profil sendiri melalui /me, bukan /pegawai/[id].
9. Jalankan type check.
```

## Prompt Fase 4 - Dokumen, Upload, Riwayat

```text
Implementasikan Fase 4 untuk apps/persona:

1. Buat halaman detail dokumen pegawai per jenis dokumen.
2. Buat form metadata dokumen.
3. Buat upload multi-file lampiran.
4. Simpan lampiran sebagai riwayat, jangan menimpa file lama.
5. Simpan urutan halaman/lampiran, petugas upload, kualitas scan, dan keterangan perubahan.
6. Tambahkan aksi tandai dokumen sebagai aktif/terbaru.
7. Hitung ulang status kelengkapan setelah metadata atau lampiran berubah.
8. Jika self-upload pegawai diaktifkan, simpan upload sebagai submission pending/revision dan jangan otomatis mengubah status verified.
9. Pastikan EMPLOYEE hanya bisa upload/lihat lampiran untuk dokumen miliknya sendiri.
10. Jalankan type check.
```

## Prompt Fase 5 - Verifikasi dan Audit

```text
Implementasikan Fase 5 untuk apps/persona:

1. Buat halaman antrean verifikasi dokumen.
2. Buat aksi verify, reject, dan needs revision.
3. Simpan tanggal verifikasi, verifikator, catatan, dan target tindak lanjut.
4. Catat audit log untuk create/update/upload/verify/delete.
5. Catat role dan sumber aksi: back-office atau self-service pegawai.
6. Tampilkan riwayat verifikasi dan audit ringkas di detail dokumen.
7. Pastikan catatan revisi yang relevan tampil di /me untuk pegawai terkait.
8. Jalankan type check.
```

## Definition of Done

Satu fase dianggap selesai jika:

1. Fitur bisa dipakai dari UI.
2. Mutasi data tervalidasi di server.
3. Role dasar dihormati.
4. Ownership pegawai ditegakkan server-side, bukan hanya disembunyikan di UI.
5. Empty, loading, dan error state tidak rusak.
6. Type check lulus.
7. Build lulus atau hambatannya dicatat jelas.
8. Tidak ada perubahan template/demo yang tersisa di jalur utama aplikasi.

## Risiko dan Keputusan yang Perlu Dikunci

1. Storage file: lokal private, UploadThing, S3-compatible, atau storage internal RSUD.
2. Ukuran maksimal file dan tipe file yang diizinkan.
3. Apakah data NIP/NIK wajib unik.
4. Apakah semua pegawai wajib 20 dokumen, atau ada dokumen yang hanya wajib untuk profesi tertentu.
5. Siapa saja yang boleh mengunduh/melihat file scan.
6. Format ekspor laporan yang dibutuhkan.
7. Retensi audit log dan dokumen pegawai nonaktif.
8. Apakah pegawai boleh upload lampiran sendiri, atau hanya melihat status dan catatan.
9. Apakah pegawai boleh mengajukan koreksi profil, dan siapa yang menyetujui.
