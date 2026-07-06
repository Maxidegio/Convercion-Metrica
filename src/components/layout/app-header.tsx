import Link from "next/link";
import { LogOut, Users, Package } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { auth } from "@/lib/auth";
import { logout } from "@/features/auth/actions";

export async function AppHeader() {
  const session = await auth();
  const user = session?.user;
  const initial = user?.name?.charAt(0).toUpperCase() ?? "?";
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b-[3px] border-gold bg-navy-800 px-5 py-3">
      <Link href="/productos">
        <Logo />
      </Link>

      <nav className="ml-2 hidden items-center gap-1 sm:flex">
        <Link
          href="/productos"
          className="flex items-center gap-1.5 rounded-control px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5"
        >
          <Package size={15} />
          Productos
        </Link>
        {isAdmin && (
          <Link
            href="/usuarios"
            className="flex items-center gap-1.5 rounded-control px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5"
          >
            <Users size={15} />
            Usuarios
          </Link>
        )}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gold text-sm font-black text-[#0B0D12]">
            {initial}
          </span>
          <span className="hidden sm:inline">{user?.name}</span>
        </span>
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-control border border-white/15 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-gold hover:text-white"
          >
            <LogOut size={15} />
            Salir
          </button>
        </form>
      </div>
    </header>
  );
}
