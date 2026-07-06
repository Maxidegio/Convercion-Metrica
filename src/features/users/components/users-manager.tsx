"use client";

import { Fragment, useActionState, useEffect, useRef, useState } from "react";
import { UserPlus, Pencil, Trash2, X, AlertCircle, ShieldCheck } from "lucide-react";
import type { Role } from "@prisma/client";
import {
  createUser,
  updateUser,
  deleteUser,
  type ActionResult,
} from "@/features/users/actions";

type UserRow = {
  id: string;
  username: string;
  name: string;
  role: Role;
  lastLoginAt: Date | null;
};

const inputCls =
  "w-full rounded-control border-[1.5px] border-border bg-card px-3 py-2.5 text-sm text-ink outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/20";
const labelCls = "mb-1 block text-xs font-bold uppercase tracking-wider text-muted";

function formatDate(d: Date | null): string {
  if (!d) return "Nunca";
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(d));
}

function RoleBadge({ role }: { role: Role }) {
  const admin = role === "ADMIN";
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-chip px-2 py-1 text-[0.68rem] font-extrabold uppercase " +
        (admin ? "bg-gold text-[#0B0D12]" : "bg-chip text-muted")
      }
    >
      {admin && <ShieldCheck size={12} />}
      {admin ? "Admin" : "Empleado"}
    </span>
  );
}

function ErrorLine({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-bad">
      <AlertCircle size={14} />
      {message}
    </p>
  );
}

/* ---------------- Crear ---------------- */
function CreateForm() {
  const [state, action, pending] = useActionState<ActionResult | undefined, FormData>(
    createUser,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-control bg-navy-800 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-navy-700"
      >
        <UserPlus size={16} />
        Nuevo usuario
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={action}
      className="rounded-card border border-border bg-card p-5 shadow-card"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-extrabold text-ink">Nuevo usuario</h3>
        <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar">
          <X size={18} className="text-muted" />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className={labelCls}>Nombre</span>
          <input name="name" required className={inputCls} placeholder="Ej. Sandra" />
        </label>
        <label>
          <span className={labelCls}>Usuario (login)</span>
          <input name="username" required className={inputCls} placeholder="ej. sandra" />
        </label>
        <label>
          <span className={labelCls}>Contraseña</span>
          <input name="password" required className={inputCls} placeholder="••••••" />
        </label>
        <label>
          <span className={labelCls}>Rol</span>
          <select name="role" defaultValue="EMPLOYEE" className={inputCls}>
            <option value="EMPLOYEE">Empleado</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </label>
      </div>
      <ErrorLine message={state?.error} />
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-control bg-navy-800 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-navy-700 disabled:opacity-60"
        >
          {pending ? "Creando…" : "Crear usuario"}
        </button>
      </div>
    </form>
  );
}

/* ---------------- Editar ---------------- */
function EditForm({ user, onClose }: { user: UserRow; onClose: () => void }) {
  const [state, action, pending] = useActionState<ActionResult | undefined, FormData>(
    updateUser,
    undefined,
  );
  useEffect(() => {
    if (state?.ok) onClose();
  }, [state, onClose]);

  return (
    <form action={action} className="bg-surface px-4 py-4">
      <input type="hidden" name="id" value={user.id} />
      <div className="grid gap-3 sm:grid-cols-3">
        <label>
          <span className={labelCls}>Nombre</span>
          <input name="name" defaultValue={user.name} required className={inputCls} />
        </label>
        <label>
          <span className={labelCls}>Rol</span>
          <select name="role" defaultValue={user.role} className={inputCls}>
            <option value="EMPLOYEE">Empleado</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </label>
        <label>
          <span className={labelCls}>Nueva contraseña</span>
          <input
            name="password"
            className={inputCls}
            placeholder="Dejar vacío para no cambiar"
          />
        </label>
      </div>
      <ErrorLine message={state?.error} />
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-control border border-border px-3 py-2 text-sm font-semibold text-muted hover:text-ink"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-control bg-navy-800 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-navy-700 disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}

/* ---------------- Borrar ---------------- */
function DeleteButton({ user, disabled }: { user: UserRow; disabled: boolean }) {
  const [state, action, pending] = useActionState<ActionResult | undefined, FormData>(
    deleteUser,
    undefined,
  );

  if (disabled) {
    return (
      <span className="text-xs text-muted" title="No podés eliminar tu propio usuario">
        —
      </span>
    );
  }

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`¿Eliminar a ${user.name}? Esta acción no se puede deshacer.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={user.id} />
      <button
        type="submit"
        disabled={pending}
        title={state?.error ?? "Eliminar"}
        aria-label={`Eliminar ${user.name}`}
        className="grid h-8 w-8 place-items-center rounded-control border border-border text-muted transition hover:border-bad hover:text-bad disabled:opacity-50"
      >
        <Trash2 size={15} />
      </button>
    </form>
  );
}

/* ---------------- Tabla principal ---------------- */
export function UsersManager({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="mt-6 flex flex-col gap-5">
      <CreateForm />

      <div className="overflow-hidden rounded-card border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface">
                {["Nombre", "Usuario", "Rol", "Último acceso", ""].map((h, i) => (
                  <th
                    key={h || i}
                    className="border-b border-border px-4 py-3 text-left text-[0.68rem] font-extrabold uppercase tracking-wider text-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === currentUserId;
                const editing = editingId === u.id;
                return (
                  <Fragment key={u.id}>
                    <tr className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-sm font-semibold text-ink">
                        {u.name}
                        {isSelf && <span className="ml-1.5 text-xs text-muted">(vos)</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-chip bg-chip px-2 py-1 font-mono text-xs font-bold text-ink">
                          {u.username}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">{formatDate(u.lastLoginAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingId(editing ? null : u.id)}
                            aria-label={`Editar ${u.name}`}
                            className="grid h-8 w-8 place-items-center rounded-control border border-border text-muted transition hover:border-gold hover:text-ink"
                          >
                            <Pencil size={15} />
                          </button>
                          <DeleteButton user={u} disabled={isSelf} />
                        </div>
                      </td>
                    </tr>
                    {editing && (
                      <tr>
                        <td colSpan={5} className="p-0">
                          <EditForm user={u} onClose={() => setEditingId(null)} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
