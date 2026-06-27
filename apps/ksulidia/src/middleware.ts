import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { type UserRole } from "@prisma/client";
import { hasPermission } from "@/lib/rbac/permissions";
import {
  permissionForPath,
  defaultLandingPath,
} from "@/lib/rbac/route-permissions";

// Type-only `UserRole` import keeps @prisma/client out of the edge bundle; the
// RBAC modules are edge-safe (no Node/Prisma value imports).

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as UserRole | undefined;
    const { pathname } = req.nextUrl;

    const required = permissionForPath(pathname);
    if (required && !hasPermission(role, required)) {
      const landing = defaultLandingPath(role);
      // Hindari loop redirect bila tujuan sama dengan path saat ini.
      if (landing === pathname) {
        return NextResponse.next();
      }
      const url = req.nextUrl.clone();
      url.pathname = landing;
      url.search = "";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        // token ada → user sudah login
        return !!token;
      },
    },
    pages: {
      signIn: "/signin",
    },
  }
);

// Lindungi semua route KECUALI:
// - /signin
// - /reset-password/** (link reset sekali pakai, dipakai saat belum login)
// - /privacy, /terms (halaman legal publik, ditaut dari halaman signin)
// - /api/auth/** (internal next-auth + endpoint captcha)
// - static files (_next, favicon, public assets)
export const config = {
  matcher: [
    "/((?!signin|reset-password|privacy|terms|api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
