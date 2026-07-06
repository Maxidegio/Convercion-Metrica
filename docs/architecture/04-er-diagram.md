# 04 · Diagrama entidad-relación (versión simplificada)

Modelo definido en [`03-data-model.md`](03-data-model.md). Solo tres entidades de
negocio.

```mermaid
erDiagram
    User ||--o{ QuantityChange : "realiza"
    Product ||--o{ QuantityChange : "registra"

    User {
        string   id PK
        string   email UK
        string   passwordHash
        string   name
        datetime lastLoginAt
        datetime createdAt
    }

    Product {
        string   id PK
        string   internalCode UK "CÓD.MAF"
        string   factoryCode "CÓD.FÁBRICA"
        string   brand
        string   name
        int      quantity "stock"
        datetime createdAt
        datetime updatedAt
    }

    QuantityChange {
        string   id PK
        string   productId FK
        string   userId FK
        int      before
        int      after
        int      delta
        string   note
        datetime createdAt
    }
```

## Cómo leerlo

- Un **usuario** realiza muchos **cambios de cantidad** (1:N).
- Un **producto** acumula muchos **cambios de cantidad** a lo largo del tiempo
  (1:N) → esa es su línea de tiempo / historial.
- `QuantityChange` es la tabla puente que conecta *quién* (usuario) cambió *qué*
  (producto) y *cuánto* (before → after, delta), *cuándo* (createdAt).

Nada más. Simple y trazable.
