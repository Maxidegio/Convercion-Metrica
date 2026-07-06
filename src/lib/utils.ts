import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases condicionales y resuelve conflictos de Tailwind. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Nivel de stock para el semáforo (verde/ámbar/rojo). */
export type StockLevel = "ok" | "warn" | "bad";

export function stockLevel(quantity: number, low = 5): StockLevel {
  if (quantity <= 0) return "bad";
  if (quantity <= low) return "warn";
  return "ok";
}
