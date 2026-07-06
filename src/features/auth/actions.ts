"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";

/** Inicia sesión con credenciales. Devuelve un mensaje de error o redirige. */
export async function authenticate(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Usuario o contraseña incorrectos.";
    }
    // La redirección de éxito viaja como excepción y debe propagarse.
    throw error;
  }
}

export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
