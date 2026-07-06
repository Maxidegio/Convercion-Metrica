"use client";

import { useState } from "react";
import { QuantityStepper } from "@/components/ui/quantity-stepper";

/** Demo cliente del QuantityStepper para la página de estado. */
export function StepperDemo() {
  const [qty, setQty] = useState(8);
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <span className="inline-flex items-center rounded-chip bg-[#0B0D12] px-2 py-1 text-[0.68rem] font-extrabold text-gold">
          STANLEY
        </span>
        <p className="mt-1.5 text-sm font-semibold text-ink">Cuchillas Retráctiles</p>
        <p className="text-xs text-muted">CÓD.MAF 15425 · CÓD.FÁBRICA 10-789</p>
      </div>
      <QuantityStepper value={qty} onChange={setQty} />
    </div>
  );
}
