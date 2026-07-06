import { cn, stockLevel } from "@/lib/utils";

export function BrandPill({ brand }: { brand: string | null }) {
  if (!brand) return <span className="text-xs text-muted">—</span>;
  return (
    <span className="inline-flex items-center rounded-chip bg-[#0B0D12] px-2 py-1 text-[0.68rem] font-extrabold tracking-wide text-gold">
      {brand}
    </span>
  );
}

export function CodeChip({
  value,
  variant = "maf",
}: {
  value: string | null;
  variant?: "maf" | "fab";
}) {
  if (!value) return <span className="text-xs text-muted">—</span>;
  return (
    <span
      className={cn(
        "inline-block rounded-chip px-2 py-1 font-mono text-xs font-bold",
        variant === "maf"
          ? "bg-chip text-ink"
          : "bg-brandblue-50 text-brandblue-600",
      )}
    >
      {value}
    </span>
  );
}

export function StockBadge({ quantity, low = 5 }: { quantity: number; low?: number }) {
  const level = stockLevel(quantity, low);
  const styles =
    level === "bad"
      ? "bg-bad/12 text-bad"
      : level === "warn"
        ? "bg-warn/15 text-warn"
        : "bg-ok/12 text-ok";
  return (
    <span
      className={cn(
        "inline-flex min-w-[2.5rem] justify-center rounded-chip px-2.5 py-1 text-sm font-extrabold tabular-nums",
        styles,
      )}
      title={level === "bad" ? "Agotado" : level === "warn" ? "Stock bajo" : "En stock"}
    >
      {quantity}
    </span>
  );
}
