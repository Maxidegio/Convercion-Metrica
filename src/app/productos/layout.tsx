import { AppHeader } from "@/components/layout/app-header";

export default function ProductosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <AppHeader />
      {children}
    </div>
  );
}
