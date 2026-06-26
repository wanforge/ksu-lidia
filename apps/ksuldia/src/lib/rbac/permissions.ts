/**
 * Permission-based access control (RBAC).
 *
 * Akses ditentukan oleh PERMISSION per-fitur, bukan langsung oleh role.
 * Role hanyalah kumpulan permission (lihat ROLE_PERMISSIONS). Untuk mengubah
 * siapa boleh apa, cukup sunting matriks di bawah — tidak perlu menyentuh
 * guard di halaman/menu/route.
 *
 * Modul ini EDGE-SAFE: hanya `import type` dari @prisma/client (tanpa nilai),
 * tanpa import Node/Prisma, sehingga aman dipakai di middleware, server, dan
 * client.
 */
import type { UserRole } from "@prisma/client";

// ── Daftar permission (feature.action) ────────────────────────────────────────

export const PERMISSIONS = {
  // Dashboard back-office
  DASHBOARD_VIEW: "dashboard.view",

  // Manajemen user
  USER_MANAGE: "user.manage",

  // Audit & log perubahan
  AUDIT_VIEW: "audit.view",
  DATA_CHANGE_LOG_VIEW: "dataChangeLog.view",

  // Diagnostik sistem
  SYSTEM_VIEW: "system.view",

  // Portal self-service (/me)
  PORTAL_VIEW: "portal.view",

  // Vault akun aplikasi
  VAULT_VIEW: "vault.view", // lihat & kelola vault sendiri
  VAULT_MANAGE_ANY: "vault.manageAny", // lihat & kelola vault semua user (ADMIN)

  // Simpan Pinjam
  SIMPAN_PINJAM_VIEW: "simpanPinjam.view",
  SIMPAN_PINJAM_MANAGE: "simpanPinjam.manage",

  // Toko
  TOKO_VIEW: "toko.view",
  TOKO_MANAGE: "toko.manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ── Matriks role → permission ─────────────────────────────────────────────────
// Sunting di sini untuk mengubah hak akses. ADMIN selalu mendapat semua.

const ALL_PERMISSIONS = Object.values(PERMISSIONS) as Permission[];

const OPERATOR_PERMISSIONS: Permission[] = [
  PERMISSIONS.DASHBOARD_VIEW,
  PERMISSIONS.AUDIT_VIEW,
  PERMISSIONS.PORTAL_VIEW,
  PERMISSIONS.VAULT_VIEW,
  PERMISSIONS.SIMPAN_PINJAM_VIEW,
  PERMISSIONS.SIMPAN_PINJAM_MANAGE,
  PERMISSIONS.TOKO_VIEW,
  PERMISSIONS.TOKO_MANAGE,
];

const VERIFIER_PERMISSIONS: Permission[] = [
  PERMISSIONS.DASHBOARD_VIEW,
  PERMISSIONS.AUDIT_VIEW,
  PERMISSIONS.PORTAL_VIEW,
  PERMISSIONS.VAULT_VIEW,
  PERMISSIONS.SIMPAN_PINJAM_VIEW,
  PERMISSIONS.TOKO_VIEW,
];

const VIEWER_PERMISSIONS: Permission[] = [
  PERMISSIONS.DASHBOARD_VIEW,
  PERMISSIONS.PORTAL_VIEW,
  PERMISSIONS.VAULT_VIEW,
  PERMISSIONS.SIMPAN_PINJAM_VIEW,
  PERMISSIONS.TOKO_VIEW,
];

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  ADMIN: ALL_PERMISSIONS,
  OPERATOR: OPERATOR_PERMISSIONS,
  VERIFIER: VERIFIER_PERMISSIONS,
  VIEWER: VIEWER_PERMISSIONS,
};

// ── Helper ─────────────────────────────────────────────────────────────────────

export function hasPermission(
  role: UserRole | string | undefined | null,
  permission: Permission
): boolean {
  if (!role) return false;
  const list = ROLE_PERMISSIONS[role as UserRole];
  return list ? list.includes(permission) : false;
}

export function hasAnyPermission(
  role: UserRole | string | undefined | null,
  permissions: Permission[]
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(
  role: UserRole | string | undefined | null,
  permissions: Permission[]
): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/** Semua permission milik sebuah role (mis. untuk dikirim ke client sekali). */
export function permissionsForRole(
  role: UserRole | string | undefined | null
): readonly Permission[] {
  if (!role) return [];
  return ROLE_PERMISSIONS[role as UserRole] ?? [];
}
