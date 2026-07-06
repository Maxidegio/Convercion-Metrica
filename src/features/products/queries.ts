import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const PAGE_SIZE = 50;
export const LOW_STOCK = 5;

export type SortOption = "brand" | "name" | "stock_asc" | "stock_desc";
export type StockStatus = "all" | "low" | "out";

export type ProductFilters = {
  q?: string;
  brand?: string;
  page?: number;
  sort?: SortOption;
  stock?: StockStatus;
};

/** WHERE base (marca + búsqueda). No incluye el filtro de estado de stock. */
function buildWhere({ q, brand }: ProductFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};
  if (brand) where.brand = brand;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { internalCode: { contains: q, mode: "insensitive" } },
      { factoryCode: { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
    ];
  }
  return where;
}

/** Agrega el filtro por estado de stock al WHERE base. */
function applyStockStatus(
  where: Prisma.ProductWhereInput,
  stock: StockStatus | undefined,
): Prisma.ProductWhereInput {
  if (stock === "low") return { ...where, quantity: { gt: 0, lte: LOW_STOCK } };
  if (stock === "out") return { ...where, quantity: { lte: 0 } };
  return where;
}

const ORDER_BY: Record<SortOption, Prisma.ProductOrderByWithRelationInput[]> = {
  brand: [{ brand: "asc" }, { name: "asc" }],
  name: [{ name: "asc" }],
  stock_asc: [{ quantity: "asc" }, { name: "asc" }],
  stock_desc: [{ quantity: "desc" }, { name: "asc" }],
};

/** Página de productos según orden y filtros. */
export async function getProducts(filters: ProductFilters) {
  const sort: SortOption = filters.sort ?? "brand";
  const where = applyStockStatus(buildWhere(filters), filters.stock);
  const page = Math.max(1, filters.page ?? 1);

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: ORDER_BY[sort],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    // Solo se agrupa visualmente por marca cuando ese es el orden y no hay
    // una marca ya filtrada.
    grouped: sort === "brand" && !filters.brand,
  };
}

/** Indicadores del conjunto (marca + búsqueda), independientes del filtro de estado. */
export async function getStockSummary(filters: ProductFilters) {
  const where = buildWhere(filters);
  const [total, units, low, out] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.aggregate({ where, _sum: { quantity: true } }),
    prisma.product.count({ where: { ...where, quantity: { gt: 0, lte: LOW_STOCK } } }),
    prisma.product.count({ where: { ...where, quantity: { lte: 0 } } }),
  ]);
  return {
    total,
    units: units._sum.quantity ?? 0,
    low,
    out,
  };
}

/** Producto con su historial de cambios de cantidad (línea de tiempo). */
export async function getProductWithHistory(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return null;

  const history = await prisma.quantityChange.findMany({
    where: { productId: id },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { name: true } } },
  });

  return { product, history };
}

/** Marcas con su cantidad de productos (para el filtro lateral). */
export async function getBrandsWithCounts() {
  const rows = await prisma.product.groupBy({
    by: ["brand"],
    _count: { _all: true },
    orderBy: { brand: "asc" },
  });
  return rows
    .filter((r) => r.brand)
    .map((r) => ({ brand: r.brand as string, count: r._count._all }));
}
