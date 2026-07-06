import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getProducts,
  getStockSummary,
  getBrandsWithCounts,
  type SortOption,
  type StockStatus,
} from "@/features/products/queries";
import type { ListParams } from "@/features/products/href";
import { BrandFilter } from "@/features/products/components/brand-filter";
import { ProductToolbar } from "@/features/products/components/product-toolbar";
import { ProductTable } from "@/features/products/components/product-table";
import { Pagination } from "@/features/products/components/pagination";
import { StockSummary } from "@/features/products/components/stock-summary";
import { ProductCreateButton } from "@/features/products/components/product-create-button";

type SearchParams = {
  q?: string;
  brand?: string;
  page?: string;
  sort?: string;
  stock?: string;
};

const SORTS = new Set<SortOption>(["brand", "name", "stock_asc", "stock_desc"]);
const STOCKS = new Set<StockStatus>(["all", "low", "out"]);

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const brand = sp.brand || undefined;
  const page = sp.page ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;
  const sort = (sp.sort && SORTS.has(sp.sort as SortOption) ? sp.sort : "brand") as SortOption;
  const stock = (sp.stock && STOCKS.has(sp.stock as StockStatus) ? sp.stock : "all") as StockStatus;

  const filters = { q, brand, page, sort, stock };
  const base: ListParams = { q, brand, sort, stock };

  const [list, summary, brands, globalTotal] = await Promise.all([
    getProducts(filters),
    getStockSummary(filters),
    getBrandsWithCounts(),
    prisma.product.count(),
  ]);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
              Control de Stock
            </p>
            <h1 className="mt-1 text-2xl font-black text-ink">Productos</h1>
          </div>
          <ProductCreateButton />
        </div>

        <StockSummary summary={summary} base={base} />

        <div className="mt-6 flex flex-col gap-5 lg:flex-row">
          <aside className="lg:w-56 lg:flex-none">
            <BrandFilter brands={brands} base={base} totalProducts={globalTotal} />
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-4">
              <ProductToolbar total={list.total} />
            </div>

            <div className="overflow-hidden rounded-card border border-border bg-card shadow-card">
              <ProductTable items={list.items} grouped={list.grouped} />
            </div>

            <Pagination page={list.page} pageCount={list.pageCount} base={base} />
          </div>
        </div>
      </main>
    </div>
  );
}
