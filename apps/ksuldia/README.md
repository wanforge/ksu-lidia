# KSU Lidia

KSU Lidia adalah aplikasi sistem informasi KSU Lidia. Aplikasi ini dibangun dari Isomorphic starter template, lalu diarahkan menjadi sistem operasional untuk pegawai, dokumen wajib, upload lampiran, riwayat dokumen, verifikasi, dan dashboard kelengkapan.

Dokumen domain utama ada di [`MAIN DATA.md`](./MAIN%20DATA.md), sedangkan roadmap implementasi, skill kerja, dan prompt lanjutan ada di [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md).

## Development

Jalankan perintah dari root monorepo.

Install dependencies:

```bash
pnpm install
```

Start development server:

```bash
pnpm --filter ksuldia dev
```

Useful commands:

```bash
pnpm --filter ksuldia type:check
pnpm --filter ksuldia build
pnpm --filter ksuldia db:generate
pnpm --filter ksuldia db:migrate
pnpm --filter ksuldia db:seed
```
