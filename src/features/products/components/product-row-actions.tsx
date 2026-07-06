"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ProductForm } from "./product-form";
import { updateProduct, deleteProduct } from "@/features/products/actions";

export type ProductForActions = {
  id: string;
  name: string;
  internalCode: string | null;
  factoryCode: string | null;
  brand: string | null;
  quantity: number;
};

export function ProductRowActions({ product }: { product: ProductForActions }) {
  const [editing, setEditing] = useState(false);

  const onDelete = async () => {
    if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
    const fd = new FormData();
    fd.set("id", product.id);
    const res = await deleteProduct(undefined, fd);
    if (!res.ok && res.error) alert(res.error);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => setEditing(true)}
        aria-label={`Editar ${product.name}`}
        className="grid h-8 w-8 place-items-center rounded-control border border-border text-muted transition hover:border-gold hover:text-ink"
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={onDelete}
        aria-label={`Eliminar ${product.name}`}
        className="grid h-8 w-8 place-items-center rounded-control border border-border text-muted transition hover:border-bad hover:text-bad"
      >
        <Trash2 size={15} />
      </button>

      <Modal open={editing} onClose={() => setEditing(false)} title="Editar producto">
        <ProductForm
          action={updateProduct}
          values={product}
          submitLabel="Guardar cambios"
          onDone={() => setEditing(false)}
        />
      </Modal>
    </div>
  );
}
