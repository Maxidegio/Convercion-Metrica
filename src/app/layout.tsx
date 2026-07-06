import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAFERSA · Control de Stock",
  description: "Sistema interno de control de stock de MAFERSA S.A.I.C.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
