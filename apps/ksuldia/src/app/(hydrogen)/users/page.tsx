import { getSession } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import UsersWorkspace from "./users-workspace";

export const dynamic = "force-dynamic";

type DeletedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  deletedAt: Date | null;
};

type WorkspaceUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  passwordChangedAt: Date | null;
  createdAt: Date;

  activeTokenExpiresAt: Date | null;
};

type UsersData = {
  users: WorkspaceUser[];
  deletedUsers: DeletedUser[];
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  databaseReady: boolean;
};

async function getUsersData(): Promise<UsersData> {
  const now = new Date();

  try {
    const [rawUsers, deletedUsers, totalUsers, activeUsers, adminUsers] =
      await Promise.all([
        prisma.user.findMany({
          where: { deletedAt: null },
          orderBy: [{ createdAt: "desc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            lastLoginAt: true,
            passwordChangedAt: true,
            createdAt: true,

            passwordResetTokens: {
              where: {
                usedAt: null,
                revokedAt: null,
                expiresAt: { gt: now },
              },
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { expiresAt: true },
            },
          },
        }),
        prisma.user.findMany({
          where: { deletedAt: { not: null } },
          orderBy: { deletedAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            deletedAt: true,
          },
        }),
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.user.count({ where: { deletedAt: null, isActive: true } }),
        prisma.user.count({ where: { deletedAt: null, role: UserRole.ADMIN } }),
      ]);

    const users: WorkspaceUser[] = rawUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      passwordChangedAt: user.passwordChangedAt,
      createdAt: user.createdAt,

      activeTokenExpiresAt: user.passwordResetTokens[0]?.expiresAt ?? null,
    }));

    return {
      users,
      deletedUsers,
      totalUsers,
      activeUsers,
      adminUsers,
      databaseReady: true,
    };
  } catch {
    return {
      users: [],
      deletedUsers: [],
      totalUsers: 0,
      activeUsers: 0,
      adminUsers: 0,
      databaseReady: false,
    };
  }
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-5">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-gray-950">{value}</p>
    </div>
  );
}

export default async function UsersPage() {
  const session = await getSession();

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return (
      <div className="mx-auto w-full max-w-[900px] rounded-md border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800">
        Hanya administrator yang dapat mengelola pengguna.
      </div>
    );
  }

  const data = await getUsersData();

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 border-b border-gray-200 pb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">
            Administrasi Akses
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl">
            Manajemen Pengguna
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Kelola akun internal: tambah, ubah peran, atur ulang kata sandi, dan
            nonaktifkan atau hapus. Pendaftaran publik dinonaktifkan.
          </p>
        </div>
      </section>

      {!data.databaseReady ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Data belum dapat dimuat saat ini. Manajemen pengguna akan aktif
          setelah migrasi berjalan.
        </div>
      ) : null}

      <section className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="Total Pengguna" value={data.totalUsers} />
        <StatCard label="Aktif" value={data.activeUsers} />
        <StatCard label="Administrator" value={data.adminUsers} />
      </section>

      <UsersWorkspace
        users={data.users}
        deletedUsers={data.deletedUsers}
        currentUserId={session.user.id}
      />
    </div>
  );
}
