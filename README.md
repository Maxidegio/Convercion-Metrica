# Convercion Métrica — Control simple de stock

Plataforma web privada para llevar el stock de los productos de la empresa.
Cada empleado entra con su usuario, ve la lista de productos y ajusta las
cantidades. Cada cambio de cantidad queda registrado automáticamente.

> **Estado actual: FASE 1 — Arquitectura (versión simplificada).** Este
> repositorio contiene por ahora solo el diseño. No hay código de aplicación.
> El desarrollo avanza por fases y cada fase se aprueba antes de la siguiente.

## Filosofía: lo más simple posible

El sistema se reduce a **tres conceptos**:

1. **Usuarios** — inicio de sesión por empleado (login simple, sin roles).
2. **Productos** — sus códigos, su nombre y su **cantidad**.
3. **Historial** — cada cambio de cantidad se guarda (quién, cuándo, antes → después).

La interacción estrella es el **ajuste de cantidad**: flechas **−/+** que suman o
restan de a **1 unidad**, y la posibilidad de **escribir** el número directo.

## Stack tecnológico

| Capa            | Tecnología                                  |
|-----------------|---------------------------------------------|
| Frontend        | Next.js (App Router) · React · TypeScript · TailwindCSS |
| Backend         | Next.js Route Handlers                       |
| Base de datos   | PostgreSQL                                   |
| ORM             | Prisma                                       |
| Autenticación   | Auth.js (NextAuth v5) — login simple         |
| Deployment      | Vercel                                        |

Justificación en [`docs/architecture/02-tech-stack.md`](docs/architecture/02-tech-stack.md).

## Documentación de arquitectura (FASE 1)

| Documento | Contenido |
|-----------|-----------|
| [01 · Visión general](docs/architecture/01-overview.md) | Objetivos, alcance mínimo, cómo funciona |
| [02 · Stack tecnológico](docs/architecture/02-tech-stack.md) | Elecciones y justificación |
| [03 · Modelo de datos](docs/architecture/03-data-model.md) | 3 tablas explicadas + esquema Prisma |
| [04 · Diagrama ER](docs/architecture/04-er-diagram.md) | Diagrama entidad-relación (Mermaid) |
| [05 · Estructura de carpetas](docs/architecture/05-folder-structure.md) | Organización del proyecto |
| [06 · Ajuste de cantidad (UX)](docs/architecture/06-quantity-stepper.md) | El control de flechas + input, y cómo se guarda |
| [07 · Roadmap por fases](docs/architecture/07-roadmap-phases.md) | Fases de desarrollo |
| [08 · Sistema de diseño](docs/architecture/08-design-system.md) | Estética MAFERSA: colores, tipografía, componentes |

El catálogo real (3.536 productos de la lista MAFERSA) ya está extraído en
[`data/`](data/README.md), listo para el seed.

## Puesta en marcha (local)

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno
cp .env.example .env        # completar DATABASE_URL y AUTH_SECRET

# 3. Crear el esquema en PostgreSQL
npx prisma migrate deploy   # aplica la migración inicial

# 4. Cargar datos: usuario admin + catálogo real (3.536 productos)
npm run db:seed

# 5. Arrancar en desarrollo
npm run dev                 # http://localhost:3000
```

Scripts útiles: `npm run typecheck`, `npm run lint`, `npm run build`,
`npm run format`.

## Flujo de desarrollo

No se avanza a la siguiente fase sin terminar la anterior.

1. **FASE 1 — Arquitectura** ✅ aprobada
2. **FASE 2 — Configuración del proyecto** ✅ completada
3. **FASE 3 — Login + Usuarios** ✅ completada
4. **FASE 4 — Lista de productos (CRUD)** ✅ completada
5. **FASE 5 — Ajuste de cantidad + historial** ✅ completada
6. FASE 6 — Buscador y detalle de producto ← *próxima*
7. FASE 7 — Optimización y deployment

### Usuarios iniciales (seed)

Login con **nombre de usuario** (minúsculas, sin acento). La contraseña inicial
es el **nombre de la persona** — conviene cambiarla desde la gestión de usuarios.

| Usuario | Rol | Contraseña inicial |
|---------|-----|--------------------|
| `maximo` | Administrador | `Máximo` |
| `sandra` | Empleado | `Sandra` |
| `alejandra` | Empleado | `Alejandra` |
| `german` | Empleado | `Germán` |
| `julio` | Empleado | `Julio` |

Solo el administrador (Máximo) puede crear, editar y dar de baja usuarios.
