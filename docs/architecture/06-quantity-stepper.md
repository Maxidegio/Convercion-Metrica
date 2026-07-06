# 06 · Ajuste de cantidad — el control de flechas + input

Esta es la interacción central del sistema. Se especifica en detalle porque es lo
que más se va a usar.

## 6.1 Cómo se ve y se comporta

```
        ┌─────┐   ┌───────────┐   ┌─────┐
        │  −  │   │    42     │   │  +  │
        └─────┘   └───────────┘   └─────┘
         resta      se puede        suma
        1 unidad    escribir       1 unidad
```

- **Flecha `+`**: suma **1** a la cantidad.
- **Flecha `−`**: resta **1** a la cantidad (nunca baja de 0).
- **Campo del medio**: se puede **escribir** el número directamente (ej. borrar y
  poner `42`). Acepta solo enteros ≥ 0.

## 6.2 Reglas de comportamiento

| Situación | Comportamiento |
|-----------|----------------|
| Click en `+` | cantidad + 1, se guarda |
| Click en `−` | cantidad − 1, se guarda (bloqueado en 0) |
| Escribir un número y confirmar (Enter / salir del campo) | se fija ese valor, se guarda |
| Escribir texto no válido | se ignora / se muestra error, no se guarda |
| Mantener presionada una flecha | (opcional) auto-repetición para sumar rápido |
| Varios clicks rápidos | se agrupan (debounce) y se manda **un** ajuste al valor final |

## 6.3 UI optimista (por qué se siente instantáneo)

Cuando el usuario toca `+`, la cantidad en pantalla **cambia de inmediato**, sin
esperar al servidor. En paralelo se manda la petición:

- Si el servidor **confirma** → todo queda igual, ya se veía el valor correcto.
- Si el servidor **falla** (sin conexión, error) → la cantidad **vuelve** al
  valor anterior y se avisa con un mensaje.

Esto se implementa con TanStack Query (`useMutation` con `onMutate` /
`onError` / `onSettled`). El resultado: la app se siente rápida aunque la red no
sea perfecta.

## 6.4 Qué manda al servidor

El componente manda el **valor final deseado**, no la diferencia. Así da igual si
el usuario llegó a 42 con flechas o escribiéndolo:

```
PATCH /api/products/:id/quantity
Body: { "quantity": 42, "note": "opcional" }
```

El **servidor** hace el trabajo confiable:

1. Verifica la sesión (usuario autenticado).
2. Valida el body con Zod (`quantity` entero ≥ 0).
3. En **una transacción**:
   - lee la cantidad actual → `before`
   - actualiza `products.quantity = 42` → `after`
   - calcula `delta = after − before`
   - inserta una fila en `quantity_changes` con `before`, `after`, `delta`,
     `userId`, `note`, `createdAt`.
4. Responde con el estado final.

> Se manda el valor absoluto (no el delta) para evitar problemas de concurrencia
> simples y para que el servidor sea siempre la autoridad del `before/after`.
> El `delta` lo deduce el servidor.

## 6.5 El componente `QuantityStepper` (contrato)

Componente reutilizable, sin lógica de red adentro (se le pasa el callback):

```tsx
interface QuantityStepperProps {
  value: number;                      // cantidad actual
  min?: number;                       // por defecto 0
  max?: number;                       // opcional
  disabled?: boolean;
  onChange: (next: number) => void;   // se dispara con flechas o input
}
```

- Es **tonto** (presentacional): solo emite `onChange` con el nuevo valor.
- Quien lo usa (`useAdjustQuantity`) decide qué hacer: UI optimista + llamada al
  API.
- Reutilizable en la lista de productos y en el detalle.

## 6.6 Accesibilidad y detalles

- Botones con `aria-label` ("sumar uno", "restar uno").
- El campo es un `input` numérico enfocable; se puede usar solo con teclado
  (flechas ↑/↓ del teclado también suman/restan).
- Estados visuales claros: botón `−` deshabilitado cuando la cantidad es 0.
- Feedback de guardado discreto (un check breve o un toast solo ante error).
