# 04 · Diagrama entidad-relación

Representación visual del modelo definido en
[`03-data-model.md`](03-data-model.md). Renderiza como diagrama en cualquier
visor compatible con Mermaid (GitHub incluido).

## 4.1 Diagrama ER completo

```mermaid
erDiagram
    User ||--o{ StockMovement : "registra"
    User ||--o{ AuditLog : "genera"
    User ||--o{ Notification : "recibe"
    User ||--o{ PasswordResetToken : "solicita"
    Role ||--o{ User : "clasifica"
    Role ||--o{ RolePermission : "tiene"
    Permission ||--o{ RolePermission : "otorga"

    Category ||--o{ Category : "subcategoria"
    Category ||--o{ Product : "clasifica"
    Brand ||--o{ Product : "marca"
    Supplier ||--o{ Product : "provee"
    Supplier ||--o{ ProductSupplier : "alternativo"
    Product ||--o{ ProductSupplier : "abastecido_por"
    Unit ||--o{ Product : "mide"
    Product ||--o{ ProductImage : "ilustra"

    Warehouse ||--o{ Location : "contiene"
    Location ||--o{ StockLevel : "almacena"
    Location ||--o{ Product : "ubicacion_principal"
    Product ||--o{ StockLevel : "tiene_nivel"
    Product ||--o{ StockMovement : "afectado_en"
    Location ||--o{ StockMovement : "origen"
    Location ||--o{ StockMovement : "destino"
    MovementReason ||--o{ StockMovement : "motiva"
    Product ||--o{ Notification : "dispara"

    User {
        string id PK
        string email UK
        string passwordHash
        string name
        string roleId FK
        enum   status
        datetime lastLoginAt
    }
    Role {
        string id PK
        string name UK
        string label
    }
    Permission {
        string id PK
        string code UK
    }
    RolePermission {
        string roleId FK
        string permissionId FK
    }
    Product {
        string id PK
        string internalCode UK
        string sku UK
        string barcode UK
        string name
        string categoryId FK
        string brandId FK
        string supplierId FK
        string unitId FK
        string primaryLocationId FK
        decimal quantityOnHand
        decimal quantityReserved
        decimal minStock
        decimal maxStock
        decimal cost
        decimal price
        enum   status
    }
    Category {
        string id PK
        string name
        string parentId FK
    }
    Brand {
        string id PK
        string name UK
    }
    Supplier {
        string id PK
        string name
        enum   status
    }
    ProductSupplier {
        string productId FK
        string supplierId FK
        bool   isPreferred
    }
    Unit {
        string id PK
        string code UK
        bool   allowsFraction
    }
    ProductImage {
        string id PK
        string productId FK
        bool   isPrimary
    }
    Warehouse {
        string id PK
        string code UK
    }
    Location {
        string id PK
        string warehouseId FK
        string code
    }
    StockLevel {
        string id PK
        string productId FK
        string locationId FK
        decimal quantityOnHand
        decimal quantityReserved
    }
    StockMovement {
        string id PK
        enum   type
        string productId FK
        string fromLocationId FK
        string toLocationId FK
        decimal quantity
        decimal stockBefore
        decimal stockAfter
        string reasonId FK
        string userId FK
        string referenceId
        datetime createdAt
    }
    MovementReason {
        string id PK
        string code UK
        enum   appliesTo
    }
    Notification {
        string id PK
        enum   type
        enum   severity
        string productId FK
        string userId FK
        datetime readAt
    }
    AuditLog {
        string id PK
        string userId FK
        string action
        string entityType
        string entityId
    }
    PasswordResetToken {
        string id PK
        string userId FK
        string tokenHash UK
        datetime expiresAt
    }
```

## 4.2 Lectura del diagrama por módulos

- **Accesos:** `Role → User`, y `Role ↔ Permission` (vía `RolePermission`)
  definen quién puede hacer qué. `AuditLog` y `PasswordResetToken` cuelgan de
  `User`.
- **Catálogo:** `Product` es el hub, con FKs a `Category` (auto-jerárquica),
  `Brand`, `Supplier`, `Unit` y su ubicación principal. Imágenes y proveedores
  alternativos en 1:N / N:M.
- **Almacén:** `Warehouse → Location`. El stock real vive en `StockLevel`
  (Producto × Ubicación).
- **Movimientos:** `StockMovement` conecta `Product`, `User`, ubicaciones de
  origen/destino y `MovementReason`. Es el ledger inmutable.
- **Observabilidad:** `Notification` se relaciona con `Product` y `User`.

## 4.3 Cardinalidades destacadas

| Relación | Tipo | Nota |
|----------|------|------|
| Product ↔ Location (stock) | N:M vía `StockLevel` | un producto en varias ubicaciones |
| Product ↔ Supplier | N:M vía `ProductSupplier` | + FK `supplierId` = proveedor principal |
| Category ↔ Category | 1:N auto-referencia | categoría / subcategoría |
| Role ↔ Permission | N:M vía `RolePermission` | RBAC granular |
| Product ↔ StockMovement | 1:N | historial / timeline por producto |
