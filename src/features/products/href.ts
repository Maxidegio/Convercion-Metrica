export type ListParams = {
  q?: string;
  brand?: string;
  sort?: string;
  stock?: string;
  page?: number;
};

/** Construye una URL de /productos preservando los filtros actuales. */
export function productsHref(base: ListParams, overrides: Partial<ListParams> = {}): string {
  const m = { ...base, ...overrides };
  const p = new URLSearchParams();
  if (m.q) p.set("q", m.q);
  if (m.brand) p.set("brand", m.brand);
  if (m.sort && m.sort !== "brand") p.set("sort", m.sort);
  if (m.stock && m.stock !== "all") p.set("stock", m.stock);
  if (m.page && m.page > 1) p.set("page", String(m.page));
  const qs = p.toString();
  return `/productos${qs ? `?${qs}` : ""}`;
}
