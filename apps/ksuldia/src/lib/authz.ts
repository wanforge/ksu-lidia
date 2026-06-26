import type { UserRole } from "@prisma/client";
import {
  PERMISSIONS,
  type Permission,
  hasPermission,
  hasAnyPermission,
} from "@/lib/rbac/permissions";

type SessionUser = {
  id: string;
  role: UserRole;
};

/**
 * Akses berbasis PERMISSION (lihat src/lib/rbac/permissions.ts). Helper di bawah
 * adalah pembungkus tipis di atas matriks permission agar guard lama tetap jalan;
 * untuk fitur baru pakai `can(role, PERMISSIONS.X)` langsung.
 */

/** Cek satu permission untuk sebuah role. */
export function can(
  role: UserRole | string | undefined | null,
  permission: Permission
): boolean {
  return hasPermission(role, permission);
}

export { hasPermission, hasAnyPermission, PERMISSIONS };
export type { Permission };

// ── Pembungkus kompatibilitas (semantik tidak berubah) ────────────────────────

/** Punya akses back-office (bukan EMPLOYEE murni). */
export function isBackOfficeRole(role: UserRole): boolean {
  return hasPermission(role, PERMISSIONS.DASHBOARD_VIEW);
}

/** Boleh melihat audit log. */
export function canViewAuditLog(role: UserRole): boolean {
  return hasPermission(role, PERMISSIONS.AUDIT_VIEW);
}
