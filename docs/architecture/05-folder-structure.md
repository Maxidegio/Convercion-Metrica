# 05 · Estructura del proyecto

Organización pensada para **mantenerse durante años**. Combina dos ideas:

1. **Feature-first en la presentación** (frontend): el código se agrupa por
   funcionalidad de negocio, no por tipo de archivo.
2. **Clean Architecture en el backend** (`src/server`): el dominio y los casos
   de uso no dependen de Next ni de Prisma.

Cada carpeta pedida en el enunciado (`components`, `features`, `hooks`,
`services`, `repositories`, `prisma`, `types`, `utils`, `middleware`, `api`,
`app`) tiene su lugar explícito; la columna "Enunciado" lo indica.

## 5.1 Árbol de carpetas

```
convercion-metrica/
├── prisma/                          # [prisma] Esquema, migraciones y seed
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── public/                          # Estáticos (logo, favicon)
│
├── src/
│   ├── app/                         # [app / api] Next App Router (PRESENTACIÓN)
│   │   ├── (auth)/                  #   Rutas públicas de acceso
│   │   │   ├── login/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (dashboard)/             #   Rutas privadas (con layout de dashboard)
│   │   │   ├── layout.tsx           #     sidebar + topbar + guard de sesión
│   │   │   ├── page.tsx             #     Dashboard principal
│   │   │   ├── products/
│   │   │   ├── movements/
│   │   │   ├── reports/
│   │   │   ├── notifications/
│   │   │   └── settings/            #     usuarios, roles, catálogos
│   │   ├── api/                     # [api] Route Handlers = controladores delgados
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── products/route.ts
│   │   │   ├── movements/route.ts
│   │   │   └── reports/route.ts
│   │   ├── layout.tsx               #   Root layout (providers, tema)
│   │   └── globals.css
│   │
│   ├── components/                  # [components] UI reutilizable (design system)
│   │   ├── ui/                      #   Primitivas: Button, Input, Dialog, Table…
│   │   ├── layout/                  #   Sidebar, Topbar, PageHeader
│   │   ├── charts/                  #   Envoltorios de gráficos
│   │   └── data/                    #   DataTable, Pagination, EmptyState
│   │
│   ├── features/                    # [features] Slices verticales por dominio
│   │   ├── auth/
│   │   │   ├── components/          #     LoginForm, ForgotPasswordForm
│   │   │   ├── hooks/               #     useCurrentUser, usePermissions
│   │   │   └── schemas.ts           #     Zod: login, reset
│   │   ├── products/
│   │   │   ├── components/          #     ProductTable, ProductForm, ProductCard
│   │   │   ├── hooks/               #     useProducts, useProductFilters
│   │   │   ├── api.ts               #     [services] cliente HTTP de la feature
│   │   │   └── schemas.ts           #     Zod de producto
│   │   ├── movements/
│   │   ├── dashboard/               #     widgets, KPIs, alertas
│   │   ├── reports/
│   │   └── notifications/
│   │
│   ├── server/                      # NÚCLEO BACKEND (Clean Architecture)
│   │   ├── domain/                  #   Entidades, value objects, reglas puras
│   │   │   ├── stock/               #     Stock, invariantes, cálculo de niveles
│   │   │   ├── movement/            #     Movement (entidad inmutable)
│   │   │   ├── product/
│   │   │   └── errors/              #     Errores de dominio tipados
│   │   ├── application/             #   Casos de uso + PUERTOS (interfaces)
│   │   │   ├── use-cases/           #     RegisterMovement, CreateProduct…
│   │   │   ├── ports/               #     Interfaces de repos y servicios
│   │   │   └── dto/                 #     Contratos de entrada/salida
│   │   ├── infrastructure/          #   Implementaciones concretas (adapters)
│   │   │   ├── repositories/        # [repositories] Repos Prisma
│   │   │   │   ├── product.repository.ts
│   │   │   │   ├── stock.repository.ts
│   │   │   │   └── movement.repository.ts
│   │   │   ├── auth/                #     Adapter Auth.js
│   │   │   ├── mail/                #     Servicio de email
│   │   │   ├── storage/            #     Imágenes (Blob/S3)
│   │   │   └── reports/             #     Generadores PDF/Excel
│   │   └── container.ts             #   Composition root (inyección de deps)
│   │
│   ├── lib/                         # Cross-cutting técnico
│   │   ├── prisma.ts                #   Cliente Prisma singleton
│   │   ├── auth.ts                  #   Config de Auth.js
│   │   └── logger.ts
│   │
│   ├── hooks/                       # [hooks] Hooks globales (useTheme, useToast)
│   ├── services/                    # [services] Cliente API base (fetch wrapper)
│   ├── types/                       # [types] Tipos compartidos y enums de UI
│   ├── utils/                       # [utils] Formateadores, fechas, dinero
│   ├── config/                      # Constantes, navegación, permisos por rol
│   └── middleware.ts                # [middleware] Guard de rutas / sesión
│
├── tests/                           # Unit (domain), integración y E2E
│   ├── unit/
│   └── e2e/
│
├── .env.example
├── .eslintrc / .prettierrc
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 5.2 Regla de dependencias (la más importante)

```
app / features  ──►  server/application  ──►  server/domain
      │                     ▲
      └──► services         │ (implementa puertos)
                     server/infrastructure ──► Prisma / Auth / Mail
```

- **`server/domain` no importa NADA** de Next, Prisma, React ni de otras capas.
  Solo TypeScript puro. Es el activo más valioso y el más estable.
- **`server/application`** depende del dominio y define **puertos** (interfaces).
  No sabe qué base de datos hay detrás.
- **`server/infrastructure`** implementa esos puertos con Prisma, email, etc. Es
  la única capa que toca detalles técnicos.
- **`app/api` (Route Handlers)** son controladores delgados: validan (Zod),
  autorizan (RBAC), llaman a un caso de uso y devuelven la respuesta. **Sin
  lógica de negocio.**
- **`features`** (frontend) consumen la API mediante `services`/`api.ts` y no
  conocen la implementación del servidor.

Esta disciplina es lo que permite, años después, cambiar Prisma por otro ORM, o
extraer el backend a NestJS, tocando solo `infrastructure`/`app`, nunca el
dominio.

## 5.3 Por qué feature-first en el frontend

Agrupar por funcionalidad (`features/products/*`) en lugar de por tipo
(`components/`, `hooks/`, `services/` globales gigantes) hace que:

- Todo lo de "productos" esté junto → onboarding y mantenimiento más rápidos.
- Las features sean **desacoplables**: se puede borrar o extraer una sin romper
  el resto.
- `components/ui` quede reservado para piezas **verdaderamente** transversales
  (el design system), evitando el cajón de sastre.

## 5.4 Convenciones de código

- **TypeScript estricto** (`strict: true`, sin `any` implícito).
- **Nombres:** componentes `PascalCase`, hooks `useCamelCase`, casos de uso
  `VerbNounUseCase`, repos `noun.repository.ts`.
- **Validación en el borde:** todo input externo pasa por un esquema Zod antes
  de entrar a un caso de uso.
- **Errores de dominio tipados** (no `throw new Error("...")` genérico) que la
  capa de presentación traduce a códigos HTTP.
- **Barrels (`index.ts`)** por feature para imports limpios.
- **Sin imports que crucen la regla de dependencias** (se puede vigilar con
  ESLint `import/no-restricted-paths`).
