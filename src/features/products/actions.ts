"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProductSchema, updateProductSchema } from "./schemas";

export type ActionResult = { ok: boolean; error?: string };

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado.");
  return session.user;
}

/** Verifica que el código interno no esté usado por otro producto. */
async function internalCodeTaken(internalCode: string | null, exceptId?: string) {
  if (!internalCode) return false;
  const found = await prisma.product.findUnique({ where: { internalCode } });
  return !!found && found.id !== exceptId;
}

export async function createProduct(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuth();

  const parsed = createProductSchema.safeParse({
    name: formData.get("name"),
    internalCode: formData.get("internalCode"),
    factoryCode: formData.get("factoryCode"),
    brand: formData.get("brand"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  if (await internalCodeTaken(parsed.data.internalCode)) {
    return { ok: false, error: "Ya existe un producto con ese código interno (CÓD.MAF)." };
  }

  await prisma.product.create({ data: parsed.data });
  revalidatePath("/productos");
  return { ok: true };
}

export async function updateProduct(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuth();

  const parsed = updateProductSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    internalCode: formData.get("internalCode"),
    factoryCode: formData.get("factoryCode"),
    brand: formData.get("brand"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { id, ...data } = parsed.data;
  if (await internalCodeTaken(data.internalCode, id)) {
    return { ok: false, error: "Ya existe otro producto con ese código interno (CÓD.MAF)." };
  }

  await prisma.product.update({ where: { id }, data });
  revalidatePath("/productos");
  return { ok: true };
}

export type AdjustResult = { ok: boolean; quantity?: number; error?: string };

/**
 * Ajusta el stock de un producto al valor absoluto indicado y registra el
 * cambio en el historial, todo en una transacción. Sin motivo: un ajuste = una
 * entrada. Si el valor no cambia, no genera historial.
 */
export async function adjustQuantity(
  productId: string,
  newQuantity: number,
): Promise<AdjustResult> {
  const user = await requireAuth();

  if (!Number.isInteger(newQuantity) || newQuantity < 0) {
    return { ok: false, error: "Cantidad inválida." };
  }

  try {
    const finalQty = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { quantity: true },
      });
      if (!product) throw new Error("NOT_FOUND");

      const before = product.quantity;
      if (before === newQuantity) return before; // sin cambios, sin historial

      await tx.product.update({ where: { id: productId }, data: { quantity: newQuantity } });
      await tx.quantityChange.create({
        data: {
          productId,
          userId: user.id,
          before,
          after: newQuantity,
          delta: newQuantity - before,
        },
      });
      return newQuantity;
    });

    revalidatePath(`/productos/${productId}`);
    return { ok: true, quantity: finalQty };
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return { ok: false, error: "Producto no encontrado." };
    }
    return { ok: false, error: "No se pudo guardar el cambio." };
  }
}

export async function deleteProduct(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Producto inválido." };

  try {
    await prisma.product.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return {
        ok: false,
        error: "El producto tiene movimientos registrados y no puede eliminarse.",
      };
    }
    throw error;
  }

  revalidatePath("/productos");
  return { ok: true };
}
