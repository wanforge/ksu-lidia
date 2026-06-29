export const routes = {
  dashboard: "/",
  users: {
    list: "/users",
  },
  roles: "/roles",
  audit: {
    list: "/audit",
    dataChangeLog: "/audit/data-change",
  },
  system: "/sistem",
  pengaturan: "/pengaturan",
  simpanPinjam: {
    anggota: "/simpan-pinjam/anggota",
    pinjaman: "/simpan-pinjam/pinjaman",
    master: "/simpan-pinjam/master",
    kas: "/simpan-pinjam/buku-kas",
    shu: "/simpan-pinjam/shu",
  },
  statistik: "/statistik",
  laporan: "/laporan",
  toko: {
    produk: "/toko/produk",
    transaksi: "/toko/transaksi",
    kas: "/toko/buku-kas",
  },
  me: {
    dashboard: "/me",
  },
  signIn: "/signin",
  profile: "/me",
  forms: {
    profileSettings: "/me",
  },
};
