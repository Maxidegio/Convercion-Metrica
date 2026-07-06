import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, Users, ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
          Control de Stock
        </p>
        <h1 className="mt-1 text-3xl font-black text-ink">Hola, {user?.name}</h1>
        <p className="mt-1 text-sm text-muted">
          {isAdmin ? "Administrador" : "Empleado"} · sesión iniciada
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/"
            className="group rounded-card border border-border bg-card p-6 shadow-card transition hover:border-gold"
          >
            <span className="grid h-11 w-11 place-items-center rounded-control bg-gold/15 text-gold-600">
              <Package size={22} />
            </span>
            <h2 className="mt-4 flex items-center gap-1 text-lg font-extrabold text-ink">
              Productos
              <ArrowRight
                size={17}
                className="opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </h2>
            <p className="mt-1 text-sm text-muted">
              Ver el catálogo y ajustar el stock. (Próxima fase)
            </p>
          </Link>

          {isAdmin && (
            <Link
              href="/usuarios"
              className="group rounded-card border border-border bg-card p-6 shadow-card transition hover:border-gold"
            >
              <span className="grid h-11 w-11 place-items-center rounded-control bg-gold/15 text-gold-600">
                <Users size={22} />
              </span>
              <h2 className="mt-4 flex items-center gap-1 text-lg font-extrabold text-ink">
                Usuarios
                <ArrowRight
                  size={17}
                  className="opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </h2>
              <p className="mt-1 text-sm text-muted">
                Crear, editar y dar de baja empleados.
              </p>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
