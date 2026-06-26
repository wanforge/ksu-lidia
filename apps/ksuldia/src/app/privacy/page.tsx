import type { Metadata } from "next";
import LegalShell from "@/components/legal/legal-shell";
import { appConfig, supportEmail, pageTitle } from "@/config/app";

export const metadata: Metadata = {
  title: pageTitle("Kebijakan Privasi"),
  description: "Kebijakan Privasi aplikasi KSU Lidia.",
};

export default function PrivacyPage() {
  const org = appConfig.orgName || appConfig.name;

  return (
    <LegalShell
      title="Kebijakan Privasi"
      subtitle={`Bagaimana ${appConfig.name} memproses dan melindungi data pribadi Anda.`}
      updatedAt="26 Juni 2026"
    >
      <p>
        Aplikasi <strong>{appConfig.name}</strong> ({appConfig.tagline}) adalah
        sistem internal untuk mengelola data anggota, simpan pinjam, dan
        transaksi koperasi. Kebijakan ini menjelaskan bagaimana data pribadi
        diproses di dalam aplikasi. Pengelola data (data controller) adalah{" "}
        <strong>{org}</strong>; aplikasi disediakan oleh{" "}
        {appConfig.copyrightHolder}.
      </p>

      <h2>1. Data yang Diproses</h2>
      <ul>
        <li>
          <strong>Data identitas anggota:</strong> nama, nomor anggota, NIK,
          alamat, nomor telepon, status keanggotaan.
        </li>
        <li>
          <strong>Data transaksi simpan pinjam:</strong> mutasi simpanan (pokok,
          wajib, sukarela) dan data kredit pinjaman beserta angsuran berjalan.
        </li>
        <li>
          <strong>Data akun pengguna:</strong> nama, email, kata sandi
          (tersimpan dalam bentuk hash), peran (role), dan log aktivitas.
        </li>
        <li>
          <strong>Kredensial akun aplikasi (vault):</strong> bila dipakai,
          disimpan terenkripsi.
        </li>
      </ul>

      <h2>2. Tujuan Pemrosesan</h2>
      <p>
        Data diproses semata untuk administrasi koperasi internal: pengelolaan
        simpan pinjam, pembukuan kas, pelaporan statistik keuangan, pencatatan
        transaksi toko, dan kontrol akses keamanan. Aplikasi{" "}
        <strong>tidak</strong> menjual atau membagikan data ke pihak ketiga
        untuk tujuan komersial.
      </p>

      <h2>3. Penyimpanan &amp; Keamanan</h2>
      <ul>
        <li>
          Kata sandi di-hash dengan bcrypt; kredensial vault dienkripsi
          (AES-256-GCM).
        </li>
        <li>
          Seluruh berkas foto profil dan lampiran disimpan pada penyimpanan
          terkontrol (disk lokal server atau object storage S3) dan hanya dapat
          diunduh melalui rute terotorisasi.
        </li>
        <li>
          Nilai sensitif (mis. NIK) ditampilkan ter-mask bagi pengguna tanpa hak
          akses penuh.
        </li>
        <li>
          Seluruh aktivitas penting dicatat pada audit log untuk akuntabilitas.
        </li>
      </ul>

      <h2>4. Akses &amp; Kontrol Peran</h2>
      <p>
        Akses dibatasi berbasis peran (RBAC): Administrator dan Viewer. Setiap
        pengguna hanya dapat mengakses data sesuai kewenangannya.
      </p>

      <h2>5. Retensi Data</h2>
      <p>
        Data disimpan selama diperlukan untuk kepentingan administrasi koperasi
        dan/atau selama diwajibkan peraturan. Data yang dihapus masuk ke
        mekanisme <em>soft-delete</em>/sampah sebelum dimusnahkan permanen
        sesuai kebijakan pengelola data.
      </p>

      <h2>6. Hak Subjek Data</h2>
      <p>
        Pengguna/Anggota sebagai subjek data dapat mengajukan akses, koreksi,
        atau keberatan atas pemrosesan datanya melalui prosedur internal {org}.
        Permintaan data dapat diajukan melalui pengelola.
      </p>

      <h2>7. Kontak</h2>
      <p>
        Pertanyaan terkait privasi dapat diajukan ke pengelola data ({org}) atau
        melalui <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
      </p>

      <p>
        Lihat juga <a href="/terms">Ketentuan Layanan</a>.
      </p>
    </LegalShell>
  );
}
