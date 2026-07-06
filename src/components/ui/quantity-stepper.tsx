"use client";

import { useState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { cn, stockLevel } from "@/lib/utils";

export interface QuantityStepperProps {
  /** Cantidad actual (stock). */
  value: number;
  /** Se dispara con las flechas o al escribir un valor. */
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  /** Umbral de "stock bajo" para el color de semáforo. */
  lowThreshold?: number;
  disabled?: boolean;
}

/**
 * Control de stock: flechas −/+ (de a 1) y valor editable.
 * Es presentacional: solo emite `onChange`. La lógica de guardado
 * (UI optimista + API) vive en el hook que lo consume.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max,
  lowThreshold = 5,
  disabled = false,
}: QuantityStepperProps) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const clamp = (n: number) => {
    let next = n;
    if (next < min) next = min;
    if (max !== undefined && next > max) next = max;
    return next;
  };

  const commit = (raw: string) => {
    const parsed = parseInt(raw.replace(/[^0-9]/g, ""), 10);
    const next = clamp(Number.isNaN(parsed) ? min : parsed);
    setDraft(String(next));
    if (next !== value) onChange(next);
  };

  const bump = (step: number) => {
    if (disabled) return;
    const next = clamp(value + step);
    if (next !== value) onChange(next);
  };

  const level = stockLevel(value, lowThreshold);
  const levelText =
    level === "bad" ? "text-bad" : level === "warn" ? "text-warn" : "text-ok";

  const btn =
    "grid h-9 w-9 place-items-center rounded-control border border-border bg-card text-ink " +
    "text-lg font-extrabold leading-none transition active:scale-90 " +
    "hover:border-gold hover:bg-gold-50 active:bg-gold active:border-gold-600 " +
    "disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="inline-flex items-center justify-end gap-2">
      <button
        type="button"
        className={btn}
        onClick={() => bump(-1)}
        disabled={disabled || value <= min}
        aria-label="Restar uno"
      >
        <Minus size={16} strokeWidth={3} />
      </button>

      <input
        className={cn(
          "h-9 w-16 rounded-control border border-border bg-card text-center text-base font-extrabold tabular-nums outline-none",
          "focus:border-gold focus:ring-4 focus:ring-gold/20",
          levelText,
        )}
        inputMode="numeric"
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "ArrowUp") {
            e.preventDefault();
            bump(1);
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            bump(-1);
          }
        }}
        aria-label="Cantidad en stock"
      />

      <button
        type="button"
        className={btn}
        onClick={() => bump(1)}
        disabled={disabled || (max !== undefined && value >= max)}
        aria-label="Sumar uno"
      >
        <Plus size={16} strokeWidth={3} />
      </button>
    </div>
  );
}
