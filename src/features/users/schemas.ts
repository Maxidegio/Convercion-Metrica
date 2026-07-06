import { z } from "zod";

export const roleEnum = z.enum(["ADMIN", "EMPLOYEE"]);

export const createUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, "El usuario debe tener al menos 2 caracteres.")
    .regex(/^[a-z0-9._-]+$/i, "Solo letras, números, punto, guion y guion bajo."),
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  password: z.string().min(4, "La contraseña debe tener al menos 4 caracteres."),
  role: roleEnum,
});

export const updateUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  role: roleEnum,
  // Vacío = no cambiar la contraseña.
  password: z.union([z.string().min(4, "Mínimo 4 caracteres."), z.literal("")]),
});
