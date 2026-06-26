import type { Metadata } from "next";
import LegalShell from "@/components/legal/legal-shell";
import { appConfig, supportEmail, pageTitle } from "@/config/app";

export const metadata: Metadata = {
  title: pageTitle("Ketentuan Layanan"),
  description: "Ketentuan Layanan aplikasi KSU Lidia.",
};

export default function TermsPage() {
  const org = appConfig.orgName || appConfig.name;

  return (
    <LegalShell
      title="Ketentuan Layanan"
      subtitle={`Ketentuan penggunaan aplikasi internal ${appConfig.name}.`}
      updatedAt="10 Juni 2026"
    >
      <p>
        Dengan mengakses dan menggunakan aplikasi{" "}
        <strong>{appConfig.name}</strong> ({appConfig.tagline}), Anda menyetujui
        ketentuan berikut. Aplikasi ini adalah perangkat lunak internal yang
        dilisensikan kepada {org} untuk penggunaan internal.
      </p>

      <h2>1. Penggunaan yang Sah</h2>
      <p>
        Akses hanya untuk pengguna yang berwenang. Akun dibuat oleh
        Administrator; tidak ada pendaftaran mandiri. Setiap pengguna
        bertanggung jawab menjaga kerahasiaan kredensialnya dan atas seluruh
        aktivitas yang dilakukan dengan akunnya.
      </p>

      <h2>2. Kewajiban Pengguna</h2>
      <ul>
        <li>Menggunakan aplikasi hanya untuk tugas kedinasan yang sah.</li>
        <li>
          Tidak menyalahgunakan, mendistribusikan, atau membocorkan data pribadi
          pegawai yang diaksesnya.
        </li>
        <li>
          Tidak mencoba mengakses data/fungsi di luar kewenangan perannya, atau
          mengganggu keamanan dan ketersediaan sistem.
        </li>
      </ul>

      <h2>3. Data &amp; Privasi</h2>
      <p>
        Pemrosesan data pribadi diatur dalam{" "}
        <a href="/privacy">Kebijakan Privasi</a>. Pengelola data adalah {org}.
      </p>

      <h2>4. Hak Kekayaan Intelektual</h2>
      <p>
        Aplikasi <strong>{appConfig.name}</strong> beserta seluruh kode, desain,
        dan dokumentasinya adalah milik{" "}
        <strong>{appConfig.copyrightHolder}</strong> dan dilindungi sebagai
        perangkat lunak berpemilik (proprietary). Lisensi kepada institusi
        bersifat hak pakai internal — tidak ada pengalihan kepemilikan, dan
        dilarang menyalin, memodifikasi, mendistribusikan ulang, menjual, atau
        mensublisensikan tanpa izin tertulis dari Pemilik. Rincian kepemilikan
        dan batas pengembangan diatur pada dokumen <code>OWNERSHIP.md</code>.
      </p>

      <h2>5. Ketersediaan &amp; Penyangkalan</h2>
      <p>
        Aplikasi disediakan &quot;sebagaimana adanya&quot; (as is). Pengelola
        dan Pemilik berupaya menjaga ketersediaan dan keamanan, namun tidak
        menjamin operasi bebas gangguan. Pengelola data bertanggung jawab atas
        pencadangan dan kepatuhan operasional di lingkungannya.
      </p>

      <h2>6. Perubahan Ketentuan</h2>
      <p>
        Ketentuan ini dapat diperbarui sewaktu-waktu. Penggunaan berkelanjutan
        setelah perubahan berarti persetujuan atas ketentuan terbaru.
      </p>

      <h2>7. Hukum yang Berlaku</h2>
      <p>Ketentuan ini tunduk pada hukum Republik Indonesia.</p>

      <h2>8. Kontak</h2>
      <p>
        Pertanyaan dapat diajukan ke{" "}
        <a href={`mailto:${supportEmail}`}>{supportEmail}</a> atau{" "}
        <a
          href="https://wanforge.asia"
          target="_blank"
          rel="noopener noreferrer"
        >
          wanforge.asia
        </a>
        .
      </p>
    </LegalShell>
  );
}
