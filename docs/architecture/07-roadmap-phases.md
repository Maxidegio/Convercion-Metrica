# 07 · Roadmap por fases

El desarrollo avanza en **9 fases**. Regla de oro: **no se avanza a la siguiente
fase sin terminar completamente la anterior**, y cada decisión técnica se explica
antes de implementarla. Cada fase tiene una **definición de terminado** (DoD)
que debe cumplirse y aprobarse.

## FASE 1 — Arquitectura ✅ (entregada, pendiente de aprobación)

**Objetivo:** diseñar todo el sistema como software comercial antes de escribir
código de aplicación.

**Entregables:**
- [x] Visión general y principios (`01-overview.md`)
- [x] Stack tecnológico y justificación, incl. Next API vs NestJS (`02-tech-stack.md`)
- [x] Modelo de datos completo: tablas, FKs, índices, normalización (`03-data-model.md`)
- [x] Diagrama entidad-relación (`04-er-diagram.md`)
- [x] Estructura de carpetas para años (`05-folder-structure.md`)
- [x] Seguridad y RBAC (`06-security-rbac.md`)
- [x] Roadmap por fases (este documento)

**DoD:** documentación revisada y **aprobada por el responsable**. → *Esperando tu OK.*

---

## FASE 2 — Configuración del proyecto

**Objetivo:** dejar el esqueleto técnico funcionando en local y en CI.

**Alcance:**
- Inicializar Next.js (App Router) + TypeScript estricto + TailwindCSS.
- ESLint, Prettier, `import/no-restricted-paths` (regla de dependencias).
- Prisma: `schema.prisma` final del modelo de FASE 1 + primera migración.
- Cliente Prisma singleton, config de entorno (`.env.example`).
- Estructura de carpetas de `05-folder-structure.md` creada y con barrels.
- Seed inicial: roles, permisos, unidades, un almacén y ubicación demo.
- Design system base: tokens de Tailwind, tema claro/oscuro, primitivas `ui/`.
- CI (GitHub Actions): lint + typecheck + test.

**DoD:** `dev` levanta, migración aplica, seed corre, CI en verde.

---

## FASE 3 — Autenticación

**Objetivo:** acceso seguro por empleado.

**Alcance:**
- Auth.js con credenciales, hashing de contraseñas, sesiones y logout.
- Pantalla de **Login** y **recuperación de contraseña** (token de un solo uso).
- Registro de **último acceso** y evento en `audit_logs`.
- Middleware de protección de rutas + guard de permisos server-side.
- Hook `usePermissions()` y matriz RBAC de `06-security-rbac.md`.

**DoD:** un usuario puede iniciar/cerrar sesión, recuperar contraseña, y las
rutas privadas están protegidas por rol.

---

## FASE 4 — Dashboard

**Objetivo:** panel principal tras el login.

**Alcance (según enunciado):** stock total, productos con poco stock,
movimientos del día, últimos ingresos y egresos, gráficos, alertas e
indicadores. Consultas agregadas eficientes; widgets reutilizables.

**DoD:** dashboard responsive, con datos reales del seed, en modo claro/oscuro.

---

## FASE 5 — CRUD de Productos

**Objetivo:** gestión completa del catálogo.

**Alcance:** alta/edición/baja lógica de productos con todos los campos del
enunciado; categorías (jerárquicas), marcas, proveedores, unidades, imágenes;
**buscador instantáneo** y filtros (nombre, SKU, categoría, proveedor,
ubicación, estado); tabla con paginación server-side.

**DoD:** se pueden administrar productos y buscarlos/filtrarlos con fluidez.

---

## FASE 6 — Movimientos

**Objetivo:** el corazón del sistema.

**Alcance:** registrar Ingreso, Salida, Transferencia y Ajuste en
**transacciones atómicas**; actualización automática de `stock_levels` y
agregados; `stockBefore/After`; ledger inmutable; **timeline/historial por
producto**; disparo de notificaciones (stock bajo/agotado).

**DoD:** todo movimiento actualiza el stock correctamente, queda registrado y es
imborrable; el historial por producto es completo.

---

## FASE 7 — Reportes

**Objetivo:** salida de información.

**Alcance:** reportes en **PDF y Excel** de inventario completo, movimientos,
ingresos, salidas, productos críticos e historial. Respetando el permiso
`report:export`.

**DoD:** los reportes se generan y descargan correctamente con datos reales.

---

## FASE 8 — Optimización

**Objetivo:** rendimiento y robustez.

**Alcance:** revisión de índices y consultas (N+1), caching donde aporte,
paginación/streaming, pruebas de carga básicas, cobertura de tests del dominio,
accesibilidad y pulido de UX.

**DoD:** métricas de rendimiento aceptables y suite de tests estable.

---

## FASE 9 — Deployment

**Objetivo:** puesta en producción en Vercel.

**Alcance:** PostgreSQL gestionado con pooling, variables de entorno y secretos,
migraciones en el pipeline, dominios, backups, monitoreo/logging y checklist de
seguridad final.

**DoD:** sistema desplegado, estable y accesible por los empleados.

---

## Principios que rigen todas las fases

1. **Terminar antes de avanzar.** Nada de fases a medias.
2. **Explicar antes de implementar.** Cada decisión técnica se justifica.
3. **Código limpio y desacoplado.** SOLID + Clean Architecture, documentado.
4. **Trazabilidad primero.** Los movimientos nunca se borran.
5. **Preparado para crecer.** Cada elección se evalúa a años, no a semanas.
