"use client";

import Link from "next/link";
import AnimatedLogo from "@/app/shared/auth-layout/animated-logo";
import { Title, Text } from "rizzui";
import WanForgeIcon from "@/components/wanforge-icon";
import {
  PiArchiveDuotone,
  PiCertificateDuotone,
  PiCheckCircleDuotone,
  PiClipboardTextDuotone,
  PiShieldCheckDuotone,
  PiUsersThreeDuotone,
} from "react-icons/pi";
import { appConfig, brandLine } from "@/config/app";

interface AuthWrapperProps {
  children: React.ReactNode;
  title: React.ReactNode;
  description?: string;
}

const FEATURES = [
  { icon: PiArchiveDuotone, label: "Arsip Dokumen" },
  { icon: PiCertificateDuotone, label: "Kredensial & Lisensi" },
  { icon: PiClipboardTextDuotone, label: "SKP & Evaluasi" },
  { icon: PiShieldCheckDuotone, label: "Verifikasi Digital" },
  { icon: PiUsersThreeDuotone, label: "Manajemen Pegawai" },
  { icon: PiCheckCircleDuotone, label: "Audit Telusur" },
];

export default function AuthWrapper({
  children,
  title,
  description,
}: AuthWrapperProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex min-h-screen items-stretch">
        {/* ── Left: Form ──────────────────────────────────────────── */}
        <div className="flex w-full flex-col justify-between px-6 py-12 lg:w-5/12 lg:px-12 xl:px-16 2xl:px-24">
          <div className="flex flex-1 flex-col justify-center">
            {/* Logo */}
            <div className="mb-10">
              <div className="inline-flex flex-col items-start gap-3">
                <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-4 shadow-sm ring-1 ring-teal-600/5 dark:border-teal-900/40 dark:from-teal-950/40 dark:to-gray-900/60 dark:ring-teal-400/10">
                  <AnimatedLogo className="h-auto w-[220px] sm:w-[260px]" />
                </div>
                {appConfig.orgName && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-600/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                    {appConfig.orgName}
                  </span>
                )}
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <Title
                as="h1"
                className="mb-3 text-2xl font-bold leading-snug text-gray-900 md:text-3xl dark:text-white"
              >
                {title}
              </Title>
              {description && (
                <Text className="leading-relaxed text-gray-500 dark:text-gray-400">
                  {description}
                </Text>
              )}
            </div>

            {/* Form slot */}
            {children}
          </div>

          {/* Footer */}
          <div className="mt-10 flex flex-col items-center gap-1.5 text-center text-xs text-gray-400 dark:text-gray-500">
            <p>
              © {new Date().getFullYear()}{" "}
              <span className="font-medium text-gray-500 dark:text-gray-400">
                {appConfig.orgName || appConfig.name}
              </span>
              . Hak cipta dilindungi undang-undang.
            </p>
            <p className="space-x-2">
              <Link
                href="/privacy"
                className="transition-colors hover:text-gray-600 dark:hover:text-gray-300"
              >
                Kebijakan Privasi
              </Link>
              <span aria-hidden className="opacity-50">
                ·
              </span>
              <Link
                href="/terms"
                className="transition-colors hover:text-gray-600 dark:hover:text-gray-300"
              >
                Ketentuan Layanan
              </Link>
            </p>
            <a
              href="https://wanforge.asia"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-medium text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <WanForgeIcon className="h-3.5 w-auto" />
              WanForge
              <span className="font-normal opacity-60">· Forge Clarity</span>
            </a>
          </div>
        </div>

        {/* ── Right: Banner ───────────────────────────────────────── */}
        <div className="relative hidden w-7/12 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 lg:flex">
          {/* Decorative blobs */}
          <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-white/5" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white/5" />
          <div className="absolute right-32 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full bg-white/5" />
          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <div className="relative z-10 w-full max-w-md px-10 text-center text-white">
            {/* App name */}
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-teal-100 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-300" />
              {appConfig.name}
            </div>

            <Title
              as="h2"
              className="mb-3 mt-5 text-3xl font-bold leading-snug text-white xl:text-4xl"
            >
              {appConfig.orgName ? (
                <>{appConfig.orgName.split(" ").slice(0, 3).join(" ")}</>
              ) : (
                appConfig.tagline
                  .split("–")[0]
                  ?.trim()
                  .replace("Sistem Informasi", "Sistem\nInformasi") ||
                appConfig.name
              )}
            </Title>

            <Text className="mb-8 text-sm leading-relaxed text-teal-100/80">
              {appConfig.tagline} — kelola arsip kepegawaian, kredensial, dan
              dokumen tenaga kerja dalam satu platform terintegrasi.
            </Text>

            {/* Feature grid */}
            <div className="grid grid-cols-3 gap-3">
              {FEATURES.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-4 backdrop-blur-sm transition-colors hover:bg-white/15"
                >
                  <Icon className="h-6 w-6 text-teal-200" />
                  <span className="text-center text-xs font-medium leading-tight text-white/90">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Org tagline at bottom */}
            {appConfig.orgName && (
              <p className="mt-8 text-xs font-medium uppercase tracking-wide text-teal-200/60">
                {appConfig.orgName}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
