# Catálogo inicial de productos

Datos extraídos de **`MAFERSA — Lista de Precios Junio 2026`** (PDF). Se usaron
**solo** los datos del producto: marca, código interno (CÓD.MAF), código de
fábrica (CÓD.FÁBRICA) y descripción. **El precio se descartó** a propósito. Se
agrega el campo `stock`, inicializado en `0`, para completar en el sistema.

## Archivos

| Archivo | Uso |
|---------|-----|
| `products.json` | Fuente para el **seed** de la base de datos (FASE 2). |
| `products.csv` | Misma data en planilla, para revisión humana / import manual. |

## Estructura de cada producto

```json
{
  "brand": "STANLEY",          // Marca
  "internalCode": "15425",     // CÓD.MAF (código interno, único)
  "factoryCode": "10-789",     // CÓD.FÁBRICA (código de fábrica)
  "name": "Cuchillas Retráctiles",  // Descripción
  "quantity": 0                // Stock (a completar)
}
```

## Resumen de la extracción

- **3.536 productos** únicos.
- **15 marcas:** STANLEY (1.067), DANLY (408), PROTO (327), EKLIND (308),
  MENLO (296), TWILL (281), HANSON (266), NICHOLSON (209), IRWIN (177),
  BLU-MOL (130), PRYOR (25), H.K.PORTER (17), BERZOMATIC (13), PROSNIP (2), y
  algunos sin marca detectada.
- Cobertura de códigos: ~99,7 % tiene código interno, ~98,2 % tiene código de
  fábrica. Los faltantes son productos que en la lista original ya venían con un
  solo código.

## Notas

- La extracción se hizo por posición de columnas del PDF. Puede requerir un
  repaso manual de unos pocos registros (nombres muy largos o filas de
  encabezado de sección). Es una base muy sólida para arrancar y se puede
  corregir/editar desde el propio sistema una vez cargado.
- El conteo del portal actual de MAFERSA muestra ~3.408 productos; la diferencia
  (~128) se debe a variantes/subfilas y se puede depurar al importar.
