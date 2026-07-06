"use client";

import { useRef, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STOCK_TABS: { value: string; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "low", label: "Stock bajo" },
  { value: "out", label: "Agotados" },
];

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "brand", label: "Marca" },
  { value: "name", label: "Descripción (A–Z)" },
  { value: "stock_desc", label: "Stock (mayor a menor)" },
  { value: "stock_asc", label: "Stock (menor a mayor)" },
];

export function ProductToolbar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeStock = params.get("stock") ?? "all";
  const activeSort = params.get("sort") ?? "brand";

  const commit = (mut: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mut(next);
    next.delete("page");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`));
  };

  const onSearch = (value: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      commit((p) => (value ? p.set("q", value) : p.delete("q")));
    }, 300);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Buscador */}
        <div className="relative min-w-[16rem] flex-1">
          {pending ? (
            <Loader2
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 animate-spin text-gold-600"
            />
          ) : (
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
          )}
          <input
            defaultValue={params.get("q") ?? ""}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar por código, descripción o marca…"
            className="w-full rounded-control border-[1.5px] border-border bg-card py-2.5 pl-11 pr-4 text-sm text-ink outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/20"
          />
        </div>

        {/* Orden */}
        <select
          value={activeSort}
          onChange={(e) => commit((p) => (e.target.value === "brand" ? p.delete("sort") : p.set("sort", e.target.value)))}
          className="rounded-control border-[1.5px] border-border bg-card px-3 py-2.5 text-sm font-semibold text-ink outline-none transition focus:border-gold"
          aria-label="Ordenar por"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              Orden: {o.label}
            </option>
          ))}
        </select>

        <span className="hidden whitespace-nowrap rounded-control border border-border bg-card px-3 py-2.5 text-sm font-bold text-ink sm:block">
          <span className="text-gold-600">{total.toLocaleString("es-AR")}</span> productos
        </span>
      </div>

      {/* Filtros rápidos de stock */}
      <div className="flex gap-1.5">
        {STOCK_TABS.map((t) => {
          const active = activeStock === t.value;
          return (
            <button
              key={t.value}
              onClick={() => commit((p) => (t.value === "all" ? p.delete("stock") : p.set("stock", t.value)))}
              className={cn(
                "rounded-control px-3 py-1.5 text-sm font-semibold transition",
                active
                  ? "bg-navy-800 text-white"
                  : "border border-border bg-card text-muted hover:text-ink",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
