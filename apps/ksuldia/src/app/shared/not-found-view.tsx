import Link from "next/link";
import {
  PiArrowLeftBold,
  PiCompassDuotone,
  PiHouseDuotone,
} from "react-icons/pi";
import { routes } from "@/config/routes";

/**
 * Friendly, branded 404 content used by both the global and in-dashboard
 * not-found boundaries. `inline` renders a card that sits inside the dashboard
 * chrome; otherwise it fills the screen for routes outside the app shell.
 */
export default function NotFoundView({ inline = false }: { inline?: boolean }) {
  const card = (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-10">
      <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
        <PiCompassDuotone className="h-9 w-9" />
      </span>

      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
        Halaman 404
      </p>
      <h1 className="mt-2 text-2xl font-bold text-gray-950 sm:text-3xl">
        Halaman tidak ditemukan
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600">
        Halaman yang Anda tuju tidak tersedia, sudah dipindahkan, atau datanya
        sudah dinonaktifkan. Silakan kembali ke halaman utama atau telusuri menu
        lain.
      </p>

      <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href={routes.dashboard}
          className="inline-flex w-full items-center justify-center rounded-md bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 sm:w-auto"
        >
          <PiHouseDuotone className="me-2 h-4 w-4" />
          Ke Dashboard
        </Link>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className="flex w-full items-center justify-center py-12">
        {card}
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-16">
      {card}
    </main>
  );
}
