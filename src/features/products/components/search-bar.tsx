"use client";

import { useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";

/** Buscador instantáneo: actualiza el query param `q` con debounce. */
export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onChange = (value: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set("q", value);
      else next.delete("q");
      next.delete("page"); // reiniciar paginación al buscar
      router.replace(`${pathname}?${next.toString()}`);
    }, 300);
  };

  return (
    <div className="relative flex-1">
      <Search
        size={18}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        defaultValue={params.get("q") ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar por código, descripción o marca…"
        className="w-full rounded-control border-[1.5px] border-border bg-card py-2.5 pl-11 pr-4 text-sm text-ink outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/20"
      />
    </div>
  );
}
