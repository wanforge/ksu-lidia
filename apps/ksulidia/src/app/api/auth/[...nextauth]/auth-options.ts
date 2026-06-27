import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AttachmentSource, AuditAction, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit";
import { verifyPassword } from "@/lib/password";
import { consumeLoginAttempt, resetLoginAttempts } from "@/lib/rate-limit";

// Public sign-up and public forgot-password flows are intentionally disabled.
// User creation and password reset are admin-managed workflows.
export const authOptions: NextAuthOptions = {
  // A stale/invalid session cookie (e.g. left over from a previous dev run or
  // secret) makes getServerSession fail to decrypt the JWT. That is benign —
  // the user is simply treated as logged out — so we don't surface it as an
  // error (it would otherwise be logged on every render of the root layout).
  logger: {
    error(code, metadata) {
      if (code === "JWT_SESSION_ERROR") return;
      console.error(`[next-auth][error][${code}]`, metadata);
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },
  events: {
    async signIn({ user }) {
      const u = user as { id: string; role?: UserRole; email?: string | null };
      await recordAuditLog(prisma, {
        actorId: u.id,
        actorRole: u.role ?? null,
        action: AuditAction.LOGIN,
        entityType: "User",
        entityId: u.id,
        source: AttachmentSource.BACK_OFFICE,
        summary: `Login ${u.email ?? ""}`.trim(),
      });
    },
    async signOut({ token }) {
      const id = token?.id as string | undefined;
      if (!id) return;
      await recordAuditLog(prisma, {
        actorId: id,
        actorRole: (token.role as UserRole) ?? null,
        action: AuditAction.LOGOUT,
        entityType: "User",
        entityId: id,
        summary: "Logout",
      });
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.image = (user as any).image ?? null;
        token.name = user.name;
        token.email = user.email;
        token.lastRefreshedAt = Date.now();
      } else {
        // Always re-fetch mutable fields from DB so admin changes (link
        // employee, role change, deactivation, foto profil) take effect
        // immediately (juga saat session.update() dipanggil setelah ganti foto).
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            name: true,
            role: true,
            isActive: true,
            deletedAt: true,
            image: true,
          },
        });
        if (!dbUser || !dbUser.isActive || dbUser.deletedAt) {
          return null as any;
        }
        token.name = dbUser.name;
        token.role = dbUser.role;
        token.image = dbUser.image ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      const photoKey = (token.image as string | null) ?? null;
      // URL stabil + versi dari nama file (unik per unggahan) agar cache pecah
      // otomatis saat foto diganti.
      const imageUrl = photoKey
        ? `/api/ksulidia/photo/user/${token.id}?v=${photoKey.split("/").pop()}`
        : null;
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
          image: imageUrl,
        },
      };
    },
    async redirect({ baseUrl }) {
      return baseUrl;
    },
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        captchaToken: { label: "CAPTCHA", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Verify CAPTCHA before touching the database.
        const { verifyCaptcha } = await import("@/lib/captcha");
        const captchaOk = await verifyCaptcha(credentials.captchaToken);
        if (!captchaOk) {
          throw new Error("CAPTCHA_FAILED");
        }

        // Throttle repeated attempts per email to slow credential stuffing.
        const rateLimitKey = credentials.email.trim().toLowerCase();
        if (!consumeLoginAttempt(rateLimitKey).allowed) {
          throw new Error("TOO_MANY_ATTEMPTS");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.isActive || user.deletedAt) {
          return null;
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );
        if (!isValid) {
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        resetLoginAttempts(rateLimitKey);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        } as any;
      },
    }),
  ],
};
