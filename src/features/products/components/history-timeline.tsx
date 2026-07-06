import { ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Change = {
  id: string;
  before: number;
  after: number;
  delta: number;
  createdAt: Date;
  user: { name: string };
};

function formatDateTime(d: Date): string {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(d),
  );
}

export function HistoryTimeline({ history }: { history: Change[] }) {
  if (history.length === 0) {
    return (
      <div className="grid place-items-center rounded-card border border-border bg-card px-6 py-14 text-center shadow-card">
        <Clock size={22} className="text-muted" />
        <p className="mt-2 text-sm font-semibold text-ink">Sin movimientos todavía</p>
        <p className="mt-1 text-sm text-muted">
          Cada ajuste de stock quedará registrado acá.
        </p>
      </div>
    );
  }

  return (
    <ol className="flex flex-col">
      {history.map((c, i) => {
        const up = c.delta > 0;
        return (
          <li key={c.id} className="flex gap-3">
            {/* riel */}
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid h-8 w-8 flex-none place-items-center rounded-full text-xs font-black",
                  up ? "bg-ok/15 text-ok" : "bg-bad/12 text-bad",
                )}
              >
                {up ? `+${c.delta}` : c.delta}
              </span>
              {i < history.length - 1 && <span className="w-px flex-1 bg-border" />}
            </div>

            <div className="flex-1 pb-5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="inline-flex items-center gap-1.5 text-sm font-bold tabular-nums text-ink">
                  {c.before}
                  <ArrowRight size={14} className="text-muted" />
                  {c.after}
                </span>
                <span className="text-xs text-muted">·</span>
                <span className="text-sm font-semibold text-ink">{c.user.name}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted">{formatDateTime(c.createdAt)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
