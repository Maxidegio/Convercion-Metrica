import Link from "next/link";
import { cn } from "@/lib/utils";
import { LOW_STOCK } from "@/features/products/queries";
import { productsHref, type ListParams } from "@/features/products/href";

type Summary = { total: number; units: number; low: number; out: number };

export function StockSummary({ summary, base }: { summary: Summary; base: ListParams }) {
  const cards: {
    label: string;
    value: number;
    tone?: "gold" | "warn" | "bad";
    stock?: "low" | "out";
  }[] = [
    { label: "Productos", value: summary.total },
    { label: "Unidades en stock", value: summary.units, tone: "gold" },
    { label: `Stock bajo (≤${LOW_STOCK})`, value: summary.low, tone: "warn", stock: "low" },
    { label: "Agotados", value: summary.out, tone: "bad", stock: "out" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => {
        const active = c.stock && base.stock === c.stock;
        const inner = (
          <>
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-muted">{c.label}</p>
            <p
              className={cn(
                "mt-1 text-2xl font-black tabular-nums",
                c.tone === "gold" && "text-gold-600",
                c.tone === "warn" && "text-warn",
                c.tone === "bad" && "text-bad",
                !c.tone && "text-ink",
              )}
            >
              {c.value.toLocaleString("es-AR")}
            </p>
          </>
        );
        const cls = cn(
          "rounded-card border bg-card p-4 shadow-card transition",
          active ? "border-gold ring-2 ring-gold/30" : "border-border",
          c.stock && "hover:border-gold",
        );
        return c.stock ? (
          <Link
            key={c.label}
            href={productsHref(base, { stock: active ? "all" : c.stock, page: undefined })}
            className={cls}
          >
            {inner}
          </Link>
        ) : (
          <div key={c.label} className={cls}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
