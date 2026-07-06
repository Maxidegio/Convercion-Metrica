# 07 · Roadmap por fases (versión simplificada)

Con el alcance reducido, el desarrollo se ordena en menos fases. Regla: **no se
avanza a la siguiente sin terminar la anterior**, y cada decisión técnica se
explica antes de implementarla.

## FASE 1 — Arquitectura ✅ (entregada, pendiente de aprobación)

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

## FASE 2 — Configuración del proyecto

- Next.js (App Router) + TypeScript estricto + TailwindCSS.
- ESLint, Prettier.
- Prisma con las 3 tablas + primera migración + `CHECK (quantity >= 0)`.
- Seed: un usuario demo y algunos productos de ejemplo.
- Design system base: tema claro/oscuro, primitivas `ui/` (incl. `QuantityStepper`).
- CI: lint + typecheck + test.

**DoD:** `dev` levanta, migración y seed corren, CI en verde.

---

## FASE 3 — Login

- Auth.js con email + contraseña, hashing, sesión y logout.
- Pantalla de Login.
- Registro de **último acceso**.
- Middleware que protege las rutas privadas.

**DoD:** un empleado inicia y cierra sesión; sin sesión no se entra.

---

## FASE 4 — Lista de productos (CRUD)

- Pantalla principal: tabla de productos (códigos, nombre, cantidad).
- Alta, edición y baja de productos.
- Validación con Zod.

**DoD:** se pueden administrar productos desde la interfaz.

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
