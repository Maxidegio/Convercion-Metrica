import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { auth } from "@/lib/auth";
import { getProductWithHistory } from "@/features/products/queries";
import { BrandPill, CodeChip } from "@/components/ui/badges";
import { HistoryTimeline } from "@/features/products/components/history-timeline";
import { DetailStepper } from "@/features/products/components/detail-stepper";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const data = await getProductWithHistory(id);
  if (!data) notFound();
  const { product, history } = data;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-5 py-8">
        <Link
          href="/productos"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-ink"
        >
          <ArrowLeft size={16} />
          Volver a productos
        </Link>

        {/* Ficha del producto */}
        <div className="mt-4 rounded-card border border-border bg-card p-6 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <BrandPill brand={product.brand} />
              <h1 className="mt-2 text-xl font-black text-ink">{product.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  CÓD.MAF
                </span>
                <CodeChip value={product.internalCode} variant="maf" />
                <span className="ml-2 text-xs font-bold uppercase tracking-wider text-muted">
                  CÓD.FÁBRICA
                </span>
                <CodeChip value={product.factoryCode} variant="fab" />
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Stock</span>
              <DetailStepper productId={product.id} initial={product.quantity} />
            </div>
          </div>
        </div>

        {/* Historial */}
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-muted">
            Historial de movimientos
          </h2>
          <div className="rounded-card border border-border bg-card p-5 shadow-card">
            <HistoryTimeline history={history} />
          </div>
        </div>
      </main>
    </div>
  );
}
