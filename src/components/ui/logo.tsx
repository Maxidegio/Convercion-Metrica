import { cn } from "@/lib/utils";

/** Logo MAFERSA — texto dorado sobre caja oscura con "S.A.I.C.". */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-end gap-1 rounded-[12px] bg-[#0B0D12] px-2.5 py-1.5 leading-none shadow-pop",
        className,
      )}
    >
      <b className="text-2xl font-black tracking-tight text-gold">MAFERSA</b>
      <small className="-translate-y-0.5 text-[0.5rem] font-extrabold tracking-wider text-gold">
        S.A.I.C.
      </small>
    </span>
  );
}
