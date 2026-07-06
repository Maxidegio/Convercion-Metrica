"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Lock, ArrowRight, AlertCircle } from "lucide-react";
import { authenticate } from "@/features/auth/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-control bg-navy-800 px-4 py-3.5 text-base font-extrabold text-white shadow-card transition hover:bg-navy-700 disabled:opacity-60"
    >
      {pending ? "Ingresando…" : "Ingresar al sistema"}
      {!pending && <ArrowRight size={18} strokeWidth={2.5} />}
    </button>
  );
}

export function LoginForm() {
  const [error, formAction] = useActionState(authenticate, undefined);

  return (
    <form action={formAction} className="flex flex-col">
      <div className="mb-5 flex items-start gap-2.5 rounded-control border border-border bg-surface px-4 py-3 text-sm leading-snug text-muted">
        <Lock size={17} className="mt-0.5 flex-none" />
        <span>Acceso interno para empleados de MAFERSA. Ingresá con tu usuario y contraseña.</span>
      </div>

      <label className="mb-4 block">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
          Usuario
        </span>
        <input
          name="username"
          autoComplete="username"
          required
          placeholder="tu.usuario"
          className="w-full rounded-control border-[1.5px] border-border bg-card px-4 py-3.5 text-base text-ink outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/20"
        />
      </label>

      <label className="mb-2 block">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
          Contraseña <span className="text-gold-600">*</span>
        </span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Contraseña de acceso"
          className="w-full rounded-control border-[1.5px] border-border bg-card px-4 py-3.5 text-base text-ink outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/20"
        />
      </label>

      {error && (
        <p className="mb-1 mt-2 flex items-center gap-2 text-sm font-semibold text-bad">
          <AlertCircle size={15} />
          {error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
