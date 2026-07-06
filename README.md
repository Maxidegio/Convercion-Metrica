# Convercion Métrica — Sistema de Control de Inventario (WMS/ERP interno)

Plataforma web privada para el control interno de stock de la empresa. Cada
empleado accede con su usuario, todos los movimientos quedan registrados de
forma inmutable y el inventario se actualiza automáticamente.

> **Estado actual: FASE 1 — Arquitectura.** Este repositorio contiene, por
> ahora, únicamente el diseño del sistema. No se ha escrito código de aplicación.
> El desarrollo avanza por fases y cada fase debe aprobarse antes de comenzar la
> siguiente.

## Referencias funcionales

La organización lógica se inspira en **SAP Warehouse Management**, **Odoo
Inventory**, **Oracle NetSuite Inventory** y **Zoho Inventory**. No se copia
ninguna interfaz; se replica la forma en que estos sistemas estructuran el
dominio (productos, ubicaciones, movimientos como libro mayor inmutable,
niveles de stock por ubicación, RBAC, auditoría).

## Stack tecnológico (resumen)

| Capa            | Tecnología                                  |
|-----------------|---------------------------------------------|
| Frontend        | Next.js (App Router) · React · TypeScript · TailwindCSS |
| Backend         | Next.js Route Handlers + Clean Architecture interna |
| Base de datos   | PostgreSQL                                  |
| ORM             | Prisma                                      |
| Autenticación   | Auth.js (NextAuth v5)                        |
| Deployment      | Vercel                                      |

La justificación detallada de cada elección está en
[`docs/architecture/02-tech-stack.md`](docs/architecture/02-tech-stack.md).

## Documentación de arquitectura (FASE 1)

| Documento | Contenido |
|-----------|-----------|
| [01 · Visión general](docs/architecture/01-overview.md) | Objetivos, principios, alcance, diagrama de contexto |
| [02 · Stack tecnológico](docs/architecture/02-tech-stack.md) | Elecciones y justificación (incl. Next API vs NestJS) |
| [03 · Modelo de datos](docs/architecture/03-data-model.md) | Todas las tablas explicadas, índices, FKs, normalización |
| [04 · Diagrama ER](docs/architecture/04-er-diagram.md) | Diagrama entidad-relación (Mermaid) |
| [05 · Estructura de carpetas](docs/architecture/05-folder-structure.md) | Organización del proyecto para mantener por años |
| [06 · Seguridad y RBAC](docs/architecture/06-security-rbac.md) | Roles, permisos, sesiones, auditoría |
| [07 · Roadmap por fases](docs/architecture/07-roadmap-phases.md) | Fases 1 a 9, definición de "terminado" por fase |

## Flujo de desarrollo

El proyecto avanza en 9 fases. **No se avanza a la siguiente fase sin terminar
completamente la anterior.** Cada decisión técnica se explica antes de
implementarse.

1. **FASE 1 — Arquitectura** ← *estás aquí*
2. FASE 2 — Configuración del proyecto
3. FASE 3 — Autenticación
4. FASE 4 — Dashboard
5. FASE 5 — CRUD de Productos
6. FASE 6 — Movimientos
7. FASE 7 — Reportes
8. FASE 8 — Optimización
9. FASE 9 — Deployment

---

_Diseñado siguiendo principios SOLID, Clean Architecture y buenas prácticas de
ingeniería de software, pensado para crecer durante años._
