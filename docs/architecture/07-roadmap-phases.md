# 07 · Roadmap por fases (versión simplificada)

Con el alcance reducido, el desarrollo se ordena en menos fases. Regla: **no se
avanza a la siguiente sin terminar la anterior**, y cada decisión técnica se
explica antes de implementarla.

> **Decisiones aprobadas (cierre de FASE 1):**
> - **Estética:** se adopta la del portal MAFERSA (navy + dorado), congelada.
> - **Productos:** CRUD completo desde el sistema (crear/editar/borrar) **además**
>   de importar el catálogo inicial (3.536 productos).

## FASE 1 — Arquitectura ✅ APROBADA

Diseño del sistema mínimo: usuarios, productos y cambios de cantidad.
- [x] Visión general y alcance (`01-overview.md`)
- [x] Stack y justificación (`02-tech-stack.md`)
- [x] Modelo de datos: 3 tablas (`03-data-model.md`)
- [x] Diagrama ER (`04-er-diagram.md`)
- [x] Estructura de carpetas (`05-folder-structure.md`)
- [x] Ajuste de cantidad — flechas + input (`06-quantity-stepper.md`)
- [x] Roadmap (este documento)

**DoD:** aprobación del diseño. → *Esperando tu OK.*

---

## FASE 2 — Configuración del proyecto ✅ COMPLETADA

- [x] Next.js 15 (App Router) + React 19 + TypeScript estricto + TailwindCSS.
- [x] ESLint, Prettier.
- [x] Prisma con las 3 tablas + tablas de Auth.js + migración inicial + `CHECK (quantity >= 0)`.
- [x] Seed: usuario admin + importación del catálogo real (`data/products.json`).
- [x] Design system base: tokens MAFERSA, tema claro/oscuro, primitiva `QuantityStepper`.
- [x] CI (GitHub Actions): lint + typecheck + build.

**DoD:** build/typecheck/lint en verde (verificado). La migración y el seed se
aplican al conectar una PostgreSQL vía `DATABASE_URL`.

---

## FASE 3 — Login

- Auth.js con email + contraseña, hashing, sesión y logout.
- Pantalla de Login.
- Registro de **último acceso**.
- Middleware que protege las rutas privadas.

**DoD:** un empleado inicia y cierra sesión; sin sesión no se entra.

---

## FASE 4 — Lista de productos (CRUD completo)

- Pantalla principal: tabla de productos (marca, CÓD.MAF, CÓD.FÁBRICA, nombre, stock).
- **Alta, edición y baja** de productos desde el sistema (formulario con Zod).
- Importación del catálogo inicial desde `data/products.json`.
- Validación de unicidad del código interno.

**DoD:** se pueden crear, editar y borrar productos desde la interfaz, y el
catálogo inicial queda cargado.

---

## FASE 5 — Ajuste de cantidad + historial ★

- Componente `QuantityStepper` (flechas −/+ y campo editable).
- Endpoint de ajuste en **transacción** (producto + `quantity_changes`).
- **UI optimista** con reversión ante error.
- Registro automático de cada cambio (quién, cuándo, antes → después).

**DoD:** ajustar cantidad funciona con flechas y escribiendo, y cada cambio
queda guardado e imborrable.

---

## FASE 6 — Buscador y detalle de producto

- Buscador por nombre / código.
- Pantalla de detalle con la **línea de tiempo** de cambios de cantidad del
  producto.

**DoD:** se encuentra un producto al instante y se ve su historial completo.

---

## FASE 7 — Optimización y deployment

- Índices y consultas revisadas, paginación en la lista.
- Pulido de UX, responsive, modo oscuro.
- Deploy en Vercel + PostgreSQL gestionado, variables de entorno, backups.

**DoD:** sistema desplegado, estable y usable por los empleados.

---

## Principios que rigen todas las fases

1. Terminar una fase antes de avanzar.
2. Explicar cada decisión técnica antes de implementarla.
3. Código limpio y desacoplado.
4. El historial de cantidades nunca se borra.
5. Simple hoy, con lugar para crecer si el negocio lo pide.
