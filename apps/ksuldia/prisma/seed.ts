import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";
import { seedDemoUser } from "./data/demo";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL ?? "");
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱  Seeding database...");

  const emailDomain =
    process.env.NEXT_PUBLIC_ORG_EMAIL_DOMAIN?.trim() || "instansi.go.id";

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
      name: "Operator SDM",
      email: `operator@${emailDomain}`,
      password: "Operator@1234",
      role: UserRole.OPERATOR,
    },
    {
      name: "Verifikator Dokumen",
      email: `verifikator@${emailDomain}`,
      password: "Verifikator@1234",
      role: UserRole.VERIFIER,
    },
    {
      name: "Viewer SDM",
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
