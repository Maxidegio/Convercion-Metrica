export default function LoadingProductos() {
  return (
    <main className="mx-auto max-w-6xl animate-pulse px-5 py-8">
      <div className="mb-5 h-8 w-40 rounded-control bg-surface" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[74px] rounded-card border border-border bg-card" />
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-5 lg:flex-row">
        <div className="h-64 rounded-card border border-border bg-card lg:w-56 lg:flex-none" />
        <div className="min-w-0 flex-1">
          <div className="mb-4 h-11 rounded-control bg-surface" />
          <div className="rounded-card border border-border bg-card">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-border px-4 py-3.5 last:border-0">
                <div className="h-5 w-16 rounded-chip bg-surface" />
                <div className="h-5 w-14 rounded-chip bg-surface" />
                <div className="h-4 flex-1 rounded bg-surface" />
                <div className="h-8 w-28 rounded-control bg-surface" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
