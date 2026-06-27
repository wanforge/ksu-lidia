import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import pkg from "../../../package.json";
import { appConfig } from "@/config/app";
import { env } from "@/config/env";
import { queryNtp } from "./ntp";
import { prisma } from "@/lib/prisma";

export type MemoryInfo = {
  totalBytes: number;
  freeBytes: number;
  usedBytes: number;
  usedPercent: number;
};

export type DiskInfo = {
  path: string;
  totalBytes: number;
  freeBytes: number;
  usedBytes: number;
  usedPercent: number;
};

export type CpuInfo = {
  model: string;
  cores: number;
  loadAvg1: number;
  loadAvg5: number;
  loadAvg15: number;
};

export type RuntimeInfo = {
  nodeVersion: string;
  platform: string;
  arch: string;
  hostname: string;
  kernelRelease: string;
  uptimeSeconds: number;
  appVersion: string;
  appName: string;
  nodeEnv: string;
};

export type DbTimeInfo =
  | {
      ok: true;
      globalTz: string;
      sessionTz: string;
      systemTz: string;
      serverEpochMs: number;
      driftMs: number;
    }
  | { ok: false; error: string };

export type NtpInfo =
  | {
      ok: true;
      host: string;
      serverEpochMs: number;
      offsetMs: number;
      roundTripMs: number;
    }
  | { ok: false; host: string; error: string };

export type SystemSnapshot = {
  snapshotAt: number;
  runtime: RuntimeInfo;
  cpu: CpuInfo;
  memory: MemoryInfo;
  disks: DiskInfo[];
  db: DbTimeInfo;
  ntp: NtpInfo;
};

function getDisk(diskPath: string): DiskInfo | null {
  try {
    const s = fs.statfsSync(diskPath);
    const totalBytes = s.blocks * s.bsize;
    const freeBytes = s.bavail * s.bsize;
    const usedBytes = totalBytes - freeBytes;
    return {
      path: diskPath,
      totalBytes,
      freeBytes,
      usedBytes,
      usedPercent:
        totalBytes > 0 ? Math.round((usedBytes / totalBytes) * 100) : 0,
    };
  } catch {
    return null;
  }
}

async function getDbTime(appNowMs: number): Promise<DbTimeInfo> {
  try {
    const rows = await prisma.$queryRaw<
      Array<{
        gtz: string;
        stz: string;
        systz: string;
        dbEpoch: number | string | bigint;
      }>
    >`SELECT @@global.time_zone AS gtz, @@session.time_zone AS stz, @@system_time_zone AS systz, UNIX_TIMESTAMP() AS dbEpoch`;
    const row = rows[0];
    if (!row) return { ok: false, error: "No rows returned." };
    const dbEpochMs = Number(row.dbEpoch) * 1000;
    return {
      ok: true,
      globalTz: row.gtz,
      sessionTz: row.stz,
      systemTz: row.systz,
      serverEpochMs: dbEpochMs,
      driftMs: appNowMs - dbEpochMs,
    };
  } catch {
    return { ok: false, error: "Gagal membaca waktu database." };
  }
}

export async function getSystemSnapshot(): Promise<SystemSnapshot> {
  const snapshotAt = Date.now();

  // Run DB and NTP in parallel — both are network I/O
  const [db, ntpResult] = await Promise.all([
    getDbTime(snapshotAt),
    queryNtp(),
  ]);

  const ntp: NtpInfo = ntpResult.ok
    ? {
        ok: true,
        host: ntpResult.host,
        serverEpochMs: ntpResult.serverTime.getTime(),
        offsetMs: ntpResult.offsetMs,
        roundTripMs: ntpResult.roundTripMs,
      }
    : { ok: false, host: ntpResult.host, error: ntpResult.error };

  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  const [load1, load5, load15] = os.loadavg();

  // Check storage dir + root disk
  const storagePath = path.resolve("storage");
  const diskPaths = [storagePath, "/"];
  const seen = new Set<string>();
  const disks: DiskInfo[] = [];
  for (const p of diskPaths) {
    const d = getDisk(p);
    if (d && !seen.has(d.path)) {
      seen.add(d.path);
      // use a friendlier label instead of raw path for root
      disks.push({ ...d, path: p === "/" ? "/" : p });
    }
  }

  return {
    snapshotAt,
    runtime: {
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      kernelRelease: os.release(),
      uptimeSeconds: Math.floor(os.uptime()),
      appVersion: pkg.version,
      appName: appConfig.name,
      nodeEnv: env.NODE_ENV,
    },
    cpu: {
      model: os.cpus()[0]?.model ?? "unknown",
      cores: os.cpus().length,
      loadAvg1: Math.round(load1 * 100) / 100,
      loadAvg5: Math.round(load5 * 100) / 100,
      loadAvg15: Math.round(load15 * 100) / 100,
    },
    memory: {
      totalBytes: total,
      freeBytes: free,
      usedBytes: used,
      usedPercent: Math.round((used / total) * 100),
    },
    disks,
    db,
    ntp,
  };
}
