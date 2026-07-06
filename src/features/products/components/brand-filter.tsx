import Link from "next/link";
import { cn } from "@/lib/utils";
import { productsHref, type ListParams } from "@/features/products/href";

type BrandCount = { brand: string; count: number };

/** Panel lateral de marcas. Conserva búsqueda, orden y filtro de stock. */
export function BrandFilter({
  brands,
  base,
  totalProducts,
}: {
  brands: BrandCount[];
  base: ListParams;
  totalProducts: number;
}) {
  const item = (label: string, count: number, brand?: string) => {
    const active = brand ? base.brand === brand : !base.brand;
    return (
      <Link
        key={label}
        href={productsHref(base, { brand, page: undefined })}
        className={cn(
          "flex items-center justify-between rounded-[11px] px-3 py-2 text-sm font-semibold transition",
          active ? "bg-gold text-[#0B0D12]" : "text-ink hover:bg-surface",
        )}
      >
        <span className="truncate">{label}</span>
        <span className={cn("text-xs font-bold", active ? "text-[#0B0D12]" : "text-muted")}>
          {count}
        </span>
      </Link>
    );
  };

  return (
    <div className="rounded-card border border-border bg-card p-2 shadow-card">
      <h3 className="px-3 py-2.5 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
        Marcas
      </h3>
      <div className="flex max-h-[70vh] flex-col gap-0.5 overflow-y-auto">
        {item("Todas", totalProducts)}
        {brands.map((b) => item(b.brand, b.count, b.brand))}
      </div>
    </div>
  );
}
