/**
 * Pemetaan route → permission untuk gating di middleware (edge-safe).
 *
 * Urutan penting: pola paling spesifik diletakkan lebih dulu. `permissionForPath`
 * mengembalikan permission pertama yang cocok, atau null bila route tidak diatur
 * (berarti cukup terautentikasi).
 */
import type { UserRole } from "@prisma/client";
import { PERMISSIONS, type Permission, hasPermission } from "./permissions";

type RouteRule = {
  /** Cocokkan persis (exact) atau sebagai prefix. */
  match: "exact" | "prefix";
  path: string;
  permission: Permission;
};

// Diurutkan dari yang paling spesifik ke umum.
const ROUTE_RULES: RouteRule[] = [
  { match: "exact", path: "/", permission: PERMISSIONS.DASHBOARD_VIEW },

  { match: "prefix", path: "/users", permission: PERMISSIONS.USER_MANAGE },
  { match: "prefix", path: "/audit", permission: PERMISSIONS.AUDIT_VIEW },
  {
    match: "prefix",
    path: "/log-perubahan",
    permission: PERMISSIONS.DATA_CHANGE_LOG_VIEW,
  },
  { match: "prefix", path: "/sistem", permission: PERMISSIONS.SYSTEM_VIEW },
  {
    match: "prefix",
    path: "/simpan-pinjam",
    permission: PERMISSIONS.SIMPAN_PINJAM_VIEW,
  },
  { match: "prefix", path: "/toko", permission: PERMISSIONS.TOKO_VIEW },

  { match: "prefix", path: "/me", permission: PERMISSIONS.PORTAL_VIEW },
];

/** Permission yang dibutuhkan untuk sebuah path, atau null bila tak diatur. */
export function permissionForPath(pathname: string): Permission | null {
  for (const rule of ROUTE_RULES) {
    if (rule.match === "exact") {
      if (pathname === rule.path) return rule.permission;
    } else if (pathname === rule.path || pathname.startsWith(`${rule.path}/`)) {
      return rule.permission;
    }
  }
  return null;
}

/** Halaman default sesuai role (untuk redirect saat akses ditolak). */
export function defaultLandingPath(
  role: UserRole | string | undefined
): string {
  if (hasPermission(role, PERMISSIONS.DASHBOARD_VIEW)) return "/";
  if (hasPermission(role, PERMISSIONS.PORTAL_VIEW)) return "/me";
  return "/signin";
}
