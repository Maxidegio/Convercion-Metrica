-- Búsqueda rápida por texto (ILIKE '%q%') mediante índices GIN de trigramas.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "products_name_trgm_idx"
  ON "products" USING gin ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "products_internalCode_trgm_idx"
  ON "products" USING gin ("internalCode" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "products_factoryCode_trgm_idx"
  ON "products" USING gin ("factoryCode" gin_trgm_ops);
