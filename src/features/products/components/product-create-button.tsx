"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ProductForm } from "./product-form";
import { createProduct } from "@/features/products/actions";

export function ProductCreateButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-control bg-navy-800 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-navy-700"
      >
        <Plus size={16} strokeWidth={2.5} />
        Nuevo producto
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo producto">
        <ProductForm action={createProduct} submitLabel="Crear producto" onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
