"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { adjustQuantity } from "@/features/products/actions";
import { LOW_STOCK } from "@/features/products/queries";

/**
 * Celda de stock: stepper con UI optimista. Los cambios rápidos se agrupan
 * (debounce) y se envía un único ajuste al valor final, generando una sola
 * entrada de historial.
 */
export function ProductStepperCell({
  productId,
  initial,
}: {
  productId: string;
  initial: number;
}) {
  const [qty, setQty] = useState(initial);
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setQty(initial), [initial]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (savedTimer.current) clearTimeout(savedTimer.current);
    },
    [],
  );

  const handleChange = (next: number) => {
    const previous = qty;
    setQty(next); // optimista

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const res = await adjustQuantity(productId, next);
      if (!res.ok) {
        setQty(previous); // revertir
        if (res.error) alert(res.error);
        return;
      }
      if (typeof res.quantity === "number") setQty(res.quantity);
      setSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 1000);
    }, 500);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <span
        className={
          "flex items-center gap-1 text-[0.68rem] font-extrabold text-ok transition-opacity " +
          (saved ? "opacity-100" : "opacity-0")
        }
        aria-hidden={!saved}
      >
        <Check size={12} strokeWidth={3} />
        guardado
      </span>
      <QuantityStepper value={qty} onChange={handleChange} lowThreshold={LOW_STOCK} />
    </div>
  );
}
