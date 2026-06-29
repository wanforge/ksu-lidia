import { routes } from "@/config/routes";

export const pageLinks = [
  {
    name: "Operasional",
  },
  {
    name: "Dashboard",
    href: routes.dashboard,
  },
  {
    name: "Akses Pribadi",
  },
  {
    name: "Data Saya",
    href: routes.me.dashboard,
  },
  {
    name: "Administrasi",
  },
  {
    name: "Users",
    href: routes.users.list,
  },
  {
    name: "Audit Log",
    href: routes.audit.list,
  },
  {
    name: "Log Perubahan Data",
    href: routes.audit.dataChangeLog,
  },
];
