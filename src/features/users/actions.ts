"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createUserSchema, updateUserSchema } from "./schemas";

export type ActionResult = { ok: boolean; error?: string };

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("No autorizado.");
  }
  return session.user;
}

/** Crea un empleado o administrador. */
export async function createUser(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = createUserSchema.safeParse({
    username: formData.get("username"),
    name: formData.get("name"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const username = parsed.data.username.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) return { ok: false, error: "Ya existe un usuario con ese nombre de usuario." };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: { username, name: parsed.data.name, role: parsed.data.role, passwordHash },
  });

  revalidatePath("/usuarios");
  return { ok: true };
}

/** Edita nombre, rol y (opcionalmente) contraseña de un usuario. */
export async function updateUser(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const parsed = updateUserSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    role: formData.get("role"),
    password: formData.get("password") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  // Un admin no puede quitarse a sí mismo el rol de administrador.
  if (parsed.data.id === admin.id && parsed.data.role !== "ADMIN") {
    return { ok: false, error: "No podés quitarte a vos mismo el rol de administrador." };
  }

  const data: Prisma.UserUpdateInput = {
    name: parsed.data.name,
    role: parsed.data.role,
  };
  if (parsed.data.password) {
    data.passwordHash = await bcrypt.hash(parsed.data.password, 10);
  }

  await prisma.user.update({ where: { id: parsed.data.id }, data });
  revalidatePath("/usuarios");
  return { ok: true };
}

/** Da de baja un usuario. */
export async function deleteUser(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Usuario inválido." };
  if (id === admin.id) return { ok: false, error: "No podés eliminar tu propio usuario." };

  try {
    await prisma.user.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return {
        ok: false,
        error: "El usuario tiene movimientos registrados y no puede eliminarse.",
      };
    }
    throw error;
  }

  revalidatePath("/usuarios");
  return { ok: true };
}
