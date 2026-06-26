# Kepatuhan Pelindungan Data — Persona RSUD dr. Soedomo Trenggalek

Dokumen ini memetakan kewajiban **UU No. 27/2022 (Pelindungan Data Pribadi / PDP)**
dan **UU ITE (UU 11/2008 jo. 19/2016 jo. 1/2024) + PP 71/2019** terhadap kondisi
aplikasi Persona, beserta gap yang masih terbuka. Disusun sebagai bagian dari
kewajiban **akuntabilitas** (UU PDP Pasal 20).

Data pegawai bersifat **sensitif/pribadi**: nama, NIP, **NIK**, kontak, jabatan,
serta dokumen kepegawaian (ijazah, STR/SIP, SKP, dll). Sebagian dapat tergolong
**data pribadi spesifik** (Pasal 4) bila memuat data kesehatan.

## Status Pengendalian Teknis

| Kewajiban (UU PDP / ITE) | Status | Implementasi di Persona |
| --- | --- | --- |
| Batasan tujuan & dasar pemrosesan | ✅ | Sistem internal arsip kepegawaian; tanpa registrasi publik. |
| **Minimisasi data** (Pasal 16) | ✅ | API pencarian pegawai hanya id/nama/NIP. **NIK ditampilkan tersamar** di back-office, reveal penuh hanya via aksi teraudit. |
| **Kontrol akses / RBAC** | ✅ | Role ADMIN/OPERATOR/VERIFIER/VIEWER/EMPLOYEE; guard server-side; EMPLOYEE hanya data sendiri (`/me`); middleware + cek kepemilikan. |
| **Keamanan** (Pasal 35) | ✅ | Password di-hash (bcrypt); kredensial vault dienkripsi (AES-256-GCM); **NIK disimpan plaintext di database** — diproteksi dengan masking tampilan + reveal teraudit + RBAC + keamanan DB/akses server, bukan enkripsi kolom; lampiran di balik otorisasi + streaming; rate-limit login; security headers (CSP/HSTS). Sisa: TLS + akses terbatas ke storage S3 + pengerasan akses DB. |
| **Audit / akuntabilitas** | ✅ | Audit log: LOGIN/LOGOUT, CREATE/UPDATE/DELETE, UPLOAD/**DOWNLOAD** (termasuk reveal NIK), VERIFY/REJECT, password lifecycle — mencatat aktor, role, sumber, waktu. |
| **Retensi** (Pasal 5, 43) | ✅ | `pnpm audit:prune` (audit) dan `pnpm employees:prune` — anonimisasi NIK/email/HP pegawai yang dihapus melewati masa simpan (default 365 hari). |
| **Hak subjek data** (akses/koreksi/hapus) | ✅ | Pegawai mengajukan akses/koreksi/penghapusan dari `/me`; back-office memproses di `/permintaan-data`. Lihat data sendiri di `/me`. |
| **Persetujuan / pemberitahuan** (Pasal 21, ITE Pasal 26) | ❌ Gap | Belum ada pencatatan dasar pemrosesan/persetujuan & pemberitahuan privasi. |
| **Notifikasi pelanggaran 3×24 jam** (Pasal 46) | ❌ Proses | Perlu prosedur (SOP) + kontak; bukan murni teknis. |
| Transfer/lokalisasi data (PP 71/2019) | ⚙️ | Bila storage S3 di luar yurisdiksi, perlu ditinjau; rustfs internal lebih aman. |

## Yang Sudah Diterapkan (ringkas)

- **Akses berbasis peran** + kepemilikan data (server-side, bukan sekadar UI).
- **Jejak audit** termasuk **akses unduh dokumen** (DOWNLOAD) dan login/logout.
- **Minimisasi pada typeahead** pegawai (tak membocorkan NIK).
- **Pengamanan kredensial**: hash password, link reset sekali pakai + expiry,
  rate-limit login, tidak ada self-registration/forgot-password publik.
- **Header keamanan** (CSP, HSTS, X-Frame-Options, dll).

## Sudah Ditutup (2026-05-30)

1. **Masking NIK + reveal teraudit** — `maskNik` + endpoint reveal yang dicatat.
2. **Retensi PII** — `anonymizeExpiredEmployees` + `pnpm employees:prune`.
3. **Hak subjek data** — pengajuan di `/me`, pemrosesan di `/permintaan-data`.

> **Catatan NIK:** NIK disimpan **plaintext** di database (keputusan operasional).
> Perlindungan via masking tampilan, reveal teraudit, RBAC, dan keamanan
> DB/akses server — **bukan** enkripsi kolom. Tidak ada `PII_ENCRYPTION_KEY`
> maupun migrasi enkripsi NIK di kode.

## Gap Tersisa (perlu keputusan/non-teknis)

1. **Pencatatan dasar pemrosesan & pemberitahuan privasi** saat akun dibuat.
2. **SOP notifikasi pelanggaran** (3×24 jam ke subjek & lembaga) — non-teknis.
3. **Pengerasan storage**: TLS ke endpoint S3, kredensial paling-kecil-hak,
   bucket privat, lifecycle/retensi objek.
4. **Pengerasan akses database** (NIK plaintext): akses DB paling-kecil-hak,
   enkripsi disk/at-rest di level DB/host, dan jaringan terbatas.

> Catatan: dokumen ini fokus pada kontrol yang dapat ditegakkan aplikasi.
> Kepatuhan penuh juga butuh kebijakan organisasi (penunjukan DPO bila wajib,
> DPIA untuk pemrosesan berisiko tinggi, perjanjian dengan prosesor).
