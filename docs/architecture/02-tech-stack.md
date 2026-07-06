# 02 · Stack tecnológico y justificación

Cada elección se explica con su razón, sus alternativas y cuándo convendría
cambiarla. Un buen arquitecto no elige tecnología por moda, sino por encaje con
los requisitos.

## 2.1 Frontend

### Next.js (App Router) + React + TypeScript + TailwindCSS

| Elección | Por qué |
|----------|---------|
| **Next.js (App Router)** | React Server Components reducen JS en cliente y aceleran las cargas iniciales (clave en un dashboard con muchas tablas). Enrutado por carpetas, layouts anidados, streaming, y despliegue nativo en Vercel. |
| **React** | Ecosistema maduro, componentes reutilizables, gran disponibilidad de talento. |
| **TypeScript (estricto)** | Tipado extremo a extremo. Los tipos de Prisma fluyen desde la BD hasta la UI: si cambia una columna, el compilador marca todo lo que se rompe. Menos bugs en producción. |
| **TailwindCSS** | Sistema de diseño consistente mediante *tokens* (colores neutros, espaciado, tipografía). Ideal para el estilo minimalista tipo Stripe/Linear/Vercel, con modo oscuro nativo (`dark:`). Sin CSS huérfano. |

**Librerías de apoyo previstas** (se confirmarán en FASE 2):

- **UI primitives:** Radix UI / shadcn-ui (accesibles, sin estilos impuestos —
  encajan con Tailwind y el look minimalista).
- **Estado servidor / data fetching:** TanStack Query (cache, revalidación,
  estados de carga/error) para el cliente; RSC + Server Actions donde aplique.
- **Formularios y validación:** React Hook Form + **Zod**.
- **Gráficos:** Recharts (dashboard) — ver skill de dataviz al implementar.
- **Tablas:** TanStack Table (ordenamiento, filtros, paginación server-side).
- **Iconos:** Lucide (limpios, coherentes, tree-shakeable).

## 2.2 Backend — **Next.js Route Handlers** (decisión principal)

> **Requisito del enunciado: elegir entre Next API y NestJS y justificar.**

### Decisión: **Next.js Route Handlers**, con una **Clean Architecture interna**
que mantiene el dominio y los casos de uso **framework-agnósticos**.

### Comparativa

| Criterio | Next.js Route Handlers | NestJS (backend separado) |
|----------|------------------------|---------------------------|
| **Deploy en Vercel** | Nativo, serverless, cero configuración | Requiere adaptador serverless o un host aparte (Railway/Render); rompe el "todo en Vercel" del enunciado |
| **Una sola base de código** | Front + back + tipos compartidos en un repo, sin CORS | Dos despliegues, dos ciclos, duplicación de DTOs/tipos |
| **Tipos compartidos** | Directo (mismo `tsconfig`, mismos tipos Prisma) | Hay que publicar/duplicar contratos |
| **Curva y velocidad inicial** | Menor; ideal para MVP y equipo pequeño | Mayor (módulos, providers, decoradores) |
| **Jobs pesados / websockets / cron largos** | Limitado por el modelo serverless | NestJS brilla aquí (long-running, colas, gateways WS) |
| **Estructura impuesta** | Ninguna (la ponemos nosotros) | DI y modularidad de fábrica |

### Razón de la elección

Para una **herramienta interna de inventario**, con un frontend Next.js y
**deployment objetivo en Vercel**, un backend NestJS separado añade complejidad
operativa (segundo despliegue, CORS, sincronización de tipos, más costos) sin un
beneficio proporcional. Los Route Handlers de Next cubren perfectamente CRUD,
autenticación y reportes en el modelo serverless de Vercel.

**Pero** —y esto es lo importante para "crecer durante años"— no metemos la
lógica de negocio dentro de los handlers. Aplicamos **Clean Architecture**: el
handler es un *controlador delgado* que solo traduce HTTP y delega en un **caso
de uso**. El dominio y los casos de uso viven en `src/server/` y **no importan
nada de Next**. Consecuencia estratégica:

> Si en el futuro el sistema necesita jobs pesados, colas, websockets o un
> backend multi-cliente, se puede **extraer `src/server/` a un servicio NestJS
> sin reescribir la lógica de negocio** — solo se cambia la capa de
> presentación. NestJS deja de ser una decisión irreversible y pasa a ser una
> puerta abierta.

### Cuándo reconsiderar NestJS

- Procesos de larga duración o colas de trabajo (ej. recálculos masivos,
  sincronización con sistemas externos).
- Necesidad de WebSockets persistentes para actualizaciones en tiempo real.
- Múltiples clientes (móvil nativo, integraciones B2B) consumiendo el mismo
  backend.
- Equipo de backend dedicado que se beneficie de la estructura opinada de Nest.

## 2.3 Base de datos — PostgreSQL

- **Relacional y transaccional (ACID):** imprescindible para inventario. Mover
  stock debe ser atómico (o se registra el movimiento **y** se ajusta el nivel,
  o no se hace nada).
- **Integridad referencial:** foreign keys reales, constraints, tipos ricos.
- **Escala bien:** índices B-tree/GIN, particionado, vistas materializadas para
  reportes pesados en el futuro.
- **Búsqueda:** soporte de *full-text search* nativo y `pg_trgm` para el
  buscador instantáneo, sin depender aún de un motor externo (Elastic).
- **Compatible con serverless:** vía pooling (Prisma + PgBouncer /
  Neon / Supabase / Vercel Postgres).

## 2.4 ORM — Prisma

- **Type-safety extremo a extremo:** el esquema genera tipos TS usados en toda
  la app.
- **Migraciones versionadas** (`prisma migrate`): historial reproducible del
  esquema, esencial para un sistema que vive años.
- **Transacciones e interactive transactions** para operaciones de stock.
- **Legibilidad:** el `schema.prisma` es documentación viva del modelo.
- **Nota serverless:** se usará Prisma con connection pooling adecuado
  (driver adapter / pooler) para evitar agotar conexiones en Vercel.

## 2.5 Autenticación — Auth.js (NextAuth v5)

- Integración nativa con Next App Router y con Prisma (adapter oficial).
- Estrategia de **sesión por credenciales** (email + contraseña) con contraseñas
  **hasheadas con bcrypt/argon2** — nunca en texto plano.
- Sesiones gestionadas (JWT o base de datos según se decida en FASE 3),
  **cierre de sesión**, y **registro de último acceso** (`lastLoginAt`).
- **Recuperación de contraseña** mediante token de un solo uso con expiración
  (tabla `PasswordResetToken`).
- Extensible a SSO/OAuth corporativo en el futuro sin reescribir el login.

## 2.6 Deployment — Vercel

- Despliegue nativo de Next.js: preview por PR, edge network, CI integrado.
- Variables de entorno gestionadas y secretas.
- Complementos del ecosistema: Vercel Postgres/Blob si se desea todo en un
  proveedor (o Neon/Supabase + S3). Se define en FASE 9.

## 2.7 Herramientas transversales (previstas)

| Área | Herramienta |
|------|-------------|
| Validación de esquemas | **Zod** (compartido entre API y formularios) |
| Testing | Vitest (unit/domain) + Playwright (E2E) |
| Calidad de código | ESLint + Prettier + TypeScript estricto |
| Reportes PDF | `@react-pdf/renderer` o Puppeteer (a evaluar en FASE 7) |
| Reportes Excel | `exceljs` |
| Logging | Logger estructurado (pino) tras un puerto de dominio |
| CI | GitHub Actions (lint, typecheck, test) |

## 2.8 Resumen de la decisión de arquitectura

**Monolito modular full-stack en Next.js, desplegado en Vercel, con un núcleo de
dominio limpio y desacoplado que puede extraerse a un servicio dedicado el día
que el negocio lo exija.** Simple hoy, sin cerrarse puertas mañana.
