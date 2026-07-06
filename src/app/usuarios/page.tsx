import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UsersManager } from "@/features/users/components/users-manager";

export default async function UsuariosPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      lastLoginAt: true,
    },
  });

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">Administración</p>
        <h1 className="mt-1 text-2xl font-black text-ink">Usuarios</h1>
        <p className="mt-1 text-sm text-muted">
          Gestioná los empleados que pueden acceder al sistema.
        </p>

        <UsersManager users={users} currentUserId={session.user.id} />
      </main>
    </div>
  );
}
