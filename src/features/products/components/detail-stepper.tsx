"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { adjustQuantity } from "@/features/products/actions";
import { LOW_STOCK } from "@/features/products/queries";

/** Stepper del detalle: al confirmar un ajuste, refresca el historial. */
export function DetailStepper({ productId, initial }: { productId: string; initial: number }) {
  const [qty, setQty] = useState(initial);
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setQty(initial), [initial]);
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleChange = (next: number) => {
    const previous = qty;
    setQty(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const res = await adjustQuantity(productId, next);
      if (!res.ok) {
        setQty(previous);
        if (res.error) alert(res.error);
        return;
      }
      if (typeof res.quantity === "number") setQty(res.quantity);
      router.refresh(); // actualiza la línea de tiempo
    }, 500);
  };

  return <QuantityStepper value={qty} onChange={handleChange} lowThreshold={LOW_STOCK} />;
}
