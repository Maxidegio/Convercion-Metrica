# 08 · Sistema de diseño (estética MAFERSA)

La interfaz replica la **estética del portal actual de MAFERSA**
(`mafersa.maximo.click`): chrome **navy oscuro**, acento **amarillo/dorado**,
contenido en **tarjetas blancas**, tipografía **bold geométrica** y esquinas
redondeadas. Industrial, sobrio y con mucha presencia de marca.

> Referencia tomada de las capturas del portal (login + listado de productos).

## 8.1 Paleta de colores (tokens)

```css
/* Marca */
--gold-500: #F5C518;   /* dorado principal (logo, acentos, activo) */
--gold-600: #E0A800;   /* hover del dorado */
--gold-050: #FEFCE8;   /* tinte suave para filas seleccionadas/hover */

/* Navy (chrome: header, sidebar, botón primario) */
--navy-900: #0F1626;   /* fondo más profundo */
--navy-800: #161F33;   /* header / botón primario */
--navy-700: #1E2A44;   /* superficies elevadas sobre navy */

/* Neutros de contenido */
--white:    #FFFFFF;   /* tarjetas y superficies de contenido */
--slate-50: #F8FAFC;   /* fondo de contenido / chip CÓD.MAF */
--slate-200:#E2E8F0;   /* bordes */
--slate-500:#64748B;   /* texto secundario / labels */
--ink:      #1B2337;   /* texto principal (navy casi negro) */

/* Código de fábrica (chip azul) */
--blue-050: #EFF4FF;
--blue-600: #2563EB;

/* Estados */
--success: #16A34A;
--warning: #D97706;   /* stock bajo */
--danger:  #DC2626;   /* stock agotado */
```

### Uso del color

- **Dorado** = marca y foco: logo, número de paso activo, borde de input
  enfocado, íconos activos, badges. Se usa con moderación (acento, no fondo
  masivo).
- **Navy** = estructura: barra superior, panel lateral, botón primario, títulos.
- **Blanco** = contenido: la lista de productos y los formularios viven en
  tarjetas blancas sobre el navy.
- **Semáforo de stock:** verde (ok), ámbar (bajo), rojo (agotado) — aplicado al
  número de stock y a badges.

## 8.2 Tipografía

- **Familia:** sans geométrica bold. Recomendado **Inter** (o **Poppins** para un
  aire más redondeado), con fallback del sistema.
- **Títulos / logo:** peso 800, mayúsculas.
- **Labels de formulario y encabezados de tabla:** mayúsculas, `letter-spacing`
  ~0.08em, peso 600, color `--slate-500` (ej. `RAZÓN SOCIAL`, `CÓD.MAF`,
  `DESCRIPCIÓN`).
- **Cuerpo:** peso 400–500, color `--ink`.

## 8.3 Formas y elevación

| Elemento | Radio | Notas |
|----------|-------|-------|
| Tarjetas / paneles | 20–24px | sombra suave, baja opacidad |
| Inputs | 10–12px | borde `--slate-200`; enfocado → borde `--gold-500` |
| Botones | 12px | primario navy, texto blanco bold |
| Chips de código | 8px | ver abajo |
| Pill de marca | 8px | fondo navy/negro, texto dorado |

- **Sombra estándar:** `0 10px 30px rgba(15,22,38,.08)`.
- Mucho **espacio en blanco**; densidad cómoda, no apretada.

## 8.4 Componentes clave

### Botón primario
Fondo `--navy-800`, texto blanco peso 700, radio 12px, con flecha `→` opcional.
Ej.: **"Ingresar al portal →"**. Hover: leve aclarado + sombra.

### Input de texto
Blanco, borde `--slate-200`, radio 12px, placeholder `--slate-500`. Enfocado:
borde `--gold-500` + halo dorado tenue. Label arriba en mayúsculas.

### Chip de código
- **CÓD.MAF (interno):** fondo `--slate-50`, texto `--ink`, radio 8px, monoespaciado.
- **CÓD.FÁBRICA:** fondo `--blue-050`, texto `--blue-600`, radio 8px, monoespaciado.

### Pill de marca
Fondo navy/negro, texto **dorado** en mayúsculas, radio 8px (ej. `STANLEY`).
Opcional, un cuadradito con el logo de la marca al lado.

### Fila de la lista
Sobre tarjeta blanca; alterna con `--slate-50` muy sutil. Hover/seleccionada:
tinte `--gold-050`. Borde inferior `--slate-200`.

### QuantityStepper (control de stock) — pieza estrella
```
┌─────┐  ┌──────────┐  ┌─────┐
│  −  │  │    12    │  │  +  │
└─────┘  └──────────┘  └─────┘
```
- Botones `−`/`+` cuadrados, radio 10px, borde `--slate-200`; al presionar, fondo
  `--gold-050` y borde `--gold-500`.
- Campo central editable, numérico, centrado, peso 700.
- El número toma color de semáforo según el stock (ok/bajo/agotado).
- Feedback discreto al guardar (check breve); toast solo ante error.

## 8.5 Layout del sistema (interno de stock)

A diferencia del portal de pedidos (wizard de compra), nuestro sistema es de
**control interno de stock**, pero comparte el mismo lenguaje visual:

```
┌───────────────────────────────────────────────────────────┐
│  [MAFERSA logo]      Buscar…            [usuario ▾] Salir   │  ← header navy
├──────────┬────────────────────────────────────────────────┤
│  MARCAS  │   Productos                     3.536 items     │
│  ▸ STANLEY│  ┌──────────────────────────────────────────┐  │
│  ▸ PROTO  │  │ marca │ CÓD.MAF │ CÓD.FÁB │ desc │ STOCK  │  │  ← tarjeta blanca
│  ▸ IRWIN  │  │ [pill]│ [chip]  │ [chip]  │ ...  │ [−12+] │  │
│  ▸ …      │  └──────────────────────────────────────────┘  │
└──────────┴────────────────────────────────────────────────┘
```

- **Header navy** con logo, buscador y sesión (igual que el portal).
- **Panel lateral "MARCAS"** para filtrar por marca (dorado activo).
- **Contenido en tarjeta blanca**: la tabla de productos con el `QuantityStepper`
  en la última columna (reemplaza a la columna de precio del portal).
- **Buscador**: "Buscar por código, descripción o marca…", con contador de
  productos.

## 8.6 Modo oscuro

El chrome ya es oscuro (navy). Se ofrecerá además un **modo oscuro pleno** donde
las tarjetas de contenido pasan a `--navy-700` con texto claro, manteniendo el
dorado como acento. Los tokens se definen para ambos temas en FASE 2.

## 8.7 Responsive

- **Escritorio:** panel lateral + tabla completa.
- **Móvil:** el panel "MARCAS" colapsa en un botón de filtros; cada producto se
  muestra como **tarjeta** (marca + códigos + nombre + stepper), no como fila,
  para que el control `−/+` sea cómodo con el pulgar.
