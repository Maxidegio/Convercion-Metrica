import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Middleware edge-safe: usa solo la config base (sin Prisma/bcrypt).
// El callback `authorized` redirige a /login si no hay sesión.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
