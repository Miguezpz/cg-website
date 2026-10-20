# Design · Gis y acero

> Dirección visual de Control Gravedad, elegida en T1.2 (2026-10-19). Los tokens viven 1:1 en `src/styles/global.css` (`@theme`). **La paleta es provisional (spec D-10):** cuando llegue la del diseñador, se cambian solo los valores de color de este documento y de `@theme`; ningún componente usa colores sueltos.
>
> Jerarquía: `spec-drive.md` > este documento > Impeccable > Emil. El contrato de dirección completo está en `.impeccable/surfaces/src-pages-index-astro.md`.

## Idea

La página está hecha del material del entrenamiento, no de metáforas: **acero negro mate** (las barras), **magnesia** (el gis que cubre las manos) y **concreto** (el parque). La estructura la llevan la barra y las marcas de gis. Se rechazan la foto a sangre con tarjetas de precio del "gym oscuro" y cualquier efecto neón.

**Escena de uso:** alguien de 18–40 años que ve su móvil de noche, desde la bio de Instagram. Por eso el fondo es oscuro, y las secciones de concreto claro dan respiro y ritmo.

## Color

Estrategia **contenida**: neutros de acero y concreto más un solo acento. El amarillo **solo** señala acciones (CTA, foco, selección), nunca decora.

| Token | Valor | Uso |
|---|---|---|
| `steel-950` | `#0e0f10` | Fondo principal |
| `steel-900` | `#17191b` | Superficies elevadas (formulario, menú abierto) |
| `steel-700` | `#2c2f33` | Barras, cantos y bordes de 1–2 px sobre oscuro |
| `concrete-400` | `#9a9c9e` | Texto secundario sobre oscuro (6.97:1) |
| `concrete-100` | `#d9d8d4` | Fondo de las secciones claras |
| `concrete-600` | `#4a4d50` | Texto secundario sobre claro (5.96:1) |
| `chalk` | `#f3f2ee` | Texto principal sobre oscuro (17.1:1) y trazos de gis |
| `signal` | `#ffcc00` | Acción primaria; texto `steel-950` encima (12.7:1) |
| `signal-strong` | `#e6b800` | Hover/active de la acción primaria |
| `whatsapp` | `#25d366` | **Solo** el botón flotante de WhatsApp (texto `steel-950`, 9.7:1) |
| `error-on-dark` / `error-on-light` | `#ff7a66` / `#b42318` | Mensajes de error (7.5:1 / 5.9:1) |

Tailwind solo conoce estos colores (`--color-*: initial`), así que un color suelto no compila.

## Tipografía

Una sola familia, **Archivo Variable** (Fontsource, subset latino, `font-display: swap`), con dos ejes: peso (100–900) y ancho (62–125 %). El ancho separa las dos voces:

| Rol | Token | Ancho | Peso | Notas |
|---|---|---|---|---|
| Display (h1) | `text-display` · `stretch-display` | 62 % | 900 | MAYÚSCULAS, interlineado 0.88, `clamp(3.5rem, 15vw, 6rem)` |
| Sección (h2) | `text-h2` · `stretch-display` | 62 % | 800 | MAYÚSCULAS, `clamp(2.5rem, 9vw, 4.5rem)` |
| Subtítulo (h3) | `text-h3` · `stretch-heading` | 75 % | 700 | 1.5rem |
| Entrada | `text-lede` · `stretch-body` | 100 % | 400 | |
| Texto | `text-body` · `stretch-body` | 100 % | 400 | 17px / 1.55, medida máx. `max-w-prose` (65ch) |
| Etiqueta | `text-label` · `stretch-label` | 87.5 % | 600 | MAYÚSCULAS +0.04em; para botones, precios y datos. **Nunca** como "eyebrow" sobre un título |

Las cifras de precios usan `tabular-nums`.

## Material y forma

- **Esquinas rectas** (`radius-none`). Los campos de formulario llevan `radius-input` (2 px).
- **Cantos de metal:** bordes de 1–2 px en `steel-700`. No hay sombras decorativas; la profundidad sale del contraste entre `steel-950` y `steel-900`.
- **Barra:** elemento horizontal de acero (2–6 px de alto) que cruza el ancho completo. Es el separador del sistema y el soporte del calendario Carga & Descarga.
- **Gis:** trazos en SVG con un filtro de grano (`feTurbulence`) en color `chalk`. Sirven para subrayar, contar (marcas de 4+1) y señalar dónde van las manos. Su opacidad imita el polvo y su trazo es irregular, nunca un trazo vectorial limpio.
- **Fotos:** con tratamiento real, sin duotono neón. Mientras no haya fotos, cada hueco tiene la proporción final, fondo `steel-900`, un canto `steel-700` y una etiqueta visible `[[PENDIENTE]]`.
- **Íconos:** SVG propios de trazo uniforme (WhatsApp, Instagram, TikTok, menú). No se usan emojis ni glifos Unicode como íconos.

## Componentes

- **Botón primario:** fondo `signal`, texto `steel-950`, `text-label`, alto mínimo 52 px, ícono de WhatsApp a la izquierda. Hover: `signal-strong`. Active: `scale(0.97)` en 160 ms. Foco: contorno `signal` de 2 px con separación de 3 px. Disabled: 50 % de opacidad y `cursor: not-allowed`.
- **Botón secundario:** sin relleno, canto de 2 px en `chalk`, texto `chalk`. Hover: relleno `chalk` y texto `steel-950`.
- **Botón flotante de WhatsApp:** círculo de 56 px en `whatsapp`, abajo a la derecha, respetando `safe-area-inset-bottom`.
- **Enlace:** subrayado de 1 px separado 0.2em; hover en `chalk`.
- **Planes:** filas sobre la barra, **no** tarjetas iguales. Cada fila lleva el nombre, el detalle y el precio tabular alineado a la derecha.

## Espacio y retícula

- Margen lateral `gutter` (16 px) en móvil; contenedor `max-w-content` (72rem) en escritorio.
- Separación entre secciones `section`: `clamp(4.5rem, 12vw, 8rem)`. Siempre hay más aire sobre un título que debajo.
- Objetivos táctiles de 44 px como mínimo (`tap-min`).

## Movimiento · «Peso y control»

> Reemplaza la regla anterior de "un solo momento propio" a pedido del usuario (2026-10-19): la página debe sentirse viva. El código está en `src/styles/motion.css`.

**Gramática: nada aparece de la nada.** Las piezas suben desde detrás de una barra, las barras de acero se trazan y la magnesia cae con la gravedad. El movimiento es vertical y con peso; no hay fundidos sueltos ni deslizamientos laterales.

**Entrada del Hero** (una vez, al cargar):

- La barra se traza de izquierda a derecha en 700 ms (`scale` desde la izquierda).
- Las marcas de agarre aparecen a los 420 ms (opacidad, escala y desenfoque) y sueltan 14 partículas de magnesia. Las partículas saltan un poco y luego caen acelerando, en 1.3 s.
- El texto de apoyo sube escalonado 60 ms: entrada, ciudad, botones, enlace online e indicadores (`--duration-enter` 520 ms).
- En escritorio, la foto cuelga de la barra y se asienta con una oscilación amortiguada de ±2° (`--duration-swing` 1.6 s).
- El `h1` y la imagen nunca se ocultan, para no retrasar el LCP.

**Ligado al scroll** (CSS `animation-timeline`, sin JS):

- `.ledge`: los títulos suben desde una cornisa invisible en su borde inferior (`translate` + `clip-path`).
- `.rise`: listas, filas de precios, tarjetas, FAQ y formulario suben 1.5 rem mientras entran.
- `.steel-bar` (componente `SteelBar`): las barras de 6 px de cada bloque se trazan al cruzar la parte baja de la pantalla. La inferior de la Oferta se traza de derecha a izquierda.
- `.reveal-photo` + `.parallax`: la foto del coach se descubre hacia arriba desde su barra y se mueve más lento que la página.
- `.hero-parallax` / `.hero-lift`: al salir de pantalla, la foto del Hero baja y el título se eleva.
- `.chalk-underline`: el subrayado de gis de la Oferta se dibuja con el scroll.
- `.scroll-progress`: una barra de gis de 2 px bajo el header indica cuánto llevas de página.

**Momentos con JS** (IntersectionObserver o WAAPI, una sola vez):

- Ciclo Carga & Descarga: las marcas de gis se dibujan (`duration-draw` 900 ms) y después se trazan las barras de cada semana.
- Comparador: un vaivén de 1.6 s la primera vez que se ve, que solo mueve la imagen (`--pos` registrada con `@property`), no el valor del control. Se cancela si el usuario lo toca.
- Botón flotante: dos ondas la primera vez que aparece, y se detiene.

**Microinteracciones:**

- Presión: `scale(0.97)` en 160 ms.
- Botón primario: el ícono de WhatsApp «suena» al pasar el puntero (`animate-ring`, 520 ms).
- Botón secundario: la tiza se llena desde abajo (200 ms).
- Menú de escritorio: un indicador se desliza bajo la sección activa (`--duration-nav` 300 ms, `--ease-in-out-strong`).
- FAQ: abren y cierran con altura animada (`::details-content` + `interpolate-size`, 280 ms) y la respuesta sube al abrir.
- Menú móvil: entra en 200 ms con `@starting-style` y los enlaces escalonados 40 ms; se cierra al instante.
- Mensajes del formulario: suben al aparecer.

**Reglas:**

- Solo se anima `transform` (translate, scale, rotate), `clip-path`, `opacity` y el trazo de SVG.
- Nada en bucle infinito.
- El hover solo se aplica con puntero fino.
- Todo está dentro de `prefers-reduced-motion: no-preference`; con movimiento reducido no hay ninguna animación.
- Sin soporte de animaciones ligadas al scroll, la página se ve completa y quieta.
- ⚠️ En `motion.css`, lo ligado al scroll va en propiedades sueltas y sin `animation-duration`. Si no, Lightning CSS las fusiona en `animation: … view()`, que ningún navegador acepta, y la animación desaparece.

## Superficies del navegador

Selección en `signal` con texto `steel-950`, cursor de texto `signal`, scrollbar en `steel-700` sobre `steel-950`, foco visible en `signal` y `color-scheme: dark`.
