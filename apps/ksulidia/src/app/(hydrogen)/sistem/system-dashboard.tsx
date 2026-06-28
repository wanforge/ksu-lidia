"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PiArrowsClockwiseBold,
  PiBellDuotone,
  PiBellRingingDuotone,
  PiCheckCircleDuotone,
  PiCircleDashed,
  PiClockDuotone,
  PiCpuDuotone,
  PiDatabaseDuotone,
  PiGearDuotone,
  PiHardDrivesDuotone,
  PiInfoDuotone,
  PiPulseDuotone,
  PiSpeakerHighDuotone,
  PiWarningCircleDuotone,
  PiXCircleDuotone,
  PiTerminalWindowDuotone,
  PiListDashesDuotone,
} from "react-icons/pi";
import { appConfig } from "@/config/app";
import { Button } from "@/components/ui/button";
import {
  AUDIO_TONES,
  isAudioSupported,
  playNotificationSound,
  type NotificationTone,
} from "@/lib/audio";
import type { SystemSnapshot } from "@/lib/diagnostics/system-info";
import type { CheckStatus, ConfigCheck } from "@/lib/diagnostics/config-check";

import { Table } from "rizzui";
import {
  SkeletonCard,
  SkeletonProgressBar,
  SkeletonRow,
} from "@/components/skeletons/skeleton-card";

function fmt(n: number, unit: string) {
  return `${n.toLocaleString("id-ID")} ${unit}`;
}

function fmtBytes(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function fmtUptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}h ${h}j ${m}m`;
  if (h > 0) return `${h}j ${m}m ${s}d`;
  return `${m}m ${s}d`;
}

function fmtDrift(ms: number) {
  const sign = ms >= 0 ? "+" : "−";
  const abs = Math.abs(ms);
  if (abs < 1000) return `${sign}${abs} ms`;
  return `${sign}${(abs / 1000).toFixed(abs < 10000 ? 2 : 1)} dtk`;
}

function driftTone(absMs: number): CheckStatus {
  if (absMs <= 2000) return "ok";
  if (absMs <= 30000) return "warn";
  return "error";
}

function useLocalClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function formatClock(date: Date, tz: string) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: tz,
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function formatStamp(epochMs: number, tz: string) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: tz,
    dateStyle: "medium",
    timeStyle: "medium",
    hour12: false,
  }).format(new Date(epochMs));
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === "ok")
    return <PiCheckCircleDuotone className="h-4 w-4 shrink-0 text-red-600" />;
  if (status === "warn")
    return (
      <PiWarningCircleDuotone className="h-4 w-4 shrink-0 text-amber-600" />
    );
  if (status === "error")
    return <PiXCircleDuotone className="h-4 w-4 shrink-0 text-rose-600" />;
  return <PiCircleDashed className="h-4 w-4 shrink-0 text-gray-400" />;
}

function statusBadge(status: CheckStatus) {
  const map: Record<CheckStatus, string> = {
    ok: "border-green-200 bg-green-50 text-green-800",
    warn: "border-amber-200 bg-amber-50 text-amber-800",
    error: "border-rose-200 bg-rose-50 text-rose-800",
    info: "border-gray-200 bg-gray-50 text-gray-600",
  };
  const label: Record<CheckStatus, string> = {
    ok: "OK",
    warn: "WARN",
    error: "ERROR",
    info: "INFO",
  };
  return (
    <span
      className={`inline-flex rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${map[status]}`}
    >
      {label[status]}
    </span>
  );
}

function ProgressBar({
  percent,
  tone,
}: {
  percent: number;
  tone: "primary" | "amber" | "rose";
}) {
  const bar = {
    primary: "bg-primary-default",
    amber: "bg-amber-400",
    rose: "bg-rose-500",
  }[tone];
  return (
    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className={`h-full rounded-full transition-all duration-700 ${bar}`}
        style={{ width: `${Math.min(100, percent)}%` }}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 py-2 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-right text-xs font-semibold text-gray-900">
        {value}
      </span>
    </div>
  );
}

function DriftPill({ ms }: { ms: number }) {
  const tone = driftTone(Math.abs(ms));
  const cls = {
    ok: "border-green-200 bg-green-50 text-green-800",
    warn: "border-amber-200 bg-amber-50 text-amber-800",
    error: "border-rose-200 bg-rose-50 text-rose-800",
    info: "border-gray-200 bg-gray-50 text-gray-600",
  }[tone];
  return (
    <span
      className={`inline-flex rounded border px-2 py-0.5 text-xs font-semibold ${cls}`}
    >
      {fmtDrift(ms)}
    </span>
  );
}

function Card({
  icon,
  title,
  children,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-md border border-gray-200 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
        <span className="border-primary-lighter bg-primary-lighter/30 text-primary-dark inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border">
          {icon}
        </span>
        <span className="flex-1 text-sm font-semibold text-gray-950">
          {title}
        </span>
        {badge}
      </div>
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}

// ── Audio test panel ──────────────────────────────────────────────────────────

function AudioTestPanel() {
  const [playing, setPlaying] = useState<NotificationTone | null>(null);
  const [supported] = useState(() =>
    typeof window !== "undefined" ? isAudioSupported() : true
  );

  async function handlePlay(tone: NotificationTone) {
    if (playing) return;
    setPlaying(tone);
    await playNotificationSound(tone);
    // Beri waktu nada selesai sebelum reset state
    setTimeout(() => setPlaying(null), 600);
  }

  const tones = Object.entries(AUDIO_TONES) as [
    NotificationTone,
    (typeof AUDIO_TONES)[NotificationTone],
  ][];

  type ToneStyle = {
    color: string;
    icon: React.ReactNode;
  };

  const toneStyle: Record<NotificationTone, ToneStyle> = {
    success: {
      color:
        "border-red-200 bg-red-50 text-red-800 hover:bg-red-100 disabled:opacity-50",
      icon: <PiCheckCircleDuotone className="h-4 w-4 shrink-0" />,
    },
    error: {
      color:
        "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 disabled:opacity-50",
      icon: <PiXCircleDuotone className="h-4 w-4 shrink-0" />,
    },
    warning: {
      color:
        "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 disabled:opacity-50",
      icon: <PiWarningCircleDuotone className="h-4 w-4 shrink-0" />,
    },
    info: {
      color:
        "border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100 disabled:opacity-50",
      icon: <PiInfoDuotone className="h-4 w-4 shrink-0" />,
    },
    ding: {
      color:
        "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50",
      icon: <PiBellDuotone className="h-4 w-4 shrink-0" />,
    },
    notification: {
      color:
        "border-primary-lighter bg-primary-lighter/30 text-primary-dark hover:bg-primary-lighter/50 disabled:opacity-50",
      icon: <PiBellRingingDuotone className="h-4 w-4 shrink-0" />,
    },
  };

  return (
    <Card
      icon={<PiSpeakerHighDuotone className="h-5 w-5" />}
      title="Uji Audio Notifikasi"
      badge={
        supported ? (
          <span className="inline-flex rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-700">
            Didukung
          </span>
        ) : (
          <span className="inline-flex rounded border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-rose-700">
            Tidak Didukung
          </span>
        )
      }
    >
      {!supported ? (
        <p className="text-xs text-gray-500">
          Browser ini tidak mendukung Web Audio API. Audio notifikasi tidak akan
          berbunyi.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Klik tombol untuk menguji setiap nada notifikasi. Nada disintesis
            langsung di browser — tidak memerlukan file audio eksternal.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {tones.map(([tone, meta]) => {
              const { color, icon } = toneStyle[tone];
              return (
                <button
                  key={tone}
                  type="button"
                  disabled={!supported || playing !== null}
                  onClick={() => handlePlay(tone)}
                  className={`flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-left text-xs font-medium transition ${color}`}
                >
                  {icon}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{meta.label}</p>
                    <p className="mt-0.5 truncate opacity-70">
                      {meta.description}
                    </p>
                  </div>
                  {playing === tone && (
                    <PiSpeakerHighDuotone className="ms-auto h-3.5 w-3.5 shrink-0 animate-pulse opacity-70" />
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400">
            Browser memerlukan interaksi pengguna (klik/ketuk) sebelum audio
            dapat diputar — ini adalah kebijakan autoplay bawaan browser.
          </p>
        </div>
      )}
    </Card>
  );
}

// ── Config check grouped view ─────────────────────────────────────────────────

function ConfigPanel({ checks }: { checks: ConfigCheck[] }) {
  const groups = checks.reduce<Record<string, ConfigCheck[]>>((acc, c) => {
    (acc[c.group] ??= []).push(c);
    return acc;
  }, {});

  const errorCount = checks.filter((c) => c.status === "error").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;
  const summary =
    errorCount > 0
      ? `${errorCount} error${warnCount > 0 ? `, ${warnCount} peringatan` : ""}`
      : warnCount > 0
        ? `${warnCount} peringatan`
        : "Semua konfigurasi inti siap";

  return (
    <Card
      icon={<PiGearDuotone className="h-5 w-5" />}
      title="Konfigurasi"
      badge={<span className="text-xs text-gray-500">{summary}</span>}
    >
      <div className="space-y-4">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group}>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {group}
            </p>
            <div className="space-y-2">
              {items.map((check) => (
                <div key={check.key} className="flex items-start gap-2">
                  <StatusIcon status={check.status} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold text-gray-800">
                        {check.label}
                      </p>
                      {statusBadge(check.status)}
                    </div>
                    <p className="mt-0.5 break-all text-[11px] text-gray-500">
                      {check.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Time comparison (perangkat / app / DB / NTP) ───────────────────────────────

type TimeSource = {
  key: string;
  label: string;
  epoch: number | null;
  note?: string;
};

function TimeComparison({
  snapshot,
  deviceEpoch,
}: {
  snapshot: SystemSnapshot;
  deviceEpoch: number | null;
}) {
  // Acuan: NTP (jam eksternal) bila tersedia, jika tidak pakai server aplikasi.
  const ntpOk = snapshot.ntp.ok;
  const refEpoch = ntpOk ? snapshot.ntp.serverEpochMs : snapshot.snapshotAt;
  const refKey = ntpOk ? "ntp" : "app";

  const sources: TimeSource[] = [
    {
      key: "device",
      label: "Perangkat (browser)",
      epoch: deviceEpoch,
      note: "saat sinkronisasi terakhir · termasuk latensi jaringan",
    },
    {
      key: "app",
      label: "Server Aplikasi (Node.js)",
      epoch: snapshot.snapshotAt,
    },
    {
      key: "db",
      label: "Database (MySQL)",
      epoch: snapshot.db.ok ? snapshot.db.serverEpochMs : null,
      note: snapshot.db.ok ? undefined : "tidak tersedia",
    },
    {
      key: "ntp",
      label: "NTP",
      epoch: ntpOk ? snapshot.ntp.serverEpochMs : null,
      note: ntpOk ? snapshot.ntp.host : "tidak tersedia",
    },
  ];

  return (
    <Card
      icon={<PiClockDuotone className="h-5 w-5" />}
      title="Perbandingan Waktu Sistem"
      badge={
        <span className="text-xs text-gray-500">
          Acuan: {ntpOk ? "NTP" : "Server Aplikasi"}
        </span>
      }
    >
      <div className="overflow-x-auto">
        <Table variant="modern" className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 pe-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Sumber
              </th>
              <th className="py-2 pe-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Waktu
              </th>
              <th className="py-2 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Selisih
              </th>
            </tr>
          </thead>
          <tbody>
            {sources.map((src) => (
              <tr
                key={src.key}
                className="border-b border-gray-100 align-top last:border-0"
              >
                <td className="py-2 pe-3">
                  <p className="text-xs font-semibold text-gray-800">
                    {src.label}
                  </p>
                  {src.note ? (
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {src.note}
                    </p>
                  ) : null}
                </td>
                <td className="py-2 pe-3 font-mono text-xs tabular-nums text-gray-900">
                  {src.epoch != null
                    ? formatStamp(src.epoch, appConfig.timezone)
                    : "—"}
                </td>
                <td className="py-2 text-right">
                  {src.epoch == null ? (
                    <span className="text-xs text-gray-300">—</span>
                  ) : src.key === refKey ? (
                    <span className="inline-flex rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-500">
                      Acuan
                    </span>
                  ) : (
                    <DriftPill ms={src.epoch - refEpoch} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Card>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────

type Props = {
  checks: ConfigCheck[];
};

const REFRESH_INTERVAL_MS = 30_000;

export default function SystemDashboard({ checks }: Props) {
  const now = useLocalClock();
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSnapshot = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ksulidia/system", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SystemSnapshot = await res.json();
      setSnapshot(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data sistem.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSnapshot();
    timerRef.current = setInterval(fetchSnapshot, REFRESH_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchSnapshot]);

  const memTone =
    (snapshot?.memory.usedPercent ?? 0) > 90
      ? "rose"
      : (snapshot?.memory.usedPercent ?? 0) > 70
        ? "amber"
        : "primary";

  return (
    <div className="space-y-6">
      {/* Live clock bar */}
      <div className="border-primary-lighter bg-primary-lighter/30 flex flex-wrap items-center justify-between gap-3 rounded-md border px-4 py-3">
        <div className="flex items-center gap-3">
          <PiClockDuotone className="text-primary-dark h-5 w-5" />
          <div>
            <p className="text-primary-dark/80 text-xs font-semibold uppercase tracking-wider">
              {appConfig.timezone}
            </p>
            <p className="text-primary-dark font-mono text-base font-bold tabular-nums">
              {now ? formatClock(now, appConfig.timezone) : "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated ? (
            <span className="text-primary-dark/80 text-xs">
              Data diperbarui{" "}
              {new Intl.DateTimeFormat("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                timeZone: appConfig.timezone,
              }).format(lastUpdated)}
            </span>
          ) : null}
          <Button
            onClick={fetchSnapshot}
            disabled={loading}
            variant="primary-soft"
            className="border-primary-lighter text-primary-dark hover:bg-primary-lighter/30 bg-white"
          >
            <PiArrowsClockwiseBold
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {error}
        </div>
      ) : null}

      {/* Perbandingan waktu: perangkat / app / DB / NTP */}
      {snapshot ? (
        <TimeComparison
          snapshot={snapshot}
          deviceEpoch={lastUpdated?.getTime() ?? null}
        />
      ) : loading ? (
        <SkeletonCard
          icon={<PiClockDuotone className="h-5 w-5" />}
          title="Perbandingan Waktu Sistem"
        >
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </SkeletonCard>
      ) : null}

      {/* Top row: Runtime + CPU + Memory */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Runtime */}
        {snapshot ? (
          <Card icon={<PiGearDuotone className="h-5 w-5" />} title="Runtime">
            <>
              <Row
                label="Aplikasi"
                value={`${snapshot.runtime.appName} v${snapshot.runtime.appVersion}`}
              />
              <Row label="Node.js" value={snapshot.runtime.nodeVersion} />
              <Row label="Prisma" value={`v${snapshot.runtime.prismaVersion}`} />
              <Row label="NODE_ENV" value={snapshot.runtime.nodeEnv} />
              <Row
                label="Platform"
                value={`${snapshot.runtime.platform} · ${snapshot.runtime.arch}`}
              />
              <Row label="Kernel" value={snapshot.runtime.kernelRelease} />
              <Row label="Hostname" value={snapshot.runtime.hostname} />
              <Row
                label="Uptime OS"
                value={fmtUptime(snapshot.runtime.uptimeSeconds)}
              />
            </>
          </Card>
        ) : (
          <SkeletonCard
            icon={<PiGearDuotone className="h-5 w-5" />}
            title="Runtime"
          >
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </SkeletonCard>
        )}

        {/* CPU */}
        {snapshot ? (
          <Card icon={<PiCpuDuotone className="h-5 w-5" />} title="CPU">
            <>
              <Row label="Model" value={snapshot.cpu.model} />
              <Row
                label="Core / Thread"
                value={fmt(snapshot.cpu.cores, "core")}
              />
              <Row
                label="Load avg (1m)"
                value={
                  <span
                    className={
                      snapshot.cpu.loadAvg1 > snapshot.cpu.cores * 0.9
                        ? "text-rose-600"
                        : snapshot.cpu.loadAvg1 > snapshot.cpu.cores * 0.7
                          ? "text-amber-600"
                          : undefined
                    }
                  >
                    {snapshot.cpu.loadAvg1}
                  </span>
                }
              />
              <Row label="Load avg (5m)" value={snapshot.cpu.loadAvg5} />
              <Row label="Load avg (15m)" value={snapshot.cpu.loadAvg15} />
            </>
          </Card>
        ) : (
          <SkeletonCard icon={<PiCpuDuotone className="h-5 w-5" />} title="CPU">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </SkeletonCard>
        )}

        {/* Memory */}
        {snapshot ? (
          <Card
            icon={<PiCpuDuotone className="h-5 w-5" />}
            title="Memori"
            badge={
              snapshot ? (
                <span
                  className={`text-xs font-bold ${
                    memTone === "rose"
                      ? "text-rose-600"
                      : memTone === "amber"
                        ? "text-amber-600"
                        : "text-primary-dark"
                  }`}
                >
                  {snapshot.memory.usedPercent}%
                </span>
              ) : null
            }
          >
            <>
              <Row label="Total" value={fmtBytes(snapshot.memory.totalBytes)} />
              <Row
                label="Terpakai"
                value={fmtBytes(snapshot.memory.usedBytes)}
              />
              <Row label="Bebas" value={fmtBytes(snapshot.memory.freeBytes)} />
              <ProgressBar
                percent={snapshot.memory.usedPercent}
                tone={memTone}
              />
            </>
          </Card>
        ) : (
          <SkeletonCard
            icon={<PiCpuDuotone className="h-5 w-5" />}
            title="Memori"
            badge={<span className="h-4 w-1/4 rounded bg-gray-200" />}
          >
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonProgressBar />
          </SkeletonCard>
        )}
      </div>

      {/* Disk */}
      {snapshot ? (
        <Card
          icon={<PiHardDrivesDuotone className="h-5 w-5" />}
          title="Penyimpanan / Block Device"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {snapshot.disks.map((disk) => {
              const tone =
                disk.usedPercent > 90
                  ? "rose"
                  : disk.usedPercent > 75
                    ? "amber"
                    : "primary";
              return (
                <div key={disk.path}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-800">
                      {disk.path}
                    </p>
                    <span
                      className={`text-xs font-bold ${
                        tone === "rose"
                          ? "text-rose-600"
                          : tone === "amber"
                            ? "text-amber-600"
                            : "text-primary-dark"
                      }`}
                    >
                      {disk.usedPercent}%
                    </span>
                  </div>
                  <ProgressBar percent={disk.usedPercent} tone={tone} />
                  <div className="mt-2 grid grid-cols-3 gap-1 text-center">
                    {[
                      { label: "Total", val: fmtBytes(disk.totalBytes) },
                      { label: "Terpakai", val: fmtBytes(disk.usedBytes) },
                      { label: "Bebas", val: fmtBytes(disk.freeBytes) },
                    ].map(({ label, val }) => (
                      <div
                        key={label}
                        className="rounded bg-gray-50 px-2 py-1.5"
                      >
                        <p className="text-[10px] text-gray-400">{label}</p>
                        <p className="text-xs font-semibold text-gray-900">
                          {val}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <SkeletonCard
          icon={<PiHardDrivesDuotone className="h-5 w-5" />}
          title="Penyimpanan / Block Device"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="h-3 w-2/5 rounded bg-gray-200" />
                  <span className="h-3 w-1/6 rounded bg-gray-200" />
                </div>
                <SkeletonProgressBar />
                <div className="mt-2 grid grid-cols-3 gap-1 text-center">
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="rounded bg-gray-100 px-2 py-1.5">
                      <span className="mx-auto block h-2.5 w-3/4 rounded bg-gray-200" />
                      <span className="mx-auto mt-1 block h-3 w-2/3 rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SkeletonCard>
      )}

      {/* DB Time + NTP */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {snapshot ? (
          <Card
            icon={<PiDatabaseDuotone className="h-5 w-5" />}
            title="Waktu Server Database"
          >
            {snapshot.db.ok ? (
              <>
                <Row label="Zona waktu global" value={snapshot.db.globalTz} />
                <Row label="Zona waktu sesi" value={snapshot.db.sessionTz} />
                <Row
                  label="Zona waktu sistem OS DB"
                  value={snapshot.db.systemTz}
                />
                <Row
                  label="Waktu DB"
                  value={new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "medium",
                    timeZone: appConfig.timezone,
                  }).format(new Date(snapshot.db.serverEpochMs))}
                />
                <Row
                  label="Selisih (app − DB)"
                  value={<DriftPill ms={snapshot.db.driftMs} />}
                />
                <Row label="Latency Query" value={`${snapshot.db.latencyMs} ms`} />
                <Row label="Koneksi Aktif" value={fmt(snapshot.db.connections, "")} />
                <Row label="Ukuran Data" value={fmtBytes(snapshot.db.sizeBytes)} />
              </>
            ) : (
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
                {snapshot.db.error}
              </p>
            )}
          </Card>
        ) : (
          <SkeletonCard
            icon={<PiDatabaseDuotone className="h-5 w-5" />}
            title="Waktu Server Database"
          >
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </SkeletonCard>
        )}

        {snapshot ? (
          <Card
            icon={<PiPulseDuotone className="h-5 w-5" />}
            title="Sinkronisasi NTP"
          >
            {snapshot.ntp.ok ? (
              <>
                <Row label="Server NTP" value={snapshot.ntp.host} />
                <Row
                  label="Waktu NTP"
                  value={new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "medium",
                    timeZone: appConfig.timezone,
                  }).format(new Date(snapshot.ntp.serverEpochMs))}
                />
                <Row
                  label="Round-trip"
                  value={`${snapshot.ntp.roundTripMs} ms`}
                />
                <Row
                  label="Selisih jam server"
                  value={<DriftPill ms={snapshot.ntp.offsetMs} />}
                />
              </>
            ) : (
              <>
                <Row label="Server NTP" value={snapshot.ntp.host} />
                <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
                  {snapshot.ntp.error}
                </p>
              </>
            )}
          </Card>
        ) : (
          <SkeletonCard
            icon={<PiPulseDuotone className="h-5 w-5" />}
            title="Sinkronisasi NTP"
          >
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </SkeletonCard>
        )}
      </div>

      {/* Audio */}
      {loading ? (
        <SkeletonCard
          icon={<PiSpeakerHighDuotone className="h-5 w-5" />}
          title="Uji Audio Notifikasi"
          badge={<span className="h-4 w-1/4 rounded bg-gray-200" />}
        >
          <div className="space-y-3">
            <span className="block h-3 w-full rounded bg-gray-200" />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5"
                >
                  <span className="h-4 w-4 shrink-0 rounded-full bg-gray-200" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="block h-3 w-3/4 rounded bg-gray-200" />
                    <span className="block h-3 w-1/2 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
            <span className="block h-2.5 w-full rounded bg-gray-200" />
          </div>
        </SkeletonCard>
      ) : (
        <AudioTestPanel />
      )}

      {/* Config */}
      {loading ? (
        <SkeletonCard
          icon={<PiGearDuotone className="h-5 w-5" />}
          title="Konfigurasi"
          badge={<span className="h-4 w-1/4 rounded bg-gray-200" />}
        >
          <div className="space-y-4">
            {[0, 1].map((i) => (
              <div key={i}>
                <span className="mb-2 block h-3 w-1/3 rounded bg-gray-200" />
                <div className="space-y-2">
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="flex items-start gap-2">
                      <span className="h-4 w-4 shrink-0 rounded-full bg-gray-200" />
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="block h-3 w-full rounded bg-gray-200" />
                        <span className="block h-2.5 w-full rounded bg-gray-200" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SkeletonCard>
      ) : (
        <ConfigPanel checks={checks} />
      )}

      {/* Env Vars and Logs */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {snapshot ? (
          <Card
            icon={<PiListDashesDuotone className="h-5 w-5" />}
            title="Environment Variables"
          >
            <div className="max-h-[300px] overflow-y-auto pr-2">
              <Table variant="modern" className="min-w-full text-sm">
                <tbody>
                  {Object.entries(snapshot.runtime.envVars).map(
                    ([key, value]) => (
                      <tr key={key} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 pe-3 font-mono text-xs font-semibold text-gray-800">
                          {key}
                        </td>
                        <td className="py-2 font-mono text-xs text-gray-600 break-all">
                          {value}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </Table>
            </div>
          </Card>
        ) : (
          <SkeletonCard
            icon={<PiListDashesDuotone className="h-5 w-5" />}
            title="Environment Variables"
          >
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </SkeletonCard>
        )}

        <Card
          icon={<PiTerminalWindowDuotone className="h-5 w-5" />}
          title="File Log Sistem"
        >
          <div className="flex h-[300px] flex-col items-center justify-center rounded-md border border-gray-200 bg-gray-50 p-6 text-center">
            <PiTerminalWindowDuotone className="mb-2 h-8 w-8 text-gray-400" />
            <p className="text-sm font-semibold text-gray-800">
              Akses Log Tidak Dikonfigurasi
            </p>
            <p className="mt-1 max-w-sm text-xs text-gray-500">
              Saat ini aplikasi berjalan tanpa adapter file log lokal. Jika Anda
              menggunakan PM2, Anda dapat melihat log melalui terminal server
              dengan menjalankan perintah <code>pm2 logs</code>.
            </p>
          </div>
        </Card>
      </div>

      <p className="flex items-center gap-2 text-xs text-gray-400">
        <PiCheckCircleDuotone className="h-3.5 w-3.5" />
        Data sistem diperbarui otomatis setiap 30 detik. Jam live per-detik dari
        browser. Selisih jam sehat ≤ 2 detik (hijau).
      </p>
    </div>
  );
}
