import { Logo } from "@/components/ui/logo";
import { StepperDemo } from "@/components/stepper-demo";
import { Check } from "lucide-react";

/**
 * Página de estado de la FASE 2.
 * Verifica que el stack (Next + Tailwind + tokens MAFERSA + componentes)
 * está montado. Se reemplaza por el login/dashboard en las próximas fases.
 */
const done = [
  "Next.js 15 (App Router) + React 19 + TypeScript estricto",
  "TailwindCSS con el sistema de diseño MAFERSA (navy + dorado)",
  "Prisma + PostgreSQL — 3 tablas + tablas de Auth.js",
  "Seed que importa el catálogo real (data/products.json)",
  "Componente QuantityStepper (design system)",
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-8 px-6 py-16">
      <Logo />

      <div className="w-full rounded-card border border-border bg-card p-8 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted">
          Control de Stock
        </p>
        <h1 className="mt-2 text-2xl font-black text-ink">FASE 2 · Proyecto configurado</h1>
        <p className="mt-1 text-sm text-muted">
          El esqueleto técnico está montado. Próxima fase: autenticación.
        </p>

        <ul className="mt-6 flex flex-col gap-2.5">
          {done.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
              <span className="mt-0.5 grid h-4 w-4 flex-none place-items-center rounded-full bg-ok/15 text-ok">
                <Check size={11} strokeWidth={3.5} />
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-control border border-border bg-surface p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
            Control de stock (demo)
          </p>
          <StepperDemo />
        </div>
      </div>
    </main>
  );
}
