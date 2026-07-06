import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { productsHref, type ListParams } from "@/features/products/href";

export function Pagination({
  page,
  pageCount,
  base,
}: {
  page: number;
  pageCount: number;
  base: ListParams;
}) {
  if (pageCount <= 1) return null;

  const base2 =
    "flex items-center gap-1 rounded-control border border-border px-3 py-2 text-sm font-semibold transition";

  return (
    <div className="flex items-center justify-between px-1 py-4">
      <span className="text-sm text-muted">
        Página <b className="text-ink">{page}</b> de {pageCount}
      </span>
      <div className="flex gap-2">
        <Link
          href={productsHref(base, { page: page - 1 })}
          aria-disabled={page <= 1}
          className={cn(base2, page <= 1 ? "pointer-events-none opacity-40" : "text-ink hover:border-gold")}
        >
          <ChevronLeft size={16} /> Anterior
        </Link>
        <Link
          href={productsHref(base, { page: page + 1 })}
          aria-disabled={page >= pageCount}
          className={cn(base2, page >= pageCount ? "pointer-events-none opacity-40" : "text-ink hover:border-gold")}
        >
          Siguiente <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
