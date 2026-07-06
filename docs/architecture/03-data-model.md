# 03 · Modelo de datos

Este documento diseña **todas las tablas** del sistema, sus relaciones, claves
foráneas, índices y el criterio de normalización. Es el corazón de la
arquitectura: un modelo de datos bien pensado evita rediseños dolorosos años
después.

> El diagrama entidad-relación visual está en
> [`04-er-diagram.md`](04-er-diagram.md).

## 3.1 Decisiones estructurales clave

Antes de las tablas, tres decisiones que explican por qué el modelo tiene esta
forma:

### A) El stock vive **por ubicación**, no como un número suelto en el producto

Inspirado en SAP WM / Odoo. Un producto puede estar en varias ubicaciones
físicas (estante A1, depósito 2…). El nivel autoritativo de stock se guarda en
`stock_levels (producto × ubicación)`. El campo "cantidad actual" que el
enunciado pide en el producto existe como **agregado cacheado** (`Product.quantityOnHand`),
recalculado por el servicio de stock en cada movimiento — rápido de leer,
siempre derivable del ledger.

### B) Los movimientos son un **libro mayor inmutable**

La tabla `stock_movements` es *append-only*: nunca se hace UPDATE ni DELETE.
Corregir = registrar un movimiento de ajuste. Cada fila guarda `stockBefore` y
`stockAfter` para trazabilidad total. Esta es la fuente de verdad; los niveles
son la proyección optimizada para lectura.

### C) RBAC granular (roles + permisos), no un simple enum

Para "crecer durante años" separamos **rol** de **permiso**. Los tres roles del
enunciado (Administrador, Supervisor, Empleado) se modelan como filas en `roles`
con un conjunto de `permissions` asociados. Añadir un rol nuevo o ajustar qué
puede hacer cada uno es dato, no código. Detalle en `06-security-rbac.md`.

## 3.2 Convenciones

- **PK:** `id` tipo `cuid`/`uuid` (string) — evita colisiones y no filtra
  volumen de negocio como haría un autoincremental.
- **Timestamps:** `createdAt`, `updatedAt` en toda entidad mutable.
- **Borrado:** *soft-delete* (`deletedAt` / `status`) en catálogos; **nunca**
  borrado físico en movimientos ni auditoría.
- **Nombres:** tablas en `snake_case` plural; modelos Prisma en `PascalCase`.
- **Dinero y cantidades:** `Decimal` (no `Float`) para evitar errores de coma
  flotante en costos, precios y cantidades fraccionables.

---

## 3.3 Catálogo de tablas

A continuación, cada tabla con su propósito, columnas principales, relaciones e
índices. Al final se incluye el esquema Prisma propuesto completo.

### Módulo: Identidad y accesos

#### `users` — Usuarios (empleados)
Personas que acceden al sistema.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | string PK | |
| email | string **unique** | login |
| passwordHash | string | bcrypt/argon2, nunca texto plano |
| name | string | |
| roleId | FK → roles | rol asignado |
| status | enum(ACTIVE, SUSPENDED, INACTIVE) | control de acceso |
| lastLoginAt | datetime? | **registro de último acceso** |
| createdAt / updatedAt | datetime | |

- **FK:** `roleId → roles.id`.
- **Índices:** `email` (unique), `roleId`, `status`.

#### `roles` — Roles
Administrador, Supervisor, Empleado (y futuros).

| Campo | Tipo | Notas |
|-------|------|-------|
| id | string PK | |
| name | string unique | ej. "ADMIN" |
| label | string | ej. "Administrador" |
| description | string? | |

- Relación **N:M** con `permissions` vía `role_permissions`.

#### `permissions` — Permisos granulares
Cada capacidad del sistema, ej. `product:create`, `movement:read`,
`report:export`, `user:manage`.

| Campo | Tipo |
|-------|------|
| id | string PK |
| code | string unique |
| description | string? |

#### `role_permissions` — Unión Rol ↔ Permiso (N:M)
| Campo | Tipo |
|-------|------|
| roleId | FK → roles |
| permissionId | FK → permissions |

- **PK compuesta** `(roleId, permissionId)`. FKs `ON DELETE CASCADE`.

#### `accounts`, `sessions`, `verification_tokens`
Tablas estándar del **adapter de Auth.js** (necesarias si se usa sesión en BD o
proveedores OAuth futuros). Se incluyen para compatibilidad y crecimiento.

#### `password_reset_tokens` — Recuperación de contraseña
| Campo | Tipo | Notas |
|-------|------|-------|
| id | string PK | |
| userId | FK → users | |
| tokenHash | string unique | token de un solo uso, hasheado |
| expiresAt | datetime | expiración corta |
| usedAt | datetime? | invalida reuso |

- **Índices:** `userId`, `tokenHash` (unique), `expiresAt`.

#### `audit_logs` — Auditoría de acciones sensibles
Quién hizo qué y cuándo, a nivel aplicación (login, cambios de usuario/rol,
exportaciones, ajustes). Complementa al ledger de movimientos.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | string PK | |
| userId | FK → users? | actor (nullable para eventos del sistema) |
| action | string | ej. `USER_LOGIN`, `PRODUCT_UPDATE` |
| entityType | string? | ej. `Product` |
| entityId | string? | |
| metadata | Json? | snapshot / diff antes-después |
| ipAddress | string? | |
| createdAt | datetime | |

- **Nunca se borra.** Índices: `userId`, `action`, `entityType,entityId`, `createdAt`.

---

### Módulo: Catálogo

#### `products` — Productos
Entidad central del catálogo. Contiene todos los atributos del enunciado.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | string PK | |
| internalCode | string **unique** | Código interno |
| sku | string **unique** | SKU |
| barcode | string? unique | Código de barras |
| name | string | |
| description | string? | |
| categoryId | FK → categories? | Categoría / subcategoría (jerárquica) |
| brandId | FK → brands? | Marca |
| supplierId | FK → suppliers? | Proveedor principal |
| unitId | FK → units | Unidad de medida |
| weight | Decimal? | Peso |
| primaryLocationId | FK → locations? | Ubicación física principal |
| quantityOnHand | Decimal | **agregado cacheado** del stock total |
| quantityReserved | Decimal | agregado de stock reservado |
| minStock | Decimal | Stock mínimo |
| maxStock | Decimal? | Stock máximo |
| cost | Decimal | Costo |
| price | Decimal | Precio |
| imageUrl | string? | imagen principal (ver `product_images`) |
| status | enum(ACTIVE, INACTIVE, DISCONTINUED) | Estado |
| createdAt / updatedAt | datetime | Fecha creación / última modificación |
| deletedAt | datetime? | soft-delete |

- **FKs:** categoryId, brandId, supplierId, unitId, primaryLocationId.
- **Índices:** `sku` (unique), `internalCode` (unique), `barcode` (unique),
  `categoryId`, `brandId`, `supplierId`, `status`, y un índice **GIN
  (`pg_trgm`)** sobre `name` para el buscador instantáneo.

#### `categories` — Categorías y subcategorías (jerárquica)
Se resuelve "Categoría" + "Subcategoría" con **auto-referencia** (adjacency
list): una categoría puede tener `parentId`. Soporta cualquier profundidad sin
duplicar tablas.

| Campo | Tipo |
|-------|------|
| id | string PK |
| name | string |
| parentId | FK → categories? (self) |
| createdAt / updatedAt | datetime |

- **Índice:** `parentId`. Unique `(parentId, name)` para evitar duplicados por nivel.

#### `brands` — Marcas
`id`, `name` (unique), timestamps.

#### `suppliers` — Proveedores
| Campo | Tipo |
|-------|------|
| id | string PK |
| name | string |
| contactEmail | string? |
| contactPhone | string? |
| taxId | string? |
| status | enum(ACTIVE, INACTIVE) |
| createdAt / updatedAt | datetime |

- Relación N:M opcional con productos vía `product_suppliers` (un producto puede
  tener varios proveedores; `supplierId` en `products` marca el principal).

#### `product_suppliers` — Producto ↔ Proveedor (N:M, para crecimiento)
`productId`, `supplierId`, `supplierSku?`, `lastCost?`, `isPreferred`.
PK compuesta `(productId, supplierId)`.

#### `units` — Unidades de medida
| Campo | Tipo | Notas |
|-------|------|-------|
| id | string PK | |
| code | string unique | ej. `UN`, `KG`, `LT`, `CAJA` |
| name | string | |
| allowsFraction | boolean | si admite decimales |

#### `product_images` — Imágenes de producto
Aunque el enunciado pide "Imagen" (una), se modela 1:N para permitir varias en
el futuro; una marcada como `isPrimary` alimenta `products.imageUrl`.

| Campo | Tipo |
|-------|------|
| id | string PK |
| productId | FK → products |
| url | string |
| isPrimary | boolean |
| createdAt | datetime |

- **Índice:** `productId`.

---

### Módulo: Almacenes y ubicaciones

#### `warehouses` — Almacenes / Depósitos
| Campo | Tipo |
|-------|------|
| id | string PK |
| code | string unique |
| name | string |
| address | string? |
| status | enum(ACTIVE, INACTIVE) |

#### `locations` — Ubicaciones físicas (bin / estante)
Ubicación fina dentro de un almacén (pasillo-estante-nivel). Es la "Ubicación
física" del producto llevada al detalle tipo WMS.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | string PK | |
| warehouseId | FK → warehouses | |
| code | string | ej. `A-01-03` |
| description | string? | |

- **Índice / unique:** `(warehouseId, code)`. Índice `warehouseId`.

---

### Módulo: Inventario y movimientos

#### `stock_levels` — Nivel de stock (Producto × Ubicación) ★ fuente autoritativa
Cuánto hay de cada producto en cada ubicación. Es la proyección de lectura del
ledger.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | string PK | |
| productId | FK → products | |
| locationId | FK → locations | |
| quantityOnHand | Decimal | stock físico |
| quantityReserved | Decimal | stock reservado |
| updatedAt | datetime | |

- **Unique:** `(productId, locationId)` — un único nivel por combinación.
- **Índices:** `productId`, `locationId`.
- **Derivados calculados por el servicio (no columnas):**
  `disponible = quantityOnHand − quantityReserved`.

#### `stock_movements` — Movimientos ★ ledger inmutable (append-only)
El registro que **nunca se elimina**. Cada operación de stock genera una fila.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | string PK | |
| type | enum(IN, OUT, TRANSFER, ADJUSTMENT) | Ingreso / Salida / Transferencia / Ajuste |
| productId | FK → products | Producto afectado |
| fromLocationId | FK → locations? | origen (OUT / TRANSFER) |
| toLocationId | FK → locations? | destino (IN / TRANSFER) |
| quantity | Decimal | Cantidad (siempre positiva) |
| stockBefore | Decimal | Stock anterior |
| stockAfter | Decimal | Stock nuevo |
| reasonId | FK → movement_reasons? | Motivo (catálogo) |
| note | string? | Observaciones |
| userId | FK → users | Usuario que lo hizo |
| referenceId | string? | agrupa las 2 patas de una transferencia |
| createdAt | datetime | Fecha y hora |

- **Reglas:** `IN` usa `toLocation`; `OUT` usa `fromLocation`; `TRANSFER` genera
  **dos filas** (OUT en origen + IN en destino) unidas por `referenceId`, dentro
  de una sola transacción; `ADJUSTMENT` puede subir o bajar y exige motivo.
- **Índices:** `productId,createdAt` (línea de tiempo por producto), `type`,
  `userId`, `createdAt`, `referenceId`.
- **Integridad:** sin `ON DELETE CASCADE` que borre historial; los productos se
  hacen soft-delete, jamás se elimina físicamente si tienen movimientos.

#### `movement_reasons` — Motivos de movimiento (catálogo)
Normaliza los "motivos" (compra, venta, merma, inventario físico, devolución…).

| Campo | Tipo |
|-------|------|
| id | string PK |
| code | string unique |
| label | string |
| appliesTo | enum(IN, OUT, TRANSFER, ADJUSTMENT, ANY) |

---

### Módulo: Alertas y notificaciones

#### `notifications` — Notificaciones / alertas
Se generan automáticamente (stock bajo, agotado, sin movimiento, errores).

| Campo | Tipo | Notas |
|-------|------|-------|
| id | string PK | |
| type | enum(LOW_STOCK, OUT_OF_STOCK, NO_MOVEMENT, ERROR, INFO) | |
| severity | enum(INFO, WARNING, CRITICAL) | |
| title | string | |
| message | string | |
| productId | FK → products? | producto relacionado (si aplica) |
| userId | FK → users? | destinatario (null = broadcast por rol) |
| readAt | datetime? | control de leído |
| createdAt | datetime | |

- **Índices:** `userId,readAt`, `type`, `createdAt`, `productId`.

#### `alert_rules` — Reglas de alerta (opcional, para crecimiento)
Permite configurar umbrales sin tocar código (ej. días sin movimiento que
disparan `NO_MOVEMENT`, o umbral relativo de stock bajo). Se puede diferir a una
fase posterior.

---

## 3.4 Normalización

- **3FN** en catálogos: marcas, proveedores, categorías, unidades y motivos son
  tablas propias referenciadas por FK — no se repiten cadenas de texto en
  `products`/`movements`.
- **Desnormalización controlada y justificada:** `products.quantityOnHand` /
  `quantityReserved` y `stock_movements.stockBefore/After` son datos derivados
  guardados a propósito para rendimiento y auditoría. La fuente de verdad sigue
  siendo el ledger; los agregados son reconstruibles.
- **Jerarquías** (categorías) vía auto-referencia en lugar de tablas separadas
  por nivel: flexible y normalizado.

## 3.5 Índices — resumen y motivo

| Tabla | Índice | Para qué |
|-------|--------|----------|
| users | email unique | login rápido y unicidad |
| products | sku / internalCode / barcode unique | identificación única |
| products | GIN trigram(name) | **buscador instantáneo** |
| products | categoryId, brandId, supplierId, status | **filtros** de la lista |
| stock_levels | unique(productId, locationId) | integridad y lectura por producto |
| stock_movements | (productId, createdAt) | **timeline** por producto |
| stock_movements | type, userId, createdAt | reportes y filtros |
| notifications | (userId, readAt) | badge de no leídas |
| audit_logs | (entityType, entityId), createdAt | trazabilidad |

## 3.6 Integridad y transacciones

- Toda operación que altere stock corre en **una transacción Prisma**: se
  inserta el/los movimiento(s) **y** se actualiza `stock_levels` y los agregados
  del producto de forma atómica. Si algo falla, no queda estado inconsistente.
- FKs con la política adecuada: `CASCADE` solo en tablas de unión (RBAC,
  product_suppliers); `RESTRICT`/soft-delete en entidades con historial.
- Constraints de dominio (ej. `quantity > 0`, no permitir `stockAfter < 0` salvo
  en `ADJUSTMENT`) se validan en el dominio y, donde aplique, con `CHECK` en BD.

## 3.7 Esquema Prisma propuesto (borrador de FASE 1)

> Borrador de diseño para revisión. La versión final, con validaciones y ajustes
> del proveedor de BD, se materializa en **FASE 2**.

```prisma
// ---------- Enums ----------
enum UserStatus      { ACTIVE SUSPENDED INACTIVE }
enum EntityStatus    { ACTIVE INACTIVE }
enum ProductStatus   { ACTIVE INACTIVE DISCONTINUED }
enum MovementType    { IN OUT TRANSFER ADJUSTMENT }
enum ReasonScope     { IN OUT TRANSFER ADJUSTMENT ANY }
enum NotificationType{ LOW_STOCK OUT_OF_STOCK NO_MOVEMENT ERROR INFO }
enum Severity        { INFO WARNING CRITICAL }

// ---------- Identidad ----------
model User {
  id           String     @id @default(cuid())
  email        String     @unique
  passwordHash String
  name         String
  role         Role       @relation(fields: [roleId], references: [id])
  roleId       String
  status       UserStatus @default(ACTIVE)
  lastLoginAt  DateTime?
  movements    StockMovement[]
  notifications Notification[]
  auditLogs    AuditLog[]
  resetTokens  PasswordResetToken[]
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  @@index([roleId])
  @@index([status])
}

model Role {
  id          String           @id @default(cuid())
  name        String           @unique
  label       String
  description String?
  users       User[]
  permissions RolePermission[]
}

model Permission {
  id          String           @id @default(cuid())
  code        String           @unique
  description String?
  roles       RolePermission[]
}

model RolePermission {
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  roleId       String
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  permissionId String
  @@id([roleId, permissionId])
}

model PasswordResetToken {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  tokenHash String   @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())
  @@index([userId])
  @@index([expiresAt])
}

model AuditLog {
  id         String   @id @default(cuid())
  user       User?    @relation(fields: [userId], references: [id])
  userId     String?
  action     String
  entityType String?
  entityId   String?
  metadata   Json?
  ipAddress  String?
  createdAt  DateTime @default(now())
  @@index([userId])
  @@index([action])
  @@index([entityType, entityId])
  @@index([createdAt])
}

// ---------- Catálogo ----------
model Product {
  id                String   @id @default(cuid())
  internalCode      String   @unique
  sku               String   @unique
  barcode           String?  @unique
  name              String
  description       String?
  category          Category? @relation(fields: [categoryId], references: [id])
  categoryId        String?
  brand             Brand?    @relation(fields: [brandId], references: [id])
  brandId           String?
  supplier          Supplier? @relation(fields: [supplierId], references: [id])
  supplierId        String?
  unit              Unit      @relation(fields: [unitId], references: [id])
  unitId            String
  weight            Decimal?  @db.Decimal(12, 3)
  primaryLocation   Location? @relation("ProductPrimaryLocation", fields: [primaryLocationId], references: [id])
  primaryLocationId String?
  quantityOnHand    Decimal   @default(0) @db.Decimal(14, 3)
  quantityReserved  Decimal   @default(0) @db.Decimal(14, 3)
  minStock          Decimal   @default(0) @db.Decimal(14, 3)
  maxStock          Decimal?  @db.Decimal(14, 3)
  cost              Decimal   @default(0) @db.Decimal(14, 2)
  price             Decimal   @default(0) @db.Decimal(14, 2)
  imageUrl          String?
  status            ProductStatus @default(ACTIVE)
  images            ProductImage[]
  stockLevels       StockLevel[]
  movements         StockMovement[]
  suppliers         ProductSupplier[]
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  deletedAt         DateTime?
  @@index([categoryId])
  @@index([brandId])
  @@index([supplierId])
  @@index([status])
}

model Category {
  id       String     @id @default(cuid())
  name     String
  parent   Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  parentId String?
  children Category[] @relation("CategoryTree")
  products Product[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  @@unique([parentId, name])
  @@index([parentId])
}

model Brand {
  id       String    @id @default(cuid())
  name     String    @unique
  products Product[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Supplier {
  id           String   @id @default(cuid())
  name         String
  contactEmail String?
  contactPhone String?
  taxId        String?
  status       EntityStatus @default(ACTIVE)
  products     Product[]
  productLinks ProductSupplier[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@index([status])
}

model ProductSupplier {
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId   String
  supplier    Supplier @relation(fields: [supplierId], references: [id], onDelete: Cascade)
  supplierId  String
  supplierSku String?
  lastCost    Decimal? @db.Decimal(14, 2)
  isPreferred Boolean  @default(false)
  @@id([productId, supplierId])
}

model Unit {
  id             String    @id @default(cuid())
  code           String    @unique
  name           String
  allowsFraction Boolean   @default(false)
  products       Product[]
}

model ProductImage {
  id        String   @id @default(cuid())
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId String
  url       String
  isPrimary Boolean  @default(false)
  createdAt DateTime @default(now())
  @@index([productId])
}

// ---------- Almacenes ----------
model Warehouse {
  id        String     @id @default(cuid())
  code      String     @unique
  name      String
  address   String?
  status    EntityStatus @default(ACTIVE)
  locations Location[]
}

model Location {
  id          String    @id @default(cuid())
  warehouse   Warehouse @relation(fields: [warehouseId], references: [id])
  warehouseId String
  code        String
  description String?
  stockLevels StockLevel[]
  productsPrimary Product[] @relation("ProductPrimaryLocation")
  movementsFrom StockMovement[] @relation("MovementFrom")
  movementsTo   StockMovement[] @relation("MovementTo")
  @@unique([warehouseId, code])
  @@index([warehouseId])
}

// ---------- Inventario ----------
model StockLevel {
  id               String   @id @default(cuid())
  product          Product  @relation(fields: [productId], references: [id])
  productId        String
  location         Location @relation(fields: [locationId], references: [id])
  locationId       String
  quantityOnHand   Decimal  @default(0) @db.Decimal(14, 3)
  quantityReserved Decimal  @default(0) @db.Decimal(14, 3)
  updatedAt        DateTime @updatedAt
  @@unique([productId, locationId])
  @@index([productId])
  @@index([locationId])
}

model StockMovement {
  id             String        @id @default(cuid())
  type           MovementType
  product        Product       @relation(fields: [productId], references: [id])
  productId      String
  fromLocation   Location?     @relation("MovementFrom", fields: [fromLocationId], references: [id])
  fromLocationId String?
  toLocation     Location?     @relation("MovementTo", fields: [toLocationId], references: [id])
  toLocationId   String?
  quantity       Decimal       @db.Decimal(14, 3)
  stockBefore    Decimal       @db.Decimal(14, 3)
  stockAfter     Decimal       @db.Decimal(14, 3)
  reason         MovementReason? @relation(fields: [reasonId], references: [id])
  reasonId       String?
  note           String?
  user           User          @relation(fields: [userId], references: [id])
  userId         String
  referenceId    String?
  createdAt      DateTime      @default(now())
  @@index([productId, createdAt])
  @@index([type])
  @@index([userId])
  @@index([referenceId])
  @@index([createdAt])
}

model MovementReason {
  id        String       @id @default(cuid())
  code      String       @unique
  label     String
  appliesTo ReasonScope  @default(ANY)
  movements StockMovement[]
}

// ---------- Notificaciones ----------
model Notification {
  id        String           @id @default(cuid())
  type      NotificationType
  severity  Severity         @default(INFO)
  title     String
  message   String
  product   Product?         @relation(fields: [productId], references: [id])
  productId String?
  user      User?            @relation(fields: [userId], references: [id])
  userId    String?
  readAt    DateTime?
  createdAt DateTime         @default(now())
  @@index([userId, readAt])
  @@index([type])
  @@index([productId])
  @@index([createdAt])
}
```

> Nota: el índice trigram para el buscador (`pg_trgm`) y los `CHECK` de dominio
> se añaden vía migración SQL personalizada en FASE 2, ya que van más allá de lo
> que expresa el DSL de Prisma.
