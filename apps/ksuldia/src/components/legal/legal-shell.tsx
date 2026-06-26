import Link from "next/link";
import { PiArrowLeftBold, PiShieldCheckDuotone } from "react-icons/pi";
import { appConfig, copyrightLine } from "@/config/app";

/**
 * Kerangka halaman legal publik (Kebijakan Privasi & Ketentuan Layanan).
 * Tipografi konten di-styling lewat selector turunan ([&_h2], [&_p], …) karena
 * plugin @tailwindcss/typography tidak terpasang.
 */
export default function LegalShell({
  title,
  subtitle,
  updatedAt,
  children,
}: {
  title: string;
  subtitle?: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  const year = new Date().getFullYear();
  const orgDisplay = appConfig.orgName || appConfig.name;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {appConfig.name}
            {appConfig.orgShortName ? (
              <span className="font-normal text-gray-400">
                {" · "}
                {appConfig.orgShortName}
              </span>
            ) : null}
          </span>
          <Link
            href="/signin"
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 transition hover:border-teal-300 hover:text-teal-700 dark:border-gray-700 dark:text-gray-300"
          >
            <PiArrowLeftBold className="h-3.5 w-3.5" />
            Masuk
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900">
        <div className="mx-auto max-w-3xl px-5 py-10 text-white">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
            <PiShieldCheckDuotone className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-teal-50/90">
              {subtitle}
            </p>
          ) : null}
          <span className="mt-4 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20">
            Diperbarui {updatedAt}
          </span>
        </div>
      </div>

      {/* Content card */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8">
        <article
          className={[
            "rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-9 dark:border-gray-800 dark:bg-gray-900",
            "text-[15px] leading-7 text-gray-700 dark:text-gray-300",
            // Headings
            "[&_h2]:mt-8 [&_h2]:scroll-mt-20 [&_h2]:border-l-4 [&_h2]:border-teal-500 [&_h2]:pl-3 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-gray-900 first:[&_h2]:mt-0 dark:[&_h2]:text-white",
            // Paragraphs
            "[&_p]:mt-3",
            // Lists
            "[&_ul]:mt-3 [&_ul]:space-y-2 [&_ul]:pl-1",
            "[&_li]:relative [&_li]:list-none [&_li]:pl-6",
            "[&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2.5 [&_li]:before:h-1.5 [&_li]:before:w-1.5 [&_li]:before:rounded-full [&_li]:before:bg-teal-500",
            // Links & emphasis
            "[&_a]:font-medium [&_a]:text-teal-700 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-teal-900 dark:[&_a]:text-teal-400",
            "[&_strong]:font-semibold [&_strong]:text-gray-900 dark:[&_strong]:text-white",
            "[&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_code]:text-gray-700 dark:[&_code]:bg-gray-800",
          ].join(" ")}
        >
          {children}
        </article>

        {/* Cross-links */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
          <Link
            href="/privacy"
            className="rounded-md px-3 py-1.5 font-medium text-gray-600 transition hover:bg-white hover:text-teal-700 dark:text-gray-400"
          >
            Kebijakan Privasi
          </Link>
          <span aria-hidden className="text-gray-300">
            ·
          </span>
          <Link
            href="/terms"
            className="rounded-md px-3 py-1.5 font-medium text-gray-600 transition hover:bg-white hover:text-teal-700 dark:text-gray-400"
          >
            Ketentuan Layanan
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-5 py-6 text-center text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900">
        <p>{copyrightLine(year)}. Hak cipta dilindungi undang-undang.</p>
        <p className="mt-1 text-gray-400">
          Pemilik &amp; pengembang: {appConfig.copyrightHolder}. Pengelola data:{" "}
          {orgDisplay}.{" "}
          <a
            href="https://wanforge.asia"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gray-500 hover:text-teal-700"
          >
            wanforge.asia
          </a>
        </p>
      </footer>
    </div>
  );
}
