/**
 * Seed de la base de datos.
 * 1. Crea (o actualiza) los usuarios iniciales.
 *    Login = username (minúsculas sin acento). Contraseña = el nombre.
 *    Máximo es el administrador; el resto, empleados.
 * 2. Importa el catálogo real de MAFERSA desde data/products.json
 *    (3.536 productos, sin precios, con stock inicial en 0).
 *
 * Ejecutar con: npm run db:seed
 */
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

const USERS: { username: string; name: string; password: string; role: Role }[] = [
  { username: "sandra", name: "Sandra", password: "Sandra", role: Role.EMPLOYEE },
  { username: "alejandra", name: "Alejandra", password: "Alejandra", role: Role.EMPLOYEE },
  { username: "german", name: "Germán", password: "Germán", role: Role.EMPLOYEE },
  { username: "julio", name: "Julio", password: "Julio", role: Role.EMPLOYEE },
  { username: "maximo", name: "Máximo", password: "Máximo", role: Role.ADMIN },
];

type SeedProduct = {
  brand: string | null;
  internalCode: string | null;
  factoryCode: string | null;
  name: string;
  quantity: number;
};

async function seedUsers() {
  for (const u of USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { username: u.username },
      update: { name: u.name, role: u.role },
      create: { username: u.username, name: u.name, role: u.role, passwordHash },
    });
  }
  console.log(`✓ Usuarios listos: ${USERS.map((u) => u.username).join(", ")}`);
}

async function seedProducts() {
  const path = join(process.cwd(), "data", "products.json");
  const products = JSON.parse(readFileSync(path, "utf-8")) as SeedProduct[];

  let created = 0;
  let skipped = 0;

  for (const p of products) {
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
  await seedUsers();
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
