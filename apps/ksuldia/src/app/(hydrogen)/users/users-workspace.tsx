"use client";

import { Fragment, useMemo, useState } from "react";
import {
  PiCaretDownBold,
  PiMagnifyingGlassBold,
  PiPlusBold,
  PiTrashDuotone,
  PiUsersThreeDuotone,
} from "react-icons/pi";
import EmptyState from "@/app/(hydrogen)/_components/empty-state";
import UserCreateForm from "./user-create-form";
import UserManagePanel from "./user-manage-panel";
import RestoreUserButton from "./restore-user-button";
import {
  useClientSort,
  ClientSortHeader,
} from "@/app/(hydrogen)/_components/client-sortable";
import { formatNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";

type WorkspaceUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  passwordChangedAt: Date | null;
  createdAt: Date;

  activeTokenExpiresAt: Date | null;
};

type DeletedUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  deletedAt: Date | null;
};

type UsersWorkspaceProps = {
  users: WorkspaceUser[];
  deletedUsers: DeletedUser[];
  currentUserId: string;
};

const roleLabels: Record<string, string> = {
  ADMIN: "Administrator",
  VIEWER: "Viewer",
};

const roleTone: Record<string, string> = {
  ADMIN: "border-rose-200 bg-rose-50 text-rose-800",
  VIEWER: "border-gray-200 bg-gray-50 text-gray-700",
};

function StatusPill({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}

function formatDate(date?: Date | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

const tabBase =
  "inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition";
const tabActive = "border-primary text-primary";
const tabIdle = "border-transparent text-gray-500 hover:text-gray-800";

export default function UsersWorkspace({
  users,
  deletedUsers,
  currentUserId,
}: UsersWorkspaceProps) {
  const [tab, setTab] = useState<"list" | "deleted" | "create">("list");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    });
  }, [users, query, roleFilter]);

  const { sorted, sortKey, sortDir, requestSort } = useClientSort(filtered, {
    accessors: {},
  });

  return (
    <div className="rounded-md border border-gray-200 bg-white">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 px-3">
        <button
          type="button"
          className={`${tabBase} ${tab === "list" ? tabActive : tabIdle}`}
          onClick={() => setTab("list")}
        >
          <PiUsersThreeDuotone className="h-4 w-4" />
          Daftar Pengguna
          <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {formatNumber(users.length)}
          </span>
        </button>
        <button
          type="button"
          className={`${tabBase} ${tab === "deleted" ? tabActive : tabIdle}`}
          onClick={() => setTab("deleted")}
        >
          <PiTrashDuotone className="h-4 w-4" />
          Pengguna Terhapus
          {deletedUsers.length > 0 ? (
            <span className="ml-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
              {formatNumber(deletedUsers.length)}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          className={`${tabBase} ${tab === "create" ? tabActive : tabIdle}`}
          onClick={() => setTab("create")}
        >
          <PiPlusBold className="h-4 w-4" />
          Tambah Pengguna
        </button>
      </div>

      {tab === "create" ? (
        <div className="p-5">
          <UserCreateForm />
        </div>
      ) : tab === "deleted" ? (
        <div>
          <div className="flex items-start gap-2 border-b border-gray-100 bg-rose-50/50 px-5 py-3 text-xs text-rose-800">
            <PiTrashDuotone className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Penghapusan pengguna bersifat <strong>soft-delete</strong> — data
              tetap tersimpan dan akunnya dinonaktifkan. Pulihkan untuk
              mengaktifkan kembali.
            </p>
          </div>
          {deletedUsers.length === 0 ? (
            <EmptyState
              icon={PiTrashDuotone}
              title="Tidak ada pengguna terhapus"
              description="Pengguna yang dihapus akan muncul di sini dan dapat dipulihkan."
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {deletedUsers.map((user) => (
                <li
                  key={user.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">
                      {user.name}
                    </p>
                    <p className="truncate text-sm text-gray-500">
                      {user.email} · {roleLabels[user.role] ?? user.role}
                      {user.deletedAt
                        ? ` · dihapus ${formatDate(user.deletedAt)}`
                        : ""}
                    </p>
                  </div>
                  <RestoreUserButton userId={user.id} name={user.name} />
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div>
          {/* Filters */}
          <div className="grid grid-cols-1 gap-3 border-b border-gray-200 p-4 md:grid-cols-[minmax(0,1fr)_220px]">
            <label className="relative">
              <PiMagnifyingGlassBold className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama atau email..."
                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-700"
              />
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-700"
            >
              <option value="">Semua Peran</option>
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={PiUsersThreeDuotone}
              title="Tidak ada pengguna yang cocok"
              description="Ubah kata kunci atau filter peran."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-[13px]">
                <thead className="bg-gray-50">
                  <tr>
                    <ClientSortHeader
                      label="Pengguna"
                      active={sortKey === "name"}
                      dir={sortDir}
                      onClick={() => requestSort("name")}
                      className="min-w-[240px]"
                    />
                    <ClientSortHeader
                      label="Peran / Status"
                      active={sortKey === "role"}
                      dir={sortDir}
                      onClick={() => requestSort("role")}
                      className="whitespace-nowrap"
                    />

                    <ClientSortHeader
                      label="Masuk"
                      active={sortKey === "lastLoginAt"}
                      dir={sortDir}
                      onClick={() => requestSort("lastLoginAt")}
                      className="min-w-[200px]"
                    />
                    <th className="px-3 py-2 text-right font-semibold text-gray-600">
                      Kelola
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {sorted.map((user) => {
                    const isOpen = openId === user.id;
                    return (
                      <Fragment key={user.id}>
                        <tr className="align-top">
                          <td className="px-3 py-2.5">
                            <p className="font-semibold text-gray-950">
                              {user.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {user.email}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              Dibuat {formatDate(user.createdAt)}
                            </p>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex flex-wrap gap-2">
                              <StatusPill
                                label={roleLabels[user.role] ?? user.role}
                                className={
                                  roleTone[user.role] ??
                                  "border-gray-200 bg-gray-50 text-gray-700"
                                }
                              />
                              <StatusPill
                                label={user.isActive ? "Aktif" : "Nonaktif"}
                                className={
                                  user.isActive
                                    ? "border-teal-200 bg-teal-50 text-teal-800"
                                    : "border-gray-200 bg-gray-50 text-gray-600"
                                }
                              />
                            </div>
                          </td>

                          <td className="px-3 py-2.5">
                            <p className="text-gray-700">
                              Terakhir: {formatDate(user.lastLoginAt)}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              Kata Sandi: {formatDate(user.passwordChangedAt)}
                            </p>
                            {user.activeTokenExpiresAt ? (
                              <p className="mt-1 text-xs font-medium text-amber-800">
                                Token hingga{" "}
                                {formatDate(user.activeTokenExpiresAt)}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <Button
                              variant="neutral"
                              size="md"
                              onClick={() => setOpenId(isOpen ? null : user.id)}
                            >
                              Kelola
                              <PiCaretDownBold
                                className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                              />
                            </Button>
                          </td>
                        </tr>
                        {isOpen ? (
                          <tr className="bg-gray-50/40">
                            <td colSpan={5} className="px-3 py-2.5">
                              <UserManagePanel
                                user={{
                                  id: user.id,
                                  name: user.name,
                                  email: user.email,
                                  role: user.role,
                                  isActive: user.isActive,
                                }}
                                isSelf={user.id === currentUserId}
                              />
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
