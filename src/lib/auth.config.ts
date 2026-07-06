import type { Role } from "@prisma/client";
import type { NextAuthConfig } from "next-auth";

/**
 * Configuración base de Auth.js, segura para el runtime "edge" del middleware
 * (sin Prisma ni bcrypt). El proveedor de credenciales se agrega en auth.ts.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    /** Protege todas las rutas salvo el login. */
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = request.nextUrl.pathname.startsWith("/login");
      if (isOnLogin) return true;
      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        const u = user as { username: string; role: Role };
        token.username = u.username;
        token.role = u.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.username = token.username as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
