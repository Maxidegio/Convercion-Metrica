"use client";

import { useActionState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import type { ActionResult } from "@/features/products/actions";

type ProductValues = {
  id?: string;
  name?: string;
  internalCode?: string | null;
  factoryCode?: string | null;
  brand?: string | null;
  quantity?: number;
};

const inputCls =
  "w-full rounded-control border-[1.5px] border-border bg-card px-3 py-2.5 text-sm text-ink outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/20";
const labelCls = "mb-1 block text-xs font-bold uppercase tracking-wider text-muted";

export function ProductForm({
  action,
  values,
  submitLabel,
  onDone,
}: {
  action: (prev: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;
  values?: ProductValues;
  submitLabel: string;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | undefined, FormData>(
    action,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {values?.id && <input type="hidden" name="id" value={values.id} />}

      <label>
        <span className={labelCls}>Descripción</span>
        <input
          name="name"
          required
          defaultValue={values?.name ?? ""}
          className={inputCls}
          placeholder="Ej. Cuchillas Retráctiles"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label>
          <span className={labelCls}>Código interno (CÓD.MAF)</span>
          <input
            name="internalCode"
            defaultValue={values?.internalCode ?? ""}
            className={inputCls}
            placeholder="Ej. 15425"
          />
        </label>
        <label>
          <span className={labelCls}>Código de fábrica</span>
          <input
            name="factoryCode"
            defaultValue={values?.factoryCode ?? ""}
            className={inputCls}
            placeholder="Ej. 10-789"
          />
        </label>
        <label>
          <span className={labelCls}>Marca</span>
          <input
            name="brand"
            defaultValue={values?.brand ?? ""}
            className={inputCls}
            placeholder="Ej. STANLEY"
          />
        </label>
        <label>
          <span className={labelCls}>Stock inicial</span>
          <input
            name="quantity"
            type="number"
            min={0}
            defaultValue={values?.quantity ?? 0}
            className={inputCls}
          />
        </label>
      </div>

      {state?.error && (
        <p className="flex items-center gap-1.5 text-sm font-semibold text-bad">
          <AlertCircle size={14} />
          {state.error}
        </p>
      )}

      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onDone}
          className="rounded-control border border-border px-4 py-2 text-sm font-semibold text-muted hover:text-ink"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-control bg-navy-800 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-navy-700 disabled:opacity-60"
        >
          {pending ? "Guardando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
