"use client";

import { useSession } from "next-auth/react";
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  type Permission,
} from "@/lib/rbac/permissions";

/**
 * Hook akses permission untuk komponen klien. Membaca role dari sesi NextAuth.
 */
export function usePermissions() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  return {
    role,
    can: (permission: Permission) => hasPermission(role, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),
    canAll: (permissions: Permission[]) => hasAllPermissions(role, permissions),
  };
}

type CanProps = {
  /** Satu permission yang dibutuhkan. */
  permission?: Permission;
  /** Beberapa permission — default butuh SALAH SATU (any). */
  anyOf?: Permission[];
  /** Beberapa permission — butuh SEMUA. */
  allOf?: Permission[];
  /** Tampilkan ini bila TIDAK punya akses (default: tidak menampilkan apa-apa). */
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Gerbang akses deklaratif. Menyembunyikan children bila role tidak memenuhi
 * permission yang diminta. Pakai untuk tombol/link/section yang sensitif.
 *
 * <Can permission={PERMISSIONS.EMPLOYEE_CREATE}><AddButton/></Can>
 */
export function Can({
  permission,
  anyOf,
  allOf,
  fallback = null,
  children,
}: CanProps) {
  const { can, canAny, canAll } = usePermissions();

  let allowed = true;
  if (permission) allowed = allowed && can(permission);
  if (anyOf) allowed = allowed && canAny(anyOf);
  if (allOf) allowed = allowed && canAll(allOf);

  return <>{allowed ? children : fallback}</>;
}
