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

## FASE 3 — Login + Usuarios ✅ COMPLETADA

- [x] Auth.js (NextAuth v5) con **usuario + contraseña**, hash bcrypt, sesión JWT y logout.
- [x] Rol `ADMIN` / `EMPLOYEE` (Máximo = administrador).
- [x] Pantalla de Login con la estética MAFERSA.
- [x] Registro de **último acceso** (`lastLoginAt`).
- [x] Middleware + guard por página que protegen las rutas privadas.
- [x] **Gestión de usuarios (solo admin):** crear, editar (nombre/rol/contraseña)
      y dar de baja empleados.
- [x] Seed de los 5 usuarios iniciales.

**DoD:** verificado end-to-end contra PostgreSQL — login admin/empleado, clave
incorrecta rechazada, rutas protegidas, `/usuarios` solo admin, último acceso
registrado.

---

## FASE 4 — Lista de productos (CRUD completo) ✅ COMPLETADA

- [x] Pantalla principal: tabla de productos (marca, CÓD.MAF, CÓD.FÁBRICA, descripción, stock).
- [x] **Agrupación por marca** por defecto + filtro lateral de marcas con contadores.
- [x] **Buscador** por código/descripción/marca (server-side).
- [x] **Paginación** server-side (50 por página) para los 3.536 productos.
- [x] Indicadores: productos, unidades, stock bajo, agotados (del conjunto filtrado).
- [x] **Alta, edición y baja** de productos (modal + Zod + unicidad de CÓD.MAF).
- [x] Stock mostrado con semáforo (verde/ámbar/rojo).

**DoD:** verificado end-to-end en navegador — lista agrupada, búsqueda, filtro,
paginación y CRUD completo (crear/editar/borrar) funcionando sobre PostgreSQL.

---

## FASE 5 — Ajuste de cantidad + historial ★ ✅ COMPLETADA

- [x] `QuantityStepper` interactivo en la lista (flechas −/+ y campo editable).
- [x] Ajuste en **transacción** (actualiza producto + inserta `quantity_changes`).
- [x] **UI optimista** con reversión ante error; clicks rápidos agrupados
      (debounce) en una sola entrada de historial. Sin motivo (un ajuste = listo).
- [x] Registro automático de cada cambio (quién, cuándo, antes → después, delta).
- [x] **Detalle de producto** con la línea de tiempo completa de movimientos.

**DoD:** verificado end-to-end — ajustar con flechas y escribiendo actualiza el
stock, cada cambio queda registrado e imborrable con su autor, y el historial se
ve en el detalle del producto.

---

## FASE 6 — Buscador y detalle de producto ✅ COMPLETADA

- [x] Buscador por código/descripción/marca con indicador de carga.
- [x] **Orden configurable**: marca, descripción, stock ↑, stock ↓.
- [x] **Filtros rápidos de stock**: todos · stock bajo · agotados (indicadores
      clickeables) que se combinan con marca y búsqueda.
- [x] Paginación que preserva todos los filtros en la URL.
- [x] Detalle de producto con **stepper para ajustar** y la línea de tiempo que
      se actualiza al instante.

**DoD:** verificado end-to-end — orden por stock, filtros de estado, búsqueda y
ajuste desde el detalle con historial en vivo.

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
