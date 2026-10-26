# Design · Gis y acero

> Dirección visual de Control Gravedad, elegida en T1.2 (2026-10-19). Los tokens viven 1:1 en `src/styles/global.css` (`@theme`). **El acento vino sale de la guía de marca** (*Brand Guidelines Vol. 1*, 2026-10-25, spec D-10); sus hex están por confirmar con el diseñador. Si cambian, se editan solo los valores de este documento y de `@theme`; ningún componente usa colores sueltos.
>
> Jerarquía: `spec-drive.md` > este documento > Impeccable > Emil. El contrato de dirección completo está en `.impeccable/surfaces/src-pages-index-astro.md`.

## Idea

La página está hecha del material del entrenamiento, no de metáforas: **acero negro mate** (las barras), **magnesia** (el gis que cubre las manos) y **concreto** (el parque). La estructura la llevan la barra y las marcas de gis. Se rechazan la foto a sangre con tarjetas de precio del "gym oscuro" y cualquier efecto neón.

**Escena de uso:** alguien de 18–40 años que ve su móvil de noche, desde la bio de Instagram. Por eso el fondo es oscuro, y las secciones de concreto claro dan respiro y ritmo.

## Color

Estrategia **contenida**: neutros de acero y concreto más un solo acento, el **vino** de la marca. El vino **solo** señala acciones (CTA, foco, selección), nunca decora.

El vino de la guía (`#6A1E2B`) se lee muy bien con texto claro encima (10.2:1), pero casi no se separa del acero (1.68:1). Por eso tiene un tono claro, `signal-glow`, para todo lo que se dibuja **directamente sobre el acero** (foco, cursor de texto, checkbox, enlaces en hover y el canto del CTA). Sobre concreto, el foco usa el vino oscuro (utilidad `on-light`, 8:1). El negro absoluto y el blanco puro de la guía se interpretan como `steel-950` y `chalk`: en OLED se ven igual y evitan el corrido del negro puro al hacer scroll.

| Token | Valor | Uso |
|---|---|---|
| `steel-950` | `#0e0f10` | Fondo principal |
| `steel-900` | `#17191b` | Superficies elevadas (formulario, menú abierto) |
| `steel-700` | `#2c2f33` | Barras, cantos y bordes de 1–2 px sobre oscuro |
| `concrete-400` | `#9a9c9e` | Texto secundario sobre oscuro (6.97:1) |
| `concrete-100` | `#d9d8d4` | Fondo de las secciones claras |
| `concrete-600` | `#4a4d50` | Texto secundario sobre claro (5.96:1) |
| `chalk` | `#f3f2ee` | Texto principal sobre oscuro (17.1:1) y trazos de gis |
| `signal` | `#6a1e2b` | *Deep Wine Red.* Acción primaria; texto `chalk` encima (10.2:1). Foco sobre concreto (8:1) |
| `signal-strong` | `#4f111e` | *Deep Burgundy.* Hover/active de la acción primaria (texto `chalk`, 13.1:1) |
| `signal-glow` | `#e0707f` | Vino claro para dibujar sobre acero: foco, cursor, checkbox, enlace en hover, canto y halo del CTA (6.2:1 sobre `steel-950`, 5.7:1 sobre `steel-900`) |
| `whatsapp` | `#25d366` | **Solo** el botón flotante de WhatsApp (texto `steel-950`, 9.7:1) |
| `error-on-dark` / `error-on-light` | `#ffa057` / `#b42318` | Mensajes de error (9.5:1 / 5.9:1). El de oscuro es naranja para no confundirse con `signal-glow` |

Tailwind solo conoce estos colores (`--color-*: initial`), así que un color suelto no compila.

## Tipografía

Una sola familia, **Readex Pro Variable** (Fontsource, subset latino, solo eje de peso 160–700, `font-display: swap`, 31 KB), elegida por el usuario el 2026-10-25 en lugar de Archivo. Readex es una geométrica ancha **sin eje de ancho**, así que las dos voces se separan solo por tamaño, peso, mayúsculas y tracking: los titulares van en MAYÚSCULAS con el tracking cerrado, y el texto en minúsculas con tracking normal. Su peso máximo es 700, por eso todos los titulares usan `font-bold`.

| Rol | Token | Peso | Notas |
|---|---|---|---|
| Display (h1) | `text-display` | 700 | MAYÚSCULAS, interlineado 0.95, tracking −0.03em, `clamp(2.625rem, 12.5vw, 5.25rem)` |
| Sección (h2) | `text-h2` | 700 | MAYÚSCULAS, interlineado 1, tracking −0.02em, `clamp(2rem, 8vw, 3.75rem)` |
| Subtítulo (h3) | `text-h3` | 700 | 1.5rem |
| Entrada | `text-lede` | 400 | |
| Texto | `text-body` | 400 | 17px / 1.55, medida máx. `max-w-prose` (65ch) |
| Etiqueta | `text-label` | 600 | MAYÚSCULAS +0.02em; para botones, precios y datos. **Nunca** como "eyebrow" sobre un título |

La escala de titulares es más chica que la que tenía Archivo extracondensada: con Readex, «GRAVEDAD» tiene que caber en 288 px (pantalla de 320 px).

Las cifras de precios usan `tabular-nums`.

**Letra a mano (segunda familia, RNF-05):** **Kalam 400**, recortada a los caracteres del español (14 KB, `src/assets/fonts/kalam-es-400.woff2`). Solo se usa en las anotaciones de gis (`ChalkNote`, token `--font-hand`), siempre **informativas**: nunca afirmaciones nuevas. Se aplica cuando la nota está a una pantalla de distancia (`[data-near]`), para que no compita con el LCP; sin JS se aplica desde el inicio. Para regenerarla: `pyftsubset kalam-latin-400-normal.woff2 --flavor=woff2 --unicodes="U+0020-007E,U+00A0-00A1,U+00B7,U+00BF,U+00C1,U+00C9,U+00CD,U+00D1,U+00D3,U+00D7,U+00DA,U+00DC,U+00E1,U+00E9,U+00ED,U+00F1,U+00F3,U+00FA,U+00FC,U+2013-2014,U+2018-2019,U+201C-201D,U+2026,U+2192"`.

## Material y forma

- **Esquinas rectas** (`radius-none`). Los campos de formulario llevan `radius-input` (2 px).
- **Cantos de metal:** bordes de 1–2 px en `steel-700`. No hay sombras decorativas; la profundidad sale del contraste entre `steel-950` y `steel-900`. **Única excepción:** el resplandor vino del botón primario (`shadow-glow`), que pide la guía de marca («intense wine red glows») y que además le da al CTA el canto de 3:1 que el vino solo no tiene sobre el acero.
- **Barra:** elemento horizontal de acero (2–6 px de alto) que cruza el ancho completo. Es el separador del sistema y el soporte del calendario Carga & Descarga.
- **Gis:** trazos en SVG con un filtro de grano (`feTurbulence`) en color `chalk`. Sirven para subrayar, contar (marcas de 4+1) y señalar dónde van las manos. Su opacidad imita el polvo y su trazo es irregular, nunca un trazo vectorial limpio.
- **Fotos:** con tratamiento real, sin duotono neón. Mientras no haya fotos, cada hueco tiene la proporción final, fondo `steel-900`, un canto `steel-700` y una etiqueta visible `[[PENDIENTE]]`.
- **Íconos:** SVG propios de trazo uniforme (WhatsApp, Instagram, TikTok, menú). No se usan emojis ni glifos Unicode como íconos.

## Componentes

- **Botón primario:** fondo `signal`, texto `chalk`, `text-label`, alto mínimo 52 px, ícono de WhatsApp a la izquierda, canto interior de 1 px y halo en `signal-glow` (`shadow-glow`). Hover: `signal-strong` (el halo no cambia: `box-shadow` no se anima). Active: `scale(0.97)` en 160 ms. Foco: contorno `signal-glow` de 2 px con separación de 3 px. Disabled: 50 % de opacidad y `cursor: not-allowed`.
- **Botón secundario:** sin relleno, canto de 2 px en `chalk`, texto `chalk`. Hover: relleno `chalk` y texto `steel-950`.
- **Botón flotante de WhatsApp:** círculo de 56 px en `whatsapp`, abajo a la derecha, respetando `safe-area-inset-bottom`.
- **Enlace:** subrayado de 1 px separado 0.2em; hover en `chalk` (en el formulario, `signal-glow`).
- **Servicio:** bloque sobre la barra, **no** tarjetas iguales: a la izquierda nombre, para quién es y qué incluye; a la derecha el CTA, una anotación de gis y el recuadro «¿Necesitas algo más personalizado?» (`steel-900` con canto `steel-700`). Sin precios publicados (spec §17.1.2).

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
- `.rise`: listas, tarjetas, FAQ y formulario suben 1.5 rem mientras entran.
- `.steel-bar` (componente `SteelBar`): las barras de 6 px de cada bloque se trazan al cruzar la parte baja de la pantalla.
- `.reveal-photo` + `.parallax`: la foto del coach se descubre hacia arriba desde su barra y se mueve más lento que la página.
- `.hero-parallax` / `.hero-lift`: al salir de pantalla, la foto del Hero baja y el título se eleva.
- `.scroll-progress`: una barra de gis de 2 px bajo el header indica cuánto llevas de página.

**Gis vivo** (`src/lib/chalk.ts` + `ChalkMark`, 2026-10-24):

- **Trazos a mano:** los SVG con `[data-chalk]` se dibujan la primera vez que entran en pantalla, trazo por trazo (110 ms de separación). Variantes: subrayado, doble subrayado, círculo, palomita, marcas de conteo y flechas.
- **Títulos marcados:** cada sección marca una palabra con un trazo distinto (círculo en «online» y «hoy», subrayado en «Augusto», «funciona» y «alumnos», doble en «Resultados» y «frecuentes»). El trazo usa el color del título (gis sobre acero, carbón sobre concreto).
- **Nube de magnesia:** al tocar cualquier enlace de WhatsApp saltan 12 partículas desde el punto exacto y caen (WAAPI, < 1.2 s). Con teclado no hay nube.
- **Palomitas:** cada campo bien llenado y el envío exitoso reciben una palomita de gis; la pregunta abierta de la FAQ se subraya (`.chalk-on-show`).
- **Anotaciones a mano** (`ChalkNote`): primero se dibuja la flecha y luego el texto «se escribe» de izquierda a derecha.
- **Grano:** textura estática de pizarrón/concreto detrás del contenido (`--grain`, utilidad `grain`). No se mueve ni toca el contraste.
- ⚠️ Sin `vector-effect: non-scaling-stroke` en trazos animados: con él, `pathLength` deja de normalizar y la línea queda cortada al estirarse. Y los SVG con posición absoluta necesitan ancho y alto explícitos: con solo `left`/`right` toman el ancho de su `viewBox`.

**Contar el método** (2026-10-24):

- **Línea entre pasos:** una línea de gis une 1 → 2 → 3 y avanza con el scroll (vertical en móvil, horizontal con flecha en escritorio).
- **Ciclo interactivo:** cada semana es un radio nativo. Al elegirla, las demás se atenúan (solo lo decorativo) y se resalta su enfoque, con `:has()`, sin JS.
- **Cinta de disciplinas:** dos filas en sentidos opuestos que se desplazan **solo** con el scroll (no es un bucle automático).
- **Cambio de página:** View Transitions entre documentos (240 ms); el header persiste (`view-transition-name: site-header`).

**Firma del Hero** (`src/lib/hero-physics.ts`, solo con puntero fino):

- **El título siente la gravedad:** al pasar el puntero, las letras cercanas se hunden (hasta 0.14em) y se inclinan como una cuerda; vuelven con un resorte. Se parten en letras al primer contacto, con `aria-label` en el `h1`.
- **La foto colgante responde:** en escritorio se balancea hacia el puntero (±2.2°) y, al salir, oscila como un péndulo hasta detenerse.

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

Selección en `signal` con texto `chalk`, cursor de texto `signal-glow`, scrollbar en `steel-700` sobre `steel-950`, foco visible en `signal-glow` (en `signal` dentro de las secciones `on-light`) y `color-scheme: dark`.
