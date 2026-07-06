import { Fragment } from "react";
import Link from "next/link";
import type { Product } from "@prisma/client";
import { BrandPill, CodeChip } from "@/components/ui/badges";
import { ProductRowActions } from "./product-row-actions";
import { ProductStepperCell } from "./product-stepper-cell";

/**
 * Tabla de productos. Cuando no hay una marca filtrada, agrupa por marca
 * insertando un encabezado de grupo cada vez que cambia (la lista viene
 * ordenada por marca).
 */
export function ProductTable({ items, grouped }: { items: Product[]; grouped: boolean }) {
  if (items.length === 0) {
    return (
      <div className="grid place-items-center px-6 py-16 text-center">
        <p className="text-sm font-semibold text-ink">Sin resultados</p>
        <p className="mt-1 text-sm text-muted">Probá con otro término o marca.</p>
      </div>
    );
  }

  let lastBrand: string | null | undefined = undefined;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-surface">
            {["Marca", "CÓD.MAF", "CÓD.FÁBRICA", "Descripción", "Stock", ""].map((h, i) => (
              <th
                key={h || i}
                className={
                  "border-b border-border px-4 py-3 text-[0.68rem] font-extrabold uppercase tracking-wider text-muted " +
                  (h === "Stock" || h === "" ? "text-right" : "text-left")
                }
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((p) => {
            const showGroup = grouped && p.brand !== lastBrand;
            lastBrand = p.brand;
            return (
              <Fragment key={p.id}>
                {showGroup && (
                  <tr>
                    <td
                      colSpan={6}
                      className="bg-navy-900/[0.03] px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-muted"
                    >
                      {p.brand ?? "Sin marca"}
                    </td>
                  </tr>
                )}
                <tr className="border-b border-border transition hover:bg-gold-50 last:border-0">
                  <td className="px-4 py-2.5">
                    <BrandPill brand={p.brand} />
                  </td>
                  <td className="px-4 py-2.5">
                    <CodeChip value={p.internalCode} variant="maf" />
                  </td>
                  <td className="px-4 py-2.5">
                    <CodeChip value={p.factoryCode} variant="fab" />
                  </td>
                  <td className="px-4 py-2.5 text-sm font-semibold text-ink">
                    <Link
                      href={`/productos/${p.id}`}
                      className="transition hover:text-gold-600 hover:underline"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <ProductStepperCell productId={p.id} initial={p.quantity} />
                  </td>
                  <td className="px-4 py-2.5">
                    <ProductRowActions product={p} />
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
