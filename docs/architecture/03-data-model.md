# 03 · Modelo de datos (versión simplificada)

Solo **tres tablas** de negocio: `users`, `products` y `quantity_changes`.
Más las tablas técnicas que aporta el adapter de Auth.js.

> Diagrama visual en [`04-er-diagram.md`](04-er-diagram.md).

## 3.1 Convenciones

- **PK** `id` tipo `cuid` (string).
- **Timestamps** `createdAt` / `updatedAt`.
- **Cantidades** como **enteros** (`Int`): el stock se cuenta en unidades y las
  flechas suman/restan de a 1. (Si algún día hiciera falta fraccionar, se pasa a
  `Decimal`.)
- **Historial** append-only: `quantity_changes` nunca se edita ni se borra.

## 3.2 Tablas

### `users` — Usuarios (empleados)

| Campo | Tipo | Notas |
|-------|------|-------|
| id | string PK | |
| email | string **unique** | login |
| passwordHash | string | bcrypt/argon2, nunca texto plano |
| name | string | nombre visible |
| lastLoginAt | datetime? | **registro de último acceso** |
| createdAt / updatedAt | datetime | |

- **Índice:** `email` (unique).
- Relación 1:N con `quantity_changes` (un usuario hace muchos cambios).

### `products` — Productos

El corazón. Sus **dos códigos**, su **marca**, su **nombre** y su **cantidad
(stock)**. Los campos salen directo de la lista de precios de MAFERSA (columnas
**MARCA · CÓD.MAF · CÓD.FÁBRICA · DESCRIPCIÓN**).

| Campo | Tipo | Notas |
|-------|------|-------|
| id | string PK | |
| internalCode | string? **unique** | **Código interno** (CÓD.MAF — ej. `15425`) |
| factoryCode | string? | **Código de fábrica** (CÓD.FÁBRICA — ej. `10-789`, `STHT42072-LA`) |
| brand | string? | Marca (ej. `STANLEY`, `PROTO`, `IRWIN`) |
| name | string | Descripción del producto — **obligatorio** |
| quantity | int | **stock** actual (default 0, nunca negativa) |
| createdAt / updatedAt | datetime | alta / última modificación |

- **Dos códigos, distinto rol:** `internalCode` (CÓD.MAF) identifica el producto
  dentro de la empresa y es **único**; `factoryCode` (CÓD.FÁBRICA) es el código
  del fabricante y puede repetirse entre variantes, por eso **no** es único.
- Ambos son opcionales porque en la lista real hay unos pocos productos con solo
  uno de los dos (≈10 sin código interno, ≈62 sin código de fábrica sobre 3.536).
- **`brand`** se guarda como texto para simplicidad; alimenta el filtro por marca
  (el panel "MARCAS"). Si el día de mañana se quiere administrar marcas como
  entidad, se normaliza a una tabla `brands` sin romper nada.
- **Índices:** `internalCode` (unique), `factoryCode`, `brand`, y un índice sobre
  `name` para el buscador instantáneo (busca por código, descripción o marca).
- **Escala real:** ~3.536 productos en 15 marcas → la lista **siempre** va
  paginada y con búsqueda server-side (nunca se traen los 3.500 de una).
- Relación 1:N con `quantity_changes`.

### `quantity_changes` — Historial de cambios de cantidad ★ append-only

Cada vez que cambia la cantidad de un producto, se inserta una fila aquí. **Nunca
se modifica ni se elimina.**

| Campo | Tipo | Notas |
|-------|------|-------|
| id | string PK | |
| productId | FK → products | producto afectado |
| userId | FK → users | quién hizo el cambio |
| before | int | cantidad antes |
| after | int | cantidad después |
| delta | int | diferencia (`after − before`; +1, −1, +40…) |
| note | string? | observación opcional |
| createdAt | datetime | fecha y hora |

- **Índice principal:** `(productId, createdAt)` → línea de tiempo de un producto
  ordenada por fecha, muy rápida.
- **Índice:** `userId` → ver qué hizo cada empleado.
- El servidor calcula `before`, `after` y `delta`; no se confía en el cliente.

### Tablas de Auth.js (`accounts`, `sessions`, `verification_tokens`)

Las agrega el adapter oficial de Auth.js para gestionar sesiones. No requieren
diseño propio; se incluyen al integrar la autenticación en FASE 3.

## 3.3 Integridad y transacciones

- **Ajuste de cantidad = 1 transacción:** actualizar `products.quantity` **e**
  insertar la fila en `quantity_changes` ocurren juntos o no ocurren. Así el
  historial siempre coincide con la cantidad real.
- **FKs con `RESTRICT` / soft-guard:** no se permite borrar un producto o usuario
  que tenga historial asociado (o se marca inactivo). El historial se preserva.
- **`quantity` nunca negativa:** validado en la lógica de negocio y, además, con
  un `CHECK (quantity >= 0)` en la base.

## 3.4 Esquema Prisma propuesto (borrador de FASE 1)

```prisma
model User {
  id           String           @id @default(cuid())
  email        String           @unique
  passwordHash String
  name         String
  lastLoginAt  DateTime?
  changes      QuantityChange[]
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
}

model Product {
  id           String           @id @default(cuid())
  internalCode String?          @unique   // CÓD.MAF
  factoryCode  String?                    // CÓD.FÁBRICA (puede repetirse)
  brand        String?
  name         String
  quantity     Int              @default(0)  // stock
  changes      QuantityChange[]
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  @@index([name])
  @@index([brand])
  @@index([factoryCode])
}

model QuantityChange {
  id        String   @id @default(cuid())
  product   Product  @relation(fields: [productId], references: [id])
  productId String
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  before    Int
  after     Int
  delta     Int
  note      String?
  createdAt DateTime @default(now())

  @@index([productId, createdAt])
  @@index([userId])
}
```

> El `CHECK (quantity >= 0)` y el índice del buscador (`pg_trgm` si se quiere
> búsqueda difusa) se agregan por migración SQL en FASE 2. Las tablas de Auth.js
> las añade el adapter en FASE 3.
