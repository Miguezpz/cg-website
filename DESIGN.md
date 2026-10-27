# Design · Gis y acero

> Dirección visual de Control Gravedad, elegida en T1.2 (2026-10-19). Los tokens viven 1:1 en `src/styles/global.css` (`@theme`). **El acento vino sale de la guía de marca** (*Brand Guidelines Vol. 1*, 2026-10-25, spec D-10); sus hex están por confirmar con el diseñador. Si cambian, se editan solo los valores de este documento y de `@theme`; ningún componente usa colores sueltos.
>
> Jerarquía: `spec-drive.md` > este documento > Impeccable > Emil. El contrato de dirección completo está en `.impeccable/surfaces/src-pages-index-astro.md`.

## Idea

La página está hecha del material del entrenamiento, no de metáforas: **acero negro mate** (las barras), **magnesia** (el gis que cubre las manos) y **concreto** (el parque). La estructura la llevan la barra y las marcas de gis. Se rechazan la foto a sangre con tarjetas de precio del "gym oscuro" y cualquier efecto neón.

**Escena de uso:** alguien de 18–40 años que ve su móvil de noche, desde la bio de Instagram. Por eso el fondo es oscuro, y las secciones de concreto claro dan respiro y ritmo.

## Color

Estrategia **contenida**: neutros de acero y concreto más un solo acento, el **vino** de la marca, en **dos niveles** (2026-10-26, guía de marca: «intense wine red glows… for highlights and depth on dark surfaces»):

1. **Vino relleno (`signal`) = acción.** Solo botones, selección y el foco sobre concreto. Ningún otro elemento lleva un relleno vino, para que el CTA siga siendo lo único vino y sólido de la pantalla.
2. **Vino claro = significado.** `signal-glow` en trazos finos y cifras que **significan** algo (las semanas de carga, los números de los pasos, el progreso de scroll y la sección activa del menú). En los dos momentos clave, el Hero y el cierre «Empieza hoy», **una** palabra del título va en vino claro: «gravedad» (Hero, prop `accent`) y «hoy» (cierre, `mark.accent`); su trazo de gis sigue en gis. Nunca en texto de lectura ni en más títulos.

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
| `signal-glow` | `#e0707f` | Vino claro para dibujar sobre acero: foco, cursor, checkbox, enlace en hover, canto del CTA (6.2:1 sobre `steel-950`, 5.7:1 sobre `steel-900`) |
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
- **Cantos de metal:** bordes de 1–2 px en `steel-700`. No hay sombras decorativas; la profundidad sale del contraste entre `steel-950` y `steel-900`. Tampoco hay resplandores ni gradientes: el acero, el concreto y el gis son mate y de canto duro, y un halo difuso los vuelve genéricos. **Única excepción:** el canto interior vino de 1 px del botón primario (`shadow-glow`), que le da al CTA el contraste de 3:1 que el vino solo no tiene sobre el acero.
- **Barra:** elemento horizontal de acero (2–6 px de alto) que cruza el ancho completo. Es el separador del sistema y el soporte del calendario Carga & Descarga.
- **Gis:** trazos en SVG con un filtro de grano (`feTurbulence`) en color `chalk`. Sirven para subrayar y contar (marcas de 4+1). Su opacidad imita el polvo y su trazo es irregular, nunca un trazo vectorial limpio.
- **Fotos:** con tratamiento real, sin duotono neón. Mientras no haya fotos, cada hueco tiene la proporción final, fondo `steel-900`, un canto `steel-700` y una etiqueta visible `[[PENDIENTE]]`.
- **Íconos:** SVG propios de trazo uniforme (WhatsApp, Instagram, TikTok, menú). No se usan emojis ni glifos Unicode como íconos.
- **Logos de terceros:** la «G» de Google junto a cada reseña de Google Maps (`GoogleLogo`, 2026-10-26) conserva sus cuatro colores oficiales, que no son parte de la paleta ni se usan en nada más. Va sobre un círculo `chalk` de 24 px para leerse sobre el acero, y es decorativa: el texto «Reseña en Google Maps» ya lo dice.

## Componentes

- **Botón primario:** fondo `signal`, texto `chalk`, `text-label`, alto mínimo 52 px, ícono de WhatsApp a la izquierda, canto interior de 1 px en `signal-glow` (`shadow-glow`). Hover: `signal-strong` (el canto no cambia: `box-shadow` no se anima). Active: `scale(0.97)` en 160 ms. Foco: contorno `signal-glow` de 2 px con separación de 3 px. Disabled: 50 % de opacidad y `cursor: not-allowed`.
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
- El texto de apoyo sube escalonado 60 ms: entrada, ciudad, botones, enlace online e indicadores (`--duration-enter` 520 ms).
- En escritorio, la foto cuelga de la barra y se asienta con una oscilación amortiguada de ±2° (`--duration-swing` 1.6 s).
- El `h1` y la imagen nunca se ocultan, para no retrasar el LCP.

**Ligado al scroll** (CSS `animation-timeline`, sin JS):

- `.ledge`: los títulos suben desde una cornisa invisible en su borde inferior (`translate` + `clip-path`).
- `.rise`: listas, tarjetas, FAQ y formulario suben 1.5 rem mientras entran.
- `.steel-bar` (componente `SteelBar`): las barras de 6 px de cada bloque se trazan al cruzar la parte baja de la pantalla.
- `.reveal-photo` + `.parallax`: la foto del coach se descubre hacia arriba desde su barra y se mueve más lento que la página.
- `.hero-parallax` / `.hero-lift`: al salir de pantalla, la foto del Hero baja y el título se eleva.
- `.scroll-progress`: una barra vino claro (`signal-glow`) de 2 px bajo el header indica cuánto llevas de página.

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

**Atletas de gis** (`src/lib/athlete-poses.ts` + `athletes.ts`, componente `Athlete`, 2026-10-26):

- **Qué son:** siluetas atléticas de gis (relleno `chalk` al 55 %, grano suave con su propio filtro fijo en el espacio del dibujo) que hacen un ejercicio de calistenia. Son decoración: `aria-hidden`, sin texto.
- **Cómo se mueven:** cada repetición avanza **con el scroll** mientras el atleta cruza la pantalla; si el scroll se detiene, el atleta también. No hay bucles ni movimiento propio. Solo se calcula mientras está en pantalla (IntersectionObserver + `requestAnimationFrame`). Excepción: en páginas sin scroll (404) el movimiento ocurre **una sola vez** cuando el atleta se ve al 60 %.
- **Mecánica:** poses calculadas (cinemática inversa en las dominadas: las manos nunca se despegan de la barra). La misma función dibuja la pose fija en el build, así que sin JS o con movimiento reducido se ve el atleta quieto en su pose más expresiva.
- **Dónde:** pocos y **nunca dos en la misma pantalla** (lo verifica una prueba e2e a 375 y 1280 px). Con la altura actual de la landing caben tres, a unos 2000 px uno de otro, siempre junto a un título y nunca junto a un CTA, el formulario o el Hero:
  - **Dominadas** (él, de frente, 3 repeticiones): junto a «Entrena online».
  - **Fondos en paralelas** (ella, de perfil, 3 repeticiones, con la técnica correcta: piernas estiradas hacia abajo y ligeramente al frente en diagonal, puntas estiradas, y al bajar el tronco se inclina al frente unos 35°, entre 30° y 45°): junto a «Lo que dicen los alumnos». En ella, el glúteo es una curva suave de la espalda baja a la parte de atrás del muslo, nunca un círculo pegado a la cadera (también en la pistol squat de /gracias y en la ruta de skills). Va con sus proporciones: empieza a 1/4 del tronco sobre la cadera, termina a 1/3 del muslo y sobresale unas 3 unidades del tronco.
  - **Muscle-up en anillas** (él, de perfil, 2 repeticiones): en **carbón** (`tone="charcoal"`), colgado bajo «Preguntas frecuentes», que es una sección de concreto. Sigue la biomecánica del muscle-up estricto: agarre falso (la anilla en la muñeca, la mano doblada encima); jalón lento hasta el pecho, inclinado ~28° atrás y en hueco; transición corta y rápida en la que las anillas se quedan pegadas al pecho y los **codos siguen bajando** (los hombros nunca pasan por delante de la anilla; el codo siempre dobla hacia el mismo lado de la línea muñeca → hombro, así que gira con el cuerpo alrededor de la anilla en vez de voltearse hacia la espalda, al subir y al bajar), y empuje continuo hasta el bloqueo con el cuerpo vertical. Los brazos que pasan por encima del torso llevan un corte del color del fondo (como gis borrado) para que se lean; lo mismo en los fondos. Las anillas cuelgan de su correa y **se mueven**: la correa apunta siempre al centro de masa del atleta (calculado por segmentos, antropometría de Dempster), como un péndulo en equilibrio.
  - En escritorio van arriba a la derecha del título (el muscle-up, en el espacio bajo el título); en móvil, al lado del título o del texto de entrada.
- **Páginas cortas** (casi sin scroll), una sola vez al verse (`once`):
  - **404, «Aquí no hay barra»:** salta hacia una barra punteada, no la alcanza y aterriza. Con movimiento reducido queda en el aire.
  - **/gracias:** dos pistol squats (ella, de perfil) como festejo.
- **Descartados:** el atleta en la cinta de disciplinas (satura la zona del Hero) y los de «Resultados» y «Cómo funciona» (quedaban a menos de una pantalla de otro atleta).
- **Color:** gis, nunca vino (el vino es de acciones y significado).

**Ruta de skills** (`src/lib/skill-poses.ts`, sección `Skills`, 2026-10-26):

- **Qué es:** por cada skill, **una sola figura de gis** que lo hace (relleno `chalk` al 80 %, filtro de grano fijo en el espacio del dibujo, `FigureChalkFilter`, el mismo de los atletas, para que los trazos gruesos no se corten al moverse), con las mismas proporciones y trazos que los atletas, de perfil. **Ella** hace la parada de manos, el front lever y la pistol squat (proporciones de los atletas de gis, glúteo en curva y cola de caballo que siempre cuelga con la gravedad, también de cabeza); **él**, el muscle-up, la planche y el back lever. Todas van a la **misma escala** (unidades del dibujo → rem: 0.09 rem, 0.1 rem en escritorio), así que un cuerpo mide lo mismo en cualquier skill; si una figura no cabe, se reduce. Es el contenido de la sección (no decoración al margen), así que no cuenta para la regla de «uno por pantalla» de los atletas. Sin etapas, sin meta y sin cronómetro (2026-10-26).
- **Piso:** en los skills de piso (parada de manos, plancha, pistol squat) la figura se apoya en un escalón de acero (`steel-700`, 6 px) que hace de piso; colgado de la barra (muscle-up y levers) no hay escalón.
- **Biomecánica:** en el front lever, el back lever y la plancha, el ángulo del brazo se calcula para que el centro de masa (Dempster) quede en la vertical de las manos. Por eso en el tuck los brazos van casi verticales y en la posición completa se inclinan mucho más. En la plancha, el tuck avanzado lleva el muslo atrás para que la rodilla no toque el piso.
- **Pestañas:** radios nativos con aspecto de chip (canto `steel-700`; el elegido, relleno `chalk` con texto `steel-950`, nunca vino, porque el vino relleno es solo para acciones). Solo se ve el skill elegido, con `:has()`, sin JS; sin `:has()` se ven todos.
- **Posición o repeticiones** (2026-10-26): cuando la figura se ve (50 %), los skills **de posición** (parada de manos, front lever, back lever, planche) van del inicio a la posición una sola vez y se quedan; al volver a elegirlos, otra vez. Los **de repeticiones** (muscle-up, pistol squat) van en bucle: ida, vuelta por el mismo camino y 600 ms de pausa; arrancan por la vuelta, desde la pose fija que se ve sin JS, así que no hay saltos. Front lever y back lever: del tuck a la posición completa; plancha: del tuck a la completa mientras baja la cadera; parada de manos: de la tijera junta las piernas y corrige el equilibrio con las muñecas, cada vez menos; muscle-up: una repetición en barra desde colgado (jalón en arco hacia atrás con el antebrazo casi vertical, transición rápida, empuje y bloqueo), en un solo movimiento fluido: los fotogramas clave se unen con una curva de velocidad continua (Hermite monótona) y cada ángulo va en un solo sentido hasta la transición, así que no avanza «por pasos»; pistol squat: de pie, baja despacio hasta el fondo. En los levers y la plancha el ángulo del brazo se recalcula en cada cuadro con el centro de masa. Fuera de pantalla se detiene; con movimiento reducido, quieta.

**Momentos con JS** (IntersectionObserver o WAAPI, una sola vez):

- Ciclo Carga & Descarga: las marcas de gis se dibujan (`duration-draw` 900 ms) y después se trazan las barras de cada semana.
- Comparador: un vaivén de 1.6 s la primera vez que se ve, que solo mueve la imagen (`--pos` registrada con `@property`), no el valor del control. Se cancela si el usuario lo toca.
- Botón flotante: dos ondas la primera vez que aparece, y se detiene.

**Microinteracciones:**

- Presión: `scale(0.97)` en 160 ms.
- Botón primario: el ícono de WhatsApp «suena» al pasar el puntero (`animate-ring`, 520 ms).
- Botón secundario: la tiza se llena desde abajo (200 ms).
- Menú de escritorio: un indicador vino claro se desliza bajo la sección activa (`--duration-nav` 300 ms, `--ease-in-out-strong`).
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
