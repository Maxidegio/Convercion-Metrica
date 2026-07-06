import type { Config } from "tailwindcss";

/**
 * Sistema de diseño MAFERSA.
 * Los colores de "chrome" (navy) y marca (dorado) son constantes en ambos temas.
 * Las superficies de contenido se resuelven vía CSS variables (ver globals.css)
 * para soportar modo claro/oscuro con `data-theme`.
 */
const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Marca
        gold: {
          DEFAULT: "#F5C518",
          600: "#E0A800",
          50: "#FEFCE8",
        },
        navy: {
          900: "#0F1626",
          800: "#161F33",
          700: "#1E2A44",
        },
        brandblue: {
          50: "#EFF4FF",
          600: "#2563EB",
        },
        // Semánticos (independientes del acento)
        ok: "#16A34A",
        warn: "#D97706",
        bad: "#DC2626",
        // Superficies temáticas (via CSS vars)
        card: "var(--card)",
        surface: "var(--surface)",
        border: "var(--border)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        chip: "var(--chip)",
      },
      borderRadius: {
        card: "20px",
        control: "12px",
        chip: "8px",
      },
      boxShadow: {
        card: "0 10px 30px rgba(15,22,38,.08)",
        pop: "0 30px 70px rgba(0,0,0,.45)",
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', "Arial", "system-ui", "sans-serif"],
        mono: ['"SF Mono"', "ui-monospace", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
