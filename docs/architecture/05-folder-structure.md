# 05 · Estructura del proyecto (versión simplificada)

Estructura liviana, feature-first, fácil de mantener. Cada área de negocio
(`auth`, `products`) es un módulo cohesivo. La lógica de negocio se separa de las
rutas HTTP para poder testearla.

## 5.1 Árbol de carpetas

```
convercion-metrica/
├── prisma/
│   ├── schema.prisma            # Las 3 tablas + Auth.js
│   ├── migrations/
│   └── seed.ts                  # Usuario demo + productos de ejemplo
│
├── public/
│
├── src/
│   ├── app/                     # Next App Router
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   ├── (app)/               # Rutas privadas (requieren sesión)
│   │   │   ├── layout.tsx       #   topbar + sesión
│   │   │   ├── page.tsx         #   Lista de productos (pantalla principal)
│   │   │   └── products/[id]/page.tsx   # Detalle + historial
│   │   ├── api/                 # Route Handlers (controladores delgados)
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   └── products/
│   │   │       ├── route.ts             # GET lista / POST crear
│   │   │       └── [id]/
│   │   │           ├── route.ts         # GET / PATCH / DELETE producto
│   │   │           └── quantity/route.ts# PATCH ajustar cantidad
│   │   ├── layout.tsx           # Root (providers, tema)
│   │   └── globals.css
│   │
│   ├── components/              # UI reutilizable
│   │   └── ui/                  #   Button, Input, Table, QuantityStepper…
│   │
│   ├── features/               # Módulos por dominio
│   │   ├── auth/
│   │   │   ├── components/      #   LoginForm
│   │   │   └── schemas.ts       #   Zod
│   │   └── products/
│   │       ├── components/      #   ProductTable, ProductForm, QuantityStepper
│   │       ├── hooks/           #   useProducts, useAdjustQuantity (optimista)
│   │       ├── api.ts           #   llamadas HTTP de la feature
│   │       └── schemas.ts       #   Zod de producto y de ajuste
│   │
│   ├── server/                  # Lógica de negocio (sin Next dentro)
│   │   ├── products/
│   │   │   ├── product.service.ts   # crear/editar/borrar producto
│   │   │   └── quantity.service.ts  # ajustar cantidad + registrar cambio (TX)
│   │   └── auth/
│   │       └── auth.service.ts      # login, último acceso
│   │
│   ├── lib/
│   │   ├── prisma.ts            # Cliente Prisma singleton
│   │   └── auth.ts             # Config Auth.js
│   │
│   ├── hooks/                   # Hooks globales (useTheme, useToast)
│   ├── types/                   # Tipos compartidos
│   ├── utils/                   # Formateadores (fecha, número)
│   └── middleware.ts            # Protege rutas privadas
│
├── tests/
├── .env.example
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 5.2 Cómo fluye una acción (ajustar cantidad)

```
QuantityStepper (UI)
   └─ useAdjustQuantity()  ── PATCH /api/products/:id/quantity
                                    └─ route.ts  (valida Zod + sesión)
                                          └─ quantity.service.ts
                                                └─ prisma.$transaction(
                                                     update product.quantity,
                                                     create quantityChange )
```

- **`route.ts`** es delgado: valida el input (Zod), confirma la sesión y llama al
  servicio. Sin lógica de negocio adentro.
- **`quantity.service.ts`** hace el trabajo real en una transacción: lee la
  cantidad actual, calcula `before/after/delta`, actualiza el producto e inserta
  el cambio. Es lo que se testea de forma aislada.
- **`useAdjustQuantity`** maneja la **UI optimista**: actualiza en pantalla y
  revierte si el servidor falla.

## 5.3 Convenciones

- **TypeScript estricto**, sin `any`.
- **Validación en el borde** con Zod antes de cualquier escritura.
- Componentes `PascalCase`, hooks `useCamelCase`, servicios `nombre.service.ts`.
- La lógica de negocio no importa nada de `next/*` → testeable y portable.
