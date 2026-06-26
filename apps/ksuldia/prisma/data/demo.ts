/**
 * Akun demo pengembang — "Sugeng Sulistiyawan" (unit IT).
 *
 * Dipakai oleh seeder agar selalu tersedia satu pengguna demo 
 * untuk SETIAP role. 
 *
 * Nonaktifkan dengan SEED_DEMO_USER=false. Ubah password dengan
 * SEED_DEMO_PASSWORD. Semua bersifat idempotent.
 */
import { type PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const DEMO_NAME = "Sugeng Sulistiyawan";

type DemoAccount = { email: string; role: UserRole };

export async function seedDemoUser(
  prisma: PrismaClient,
  emailDomain: string
): Promise<void> {
  if (process.env.SEED_DEMO_USER?.trim().toLowerCase() === "false") {
    console.log("ℹ️   Pengguna demo (Sugeng) dilewati (SEED_DEMO_USER=false).");
    return;
  }

  const password = process.env.SEED_DEMO_PASSWORD?.trim() || "Sugeng@1234";

  // 1. Satu akun per role.
  const accounts: DemoAccount[] = [
    { email: `sugeng.admin@${emailDomain}`, role: UserRole.ADMIN },
    { email: `sugeng.operator@${emailDomain}`, role: UserRole.OPERATOR },
    { email: `sugeng.verifier@${emailDomain}`, role: UserRole.VERIFIER },
    { email: `sugeng.viewer@${emailDomain}`, role: UserRole.VIEWER },
    { email: `sugeng@${emailDomain}`, role: UserRole.EMPLOYEE },
  ];

  const hashed = await bcrypt.hash(password, 12);
  for (const acc of accounts) {
    const existing = await prisma.user.findUnique({
      where: { email: acc.email },
    });
    if (existing) {
      console.log(`ℹ️   Akun demo ${acc.role} sudah ada: ${acc.email}`);
      continue;
    }
    await prisma.user.create({
      data: {
        name: DEMO_NAME,
        email: acc.email,
        password: hashed,
        role: acc.role,
        isActive: true,
        passwordChangedAt: new Date(),
      },
    });
    console.log(`✅  Akun demo ${acc.role}: ${acc.email}`);
  }

  console.log(
    `✅  Akun demo "${DEMO_NAME}" siap. Password semua akun demo: ${password}`
  );
}
