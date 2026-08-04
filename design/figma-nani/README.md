# Componentes de diseño — Nani (export de Figma)

Rescatados de `~/Downloads/KIDS SuperApp Diseño Móvil/` para que no se pierdan.
Corresponden al ítem **A3** de `PRIORIZACION_NANI.md`.

## Estado: preservados, NO integrados

Están **fuera de `src/`** a propósito. El build del proyecto es `tsc && vite build`
sobre `src/`, y estos archivos no compilan tal como vienen. Meterlos en `src/`
rompería el build hoy, sin ganar nada: la integración es el ítem **D4**, que
espera feedback de testers.

Se conservan **verbatim**, sin retoques, para no perder detalle del diseño.

## Inventario

| Archivo | Líneas | Qué es |
|---|---|---|
| `NaniAvatar.tsx` | 53 | Avatar animado de Nani (nube + cara, con estados) |
| `FloatingNaniButton.tsx` | 33 | Botón flotante para invocar el chat |
| `ChatNani.tsx` | 177 | Pantalla de chat con sugerencias rápidas |

## Qué hay que arreglar para integrarlos (D4)

1. **`motion/react` no está instalado.** Los tres archivos animan con esa
   librería. Hace falta `npm i motion`, o reescribir las animaciones con
   Tailwind / CSS.
2. **`lucide-react@0.487.0` es sintaxis de export de Figma**, no un
   especificador válido de npm. Debe quedar en `lucide-react` (ya instalado).
3. **Rutas relativas.** `ChatNani.tsx` importa `../NaniAvatar`, `../ui/button` y
   `../ui/input`; al mover los archivos a `src/components/` hay que ajustarlas.
4. **Duplicación con `Chat.tsx`.** La app ya usa `src/components/Chat.tsx`, que
   es el que habla con `/api/chat` y tiene la memoria persistente. `ChatNani.tsx`
   es solo la capa visual: hay que trasplantar el diseño a `Chat.tsx`, no
   sustituir un componente por el otro (ese error ya produjo el código muerto
   que se borró en C5).

## Origen

`~/Downloads/KIDS SuperApp Diseño Móvil/src/components/` — carpeta con fecha
30 oct 2025, sin control de versiones. Esa carpeta contiene además pantallas
`Explorar`, `Home`, `Momentos`, `Herramientas`, `Splash` y los onboardings, que
**sí** tienen equivalente ya construido en `src/components/`; no se copiaron
para no crear ambigüedad sobre cuál es la versión viva.
