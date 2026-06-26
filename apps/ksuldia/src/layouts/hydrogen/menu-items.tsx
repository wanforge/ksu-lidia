import { routes } from "@/config/routes";
import { type ReactNode } from "react";
import { PERMISSIONS, type Permission } from "@/lib/rbac/permissions";
import {
  PiClockCountdownDuotone,
  PiClockCounterClockwiseDuotone,
  PiGaugeDuotone,
  PiIdentificationCardDuotone,
  PiPulseDuotone,
  PiUserCircleDuotone,
  PiVaultDuotone,
  PiUsersDuotone,
  PiCoinsDuotone,
  PiStorefrontDuotone,
  PiShoppingCartDuotone,
} from "react-icons/pi";

type MenuItem = {
  name: string;
  href?: string;
  icon?: ReactNode;
  badge?: string;
  /** Permission required to see this item. Section headers omit it. */
  permission?: Permission;
  dropdownItems?: Array<{
    name: string;
    href: string;
    badge?: string;
    permission?: Permission;
  }>;
};

export const menuItems: MenuItem[] = [
  {
    name: "Operasional",
  },
  {
    name: "Dashboard",
    href: routes.dashboard,
    icon: <PiGaugeDuotone />,
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    name: "Simpan Pinjam",
  },
  {
    name: "Daftar Anggota",
    href: routes.simpanPinjam.anggota,
    icon: <PiUsersDuotone />,
    permission: PERMISSIONS.SIMPAN_PINJAM_VIEW,
  },
  {
    name: "Pinjaman & Kredit",
    href: routes.simpanPinjam.pinjaman,
    icon: <PiCoinsDuotone />,
    permission: PERMISSIONS.SIMPAN_PINJAM_VIEW,
  },
  {
    name: "Toko Lidia",
  },
  {
    name: "Katalog Produk",
    href: routes.toko.produk,
    icon: <PiStorefrontDuotone />,
    permission: PERMISSIONS.TOKO_VIEW,
  },
  {
    name: "Transaksi & Stok",
    href: routes.toko.transaksi,
    icon: <PiShoppingCartDuotone />,
    permission: PERMISSIONS.TOKO_VIEW,
  },
  {
    name: "Akses Pribadi",
  },
  {
    name: "Data Saya",
    href: routes.me.dashboard,
    icon: <PiUserCircleDuotone />,
    permission: PERMISSIONS.PORTAL_VIEW,
  },
  {
    name: "Akun Aplikasi",
    href: routes.me.vault,
    icon: <PiVaultDuotone />,
    permission: PERMISSIONS.VAULT_VIEW,
  },
  {
    name: "Administrasi",
  },
  {
    name: "Users",
    href: routes.users.list,
    icon: <PiIdentificationCardDuotone />,
    permission: PERMISSIONS.USER_MANAGE,
  },
  {
    name: "Audit Log",
    href: routes.audit.list,
    icon: <PiClockCountdownDuotone />,
    permission: PERMISSIONS.AUDIT_VIEW,
  },
  {
    name: "Log Perubahan Data",
    href: routes.dataChangeLog,
    icon: <PiClockCounterClockwiseDuotone />,
    permission: PERMISSIONS.DATA_CHANGE_LOG_VIEW,
  },
  {
    name: "Diagnostik Sistem",
    href: routes.system,
    icon: <PiPulseDuotone />,
    permission: PERMISSIONS.SYSTEM_VIEW,
  },
];

export type { MenuItem };
