import { cn } from "@/lib/utils";
import { LOW_STOCK } from "@/features/products/queries";

type Summary = { total: number; units: number; low: number; out: number };

export function StockSummary({ summary }: { summary: Summary }) {
  const cards: { label: string; value: number; tone?: "gold" | "warn" | "bad" }[] = [
    { label: "Productos", value: summary.total },
    { label: "Unidades en stock", value: summary.units, tone: "gold" },
    { label: `Stock bajo (≤${LOW_STOCK})`, value: summary.low, tone: "warn" },
    { label: "Agotados", value: summary.out, tone: "bad" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-card border border-border bg-card p-4 shadow-card">
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
        </div>
      ))}
    </div>
  );
}
