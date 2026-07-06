import { z } from "zod";

const optionalTrimmed = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null));

export const productSchema = z.object({
  name: z.string().trim().min(1, "La descripción es obligatoria."),
  internalCode: optionalTrimmed, // CÓD.MAF (único)
  factoryCode: optionalTrimmed, // CÓD.FÁBRICA
  brand: optionalTrimmed,
  quantity: z.coerce.number().int("Debe ser un número entero.").min(0, "No puede ser negativo."),
});

export const createProductSchema = productSchema;

export const updateProductSchema = productSchema.extend({
  id: z.string().min(1),
});

export type ProductInput = z.infer<typeof productSchema>;
