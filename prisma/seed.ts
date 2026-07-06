/**
 * Seed de la base de datos.
 * 1. Crea (o actualiza) un usuario administrador inicial.
 * 2. Importa el catálogo real de MAFERSA desde data/products.json
 *    (3.536 productos, sin precios, con stock inicial en 0).
 *
 * Ejecutar con: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

type SeedProduct = {
  brand: string | null;
  internalCode: string | null;
  factoryCode: string | null;
  name: string;
  quantity: number;
};

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@mafersa";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "mafersa2026";
  const name = process.env.SEED_ADMIN_NAME ?? "Administrador";

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, passwordHash },
  });
  console.log(`✓ Usuario admin listo: ${email}`);
}

async function seedProducts() {
  const path = join(process.cwd(), "data", "products.json");
  const products = JSON.parse(readFileSync(path, "utf-8")) as SeedProduct[];

  let created = 0;
  let skipped = 0;

  for (const p of products) {
    // El código interno es la clave de negocio. Si falta, se inserta igual
    // (producto sin código interno), pero no se puede deduplicar por él.
    if (p.internalCode) {
      const existing = await prisma.product.findUnique({
        where: { internalCode: p.internalCode },
      });
      if (existing) {
        skipped++;
        continue;
      }
    }
    await prisma.product.create({
      data: {
        internalCode: p.internalCode,
        factoryCode: p.factoryCode,
        brand: p.brand,
        name: p.name,
        quantity: p.quantity ?? 0,
      },
    });
    created++;
  }
  console.log(`✓ Catálogo importado: ${created} creados, ${skipped} ya existían`);
}

async function main() {
  console.log("Sembrando base de datos MAFERSA…");
  await seedAdmin();
  await seedProducts();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
