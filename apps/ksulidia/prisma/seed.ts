import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";
import { seedDemoUser } from "./data/demo";
import { seedBulananSimpanPinjam } from "./data/01-seeder-bulanan-simpan-pinjam";
import { seedBukuKasKoperasi } from "./data/02-seeder-buku-kas-koperasi";
import { seedBukuKasToko } from "./data/03-seeder-buku-kas-toko";
import { seedLaporanTriwulanToko } from "./data/04-seeder-triwulan-toko";
import { seedLaporanRat } from "./data/05-seeder-rat-2025";
import { seedLaporanKonsolidasi } from "./data/06-seeder-konsolidasi-2026";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL ?? "");
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱  Seeding database...");

  const emailDomain =
    process.env.NEXT_PUBLIC_ORG_EMAIL_DOMAIN?.trim() ||
    "ksulidiagkjmanahan.com";

  type SeedUser = {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  };

  const seedUsers: SeedUser[] = [
    {
      name: "Administrator",
      email: process.env.SEED_ADMIN_EMAIL?.trim() || `admin@${emailDomain}`,
      password: process.env.SEED_ADMIN_PASSWORD?.trim() || "Admin@1234",
      role: UserRole.ADMIN,
    },
    {
      name: "Viewer KSU Lidia",
      email: `viewer@${emailDomain}`,
      password: "Viewer@1234",
      role: UserRole.VIEWER,
    },
  ];

  for (const seedUser of seedUsers) {
    const existing = await prisma.user.findUnique({
      where: { email: seedUser.email },
    });
    if (!existing) {
      const hashed = await bcrypt.hash(seedUser.password, 12);
      const created = await prisma.user.create({
        data: {
          name: seedUser.name,
          email: seedUser.email,
          password: hashed,
          role: seedUser.role,
          isActive: true,
          passwordChangedAt: new Date(),
        },
      });
      console.log(`✅  Created ${seedUser.role} user: ${created.email}`);
    } else {
      console.log(
        `ℹ️   ${seedUser.role} user already exists: ${seedUser.email}`
      );
    }
  }

  // Seed demo user account
  await seedDemoUser(prisma, emailDomain);

  // Run the 6 seeders sequentially
  await seedBulananSimpanPinjam(prisma);
  await seedBukuKasKoperasi(prisma);
  await seedBukuKasToko(prisma);
  await seedLaporanTriwulanToko(prisma);
  await seedLaporanRat(prisma);
  await seedLaporanKonsolidasi(prisma);

  console.log("✅  Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
