import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageCount,
  q,
  brand,
}: {
  page: number;
  pageCount: number;
  q?: string;
  brand?: string;
}) {
  if (pageCount <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (brand) params.set("brand", brand);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/productos${qs ? `?${qs}` : ""}`;
  };

  const base =
    "flex items-center gap-1 rounded-control border border-border px-3 py-2 text-sm font-semibold transition";

  return (
    <div className="flex items-center justify-between px-1 py-4">
      <span className="text-sm text-muted">
        Página <b className="text-ink">{page}</b> de {pageCount}
      </span>
      <div className="flex gap-2">
        <Link
          href={href(page - 1)}
          aria-disabled={page <= 1}
          className={cn(
            base,
            page <= 1
              ? "pointer-events-none opacity-40"
              : "text-ink hover:border-gold",
          )}
        >
          <ChevronLeft size={16} /> Anterior
        </Link>
        <Link
          href={href(page + 1)}
          aria-disabled={page >= pageCount}
          className={cn(
            base,
            page >= pageCount
              ? "pointer-events-none opacity-40"
              : "text-ink hover:border-gold",
          )}
        >
          Siguiente <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
