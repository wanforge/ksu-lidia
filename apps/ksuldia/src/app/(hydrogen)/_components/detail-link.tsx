import Link from "next/link";
import { PiArrowRightBold } from "react-icons/pi";

/**
 * Tautan aksi baris yang seragam: label "Detail" + panah yang bergeser ke kanan
 * saat di-hover. Dipakai di semua tabel/daftar agar konsisten.
 */
export default function DetailLink({
  href,
  label = "Detail",
  target,
  rel,
}: {
  href: string;
  label?: string;
  target?: string;
  rel?: string;
}) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className="group inline-flex items-center gap-1.5 text-sm font-semibold text-red-700 transition hover:text-red-900"
    >
      {label}
      <PiArrowRightBold className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
    </Link>
  );
}
