# 02 · Stack tecnológico y justificación

Para un sistema simple (usuarios, productos, cantidades), el stack se mantiene
liviano pero profesional.

## 2.1 Frontend — Next.js + React + TypeScript + TailwindCSS

| Elección | Por qué |
|----------|---------|
| **Next.js (App Router)** | Full-stack en un solo proyecto: frontend y API juntos, sin CORS ni segundo servidor. Deploy nativo en Vercel. |
| **React** | Componentes reutilizables (la lista de productos, el control de cantidad). Ecosistema maduro. |
| **TypeScript** | Tipado extremo a extremo: los tipos de Prisma llegan hasta la UI. Menos bugs. |
| **TailwindCSS** | Estilo minimalista y consistente (tipo Stripe/Linear), modo oscuro nativo, sin CSS suelto. |

**Librerías de apoyo previstas** (se confirman en FASE 2):

- **UI:** shadcn-ui / Radix (accesible, encaja con Tailwind).
- **Formularios + validación:** React Hook Form + **Zod**.
- **Data fetching / estado servidor:** TanStack Query — clave para la **UI
  optimista** del ajuste de cantidad (actualiza en pantalla y revierte si falla).
- **Tabla:** TanStack Table (orden, filtro, paginación) para la lista.
- **Iconos:** Lucide (flechas −/+ limpias).

## 2.2 Backend — Next.js Route Handlers

Para este alcance, un backend separado (NestJS) sería sobreingeniería: agregaría
un segundo despliegue, CORS y duplicación de tipos sin beneficio. Los **Route
Handlers de Next** cubren de sobra un CRUD de productos + ajuste de cantidad +
historial, y despliegan nativo en Vercel.

Aun así, la **lógica de negocio** (ajustar cantidad y registrar el cambio en una
transacción) se mantiene en funciones de servicio separadas de la ruta HTTP, no
embebida en el handler. Así se puede testear de forma aislada y, si algún día el
sistema crece mucho, mover esa lógica a otro lado sin reescribirla.

## 2.3 Base de datos — PostgreSQL

- **Transaccional (ACID):** el ajuste de cantidad + el registro del historial
  deben ser atómicos. PostgreSQL lo garantiza.
- **Integridad referencial:** claves foráneas reales entre producto, usuario y
  cambio de cantidad.
- **Escala sin cambiar de motor** si el catálogo crece a decenas de miles de
  productos.

## 2.4 ORM — Prisma

- **Type-safety** de la BD a la UI.
- **Migraciones versionadas:** historial reproducible del esquema.
- **Transacciones** simples de escribir (`prisma.$transaction`) para el ajuste
  de cantidad.

## 2.5 Autenticación — Auth.js (NextAuth v5)

- **Login simple:** email + contraseña, contraseñas **hasheadas** (bcrypt/argon2),
  nunca en texto plano.
- **Sesiones** gestionadas + **cerrar sesión**.
- **Registro de último acceso** (`lastLoginAt`).
- Sin roles: cualquier usuario autenticado puede ver y ajustar productos. (Si en
  el futuro se quieren roles, se agregan sin rehacer el login.)

## 2.6 Deployment — Vercel

Deploy nativo de Next.js, previews por PR, HTTPS. La base PostgreSQL puede ser
Vercel Postgres, Neon o Supabase (se decide en la fase de deployment).

## 2.7 Herramientas transversales

| Área | Herramienta |
|------|-------------|
| Validación | **Zod** (API + formularios) |
| Calidad | ESLint + Prettier + TypeScript estricto |
| Testing | Vitest (lógica de ajuste de cantidad) + Playwright (E2E básico) |
| CI | GitHub Actions (lint + typecheck + test) |
