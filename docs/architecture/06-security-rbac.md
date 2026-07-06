# 06 · Seguridad, roles y control de accesos (RBAC)

## 6.1 Modelo de roles y permisos

El enunciado define tres roles: **Administrador**, **Supervisor** y **Empleado**.
Se implementan con un modelo **RBAC granular** (ver `03-data-model.md`): cada rol
es una fila en `roles` con un conjunto de `permissions`. Así, cambiar qué puede
hacer un rol —o crear uno nuevo— es **configuración de datos**, no un cambio de
código.

### Catálogo de permisos (código `recurso:acción`)

| Recurso | Permisos |
|---------|----------|
| Productos | `product:read`, `product:create`, `product:update`, `product:delete` |
| Movimientos | `movement:read`, `movement:create` (nunca `delete` — inmutable) |
| Stock | `stock:read`, `stock:adjust` |
| Reportes | `report:read`, `report:export` |
| Catálogos | `catalog:manage` (categorías, marcas, proveedores, unidades, almacenes) |
| Usuarios | `user:read`, `user:manage`, `role:manage` |
| Notificaciones | `notification:read` |
| Auditoría | `audit:read` |

### Matriz rol × permiso (propuesta inicial)

| Permiso | Administrador | Supervisor | Empleado |
|---------|:---:|:---:|:---:|
| product:read | ✅ | ✅ | ✅ |
| product:create / update | ✅ | ✅ | ❌ |
| product:delete | ✅ | ❌ | ❌ |
| movement:read | ✅ | ✅ | ✅ |
| movement:create | ✅ | ✅ | ✅ |
| stock:adjust | ✅ | ✅ | ❌ |
| report:read | ✅ | ✅ | ✅ (limitado) |
| report:export | ✅ | ✅ | ❌ |
| catalog:manage | ✅ | ✅ | ❌ |
| user:manage / role:manage | ✅ | ❌ | ❌ |
| audit:read | ✅ | ❌ | ❌ |

> Resumen: el **Empleado** opera el día a día (ver stock, registrar
> ingresos/salidas), el **Supervisor** además gestiona catálogo, ajustes y
> exporta reportes, y el **Administrador** controla usuarios, roles y auditoría.
> La matriz es un punto de partida ajustable sin redeploy.

## 6.2 Dónde se aplica la autorización

La autorización se verifica **siempre en el servidor**. La UI oculta lo que el
usuario no puede hacer, pero eso es solo comodidad, **nunca** seguridad.

1. **Middleware (`middleware.ts`):** protege el grupo de rutas privadas
   `(dashboard)`; sin sesión válida → redirige a `/login`.
2. **Route Handlers / casos de uso:** cada endpoint verifica el permiso concreto
   (`assertPermission(user, "product:create")`) antes de ejecutar. Un guard
   centralizado evita repetir lógica.
3. **UI:** un hook `usePermissions()` decide qué acciones/menús mostrar. Es
   cosmético.

## 6.3 Autenticación y sesiones (Auth.js)

- **Login** por email + contraseña. Las contraseñas se almacenan **hasheadas**
  (bcrypt/argon2), nunca en texto plano; la comparación es en tiempo constante.
- **Sesiones** gestionadas por Auth.js. Estrategia (JWT vs sesión en BD) se fija
  en FASE 3; en ambos casos hay **cierre de sesión** explícito.
- **Registro de último acceso:** al autenticarse con éxito se actualiza
  `users.lastLoginAt` y se registra un evento en `audit_logs`.
- **Recuperación de contraseña:** flujo con token de un solo uso
  (`password_reset_tokens`), hasheado, con expiración corta e invalidación tras
  el uso. El envío es por email (servicio en `infrastructure/mail`).
- **Estados de usuario:** `SUSPENDED`/`INACTIVE` bloquean el acceso aunque las
  credenciales sean válidas.

## 6.4 Auditoría

Dos niveles complementarios de trazabilidad:

- **Ledger de movimientos** (`stock_movements`): toda alteración de stock, con
  `stockBefore/After`, usuario, fecha/hora y motivo. Inmutable.
- **`audit_logs`**: acciones sensibles a nivel aplicación (login, alta/edición
  de usuarios, cambios de rol/permiso, exportación de reportes, ajustes),
  con `metadata` de antes/después e IP.

Ninguna de las dos tablas se borra jamás.

## 6.5 Buenas prácticas de seguridad transversales

| Ámbito | Medida |
|--------|--------|
| Entrada | Validación **Zod** de todo input externo antes del caso de uso |
| Inyección | Prisma parametriza consultas; no se concatena SQL |
| Secretos | En variables de entorno de Vercel, nunca en el repo (`.env.example` sin valores) |
| Transporte | HTTPS obligatorio (Vercel) |
| Rate limiting | En login y recuperación de contraseña (mitiga fuerza bruta) |
| Cabeceras | CSP y cabeceras de seguridad en la config de Next |
| Principio de mínimo privilegio | Permisos por rol; todo lo no concedido, denegado |
| Datos derivados | El stock no se edita directo: solo cambia vía movimientos auditables |

Los detalles de implementación (algoritmo de hash definitivo, estrategia de
sesión, rate limiter) se confirman en **FASE 3 — Autenticación**.
