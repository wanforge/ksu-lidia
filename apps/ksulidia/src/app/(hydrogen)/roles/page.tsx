import React from "react";
import { getSession } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { PERMISSIONS, ROLE_PERMISSIONS } from "@/lib/rbac/permissions";
import {
  PiShieldCheckDuotone,
  PiCheckCircleDuotone,
  PiXCircleDuotone,
} from "react-icons/pi";
import { Table } from "rizzui";
import type { Permission } from "@/lib/rbac/permissions";

export const metadata = {
  title: "Roles & Permission",
};

export default async function RolesPage() {
  const session = await getSession();

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return (
      <div className="mx-auto w-full max-w-[900px] rounded-md border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800">
        Hanya administrator yang dapat melihat Roles & Permission.
      </div>
    );
  }

  // Get all permission keys and group them by module (prefix before the dot)
  const permissionEntries = Object.entries(PERMISSIONS);
  const groupedPermissions: Record<
    string,
    { key: string; value: Permission }[]
  > = {};

  permissionEntries.forEach(([key, value]) => {
    const moduleName = value.split(".")[0];
    if (!groupedPermissions[moduleName]) {
      groupedPermissions[moduleName] = [];
    }
    groupedPermissions[moduleName].push({ key, value });
  });

  const roles = Object.keys(ROLE_PERMISSIONS) as UserRole[];

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="border-b border-gray-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-red-700">
          Administrasi
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl">
          Roles & Permissions
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
          Daftar peran sistem dan hak akses spesifik (read-only). Untuk
          mengubah, edit matriks langsung di file sumber.
        </p>
      </section>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50/50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <PiShieldCheckDuotone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Permission Matrix</h3>
              <p className="text-xs text-gray-500">
                Peta akses per peran sistem
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto p-0">
          <Table variant="minimal" className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Modul / Fitur</th>
                <th className="px-6 py-4 font-semibold">Kode Akses</th>
                {roles.map((role) => (
                  <th key={role} className="px-6 py-4 text-center font-bold">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
                <React.Fragment key={moduleName}>
                  <tr className="bg-gray-50/30">
                    <td
                      colSpan={2 + roles.length}
                      className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500"
                    >
                      {moduleName}
                    </td>
                  </tr>
                  {perms.map((p) => (
                    <tr key={p.key} className="transition-colors hover:bg-gray-50/50">
                      <td className="px-6 py-3.5 font-medium text-gray-900">
                        {p.key.replace(/_/g, " ")}
                      </td>
                      <td className="px-6 py-3.5 text-xs font-mono text-gray-500">
                        {p.value}
                      </td>
                      {roles.map((role) => {
                        const hasPerm = ROLE_PERMISSIONS[role].includes(
                          p.value
                        );
                        return (
                          <td key={role} className="px-6 py-3.5 text-center">
                            {hasPerm ? (
                              <PiCheckCircleDuotone className="mx-auto h-5 w-5 text-emerald-500" />
                            ) : (
                              <PiXCircleDuotone className="mx-auto h-5 w-5 text-gray-300" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}
