---
target: landing completa (src/pages/index.astro)
total_score: 25
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
target_identity: "file:/Users/jonathan/Documents/Programming/experimentacion/cgwebsite/src/pages/index.astro"
target_fingerprint: "sha256:9686dbdd8a96c602622b0ef2c9001fbf83f6ded0561675c6cec985d61245d2bb"
target_path: /Users/jonathan/Documents/Programming/experimentacion/cgwebsite/src/pages/index.astro
timestamp: 2026-10-19T22-45-52Z
slug: src-pages-index-astro
---
⚠️ DEGRADED: single-context (la política de la sesión no permite subagentes sin pedido explícito del usuario)

## Design Health Score
| # | Heurística | Nota | Hallazgo |
|---|---|---|---|
| 1 | Visibilidad del estado | 3 | Estados del formulario claros; la navegación no marca la sección activa |
| 2 | Lenguaje del mundo real | 3 | Español natural y términos de la marca (clase muestra, Carga & Descarga) |
| 3 | Control y libertad | 3 | Menú con Esc; el carrusel de testimonios no indica que hay más |
| 4 | Consistencia | 3 | Cinco textos distintos para la misma acción de WhatsApp |
| 5 | Prevención de errores | 3 | Validación accesible; el teléfono acepta formatos amplios |
| 6 | Reconocer en vez de recordar | 3 | Navegación con etiquetas claras |
| 7 | Flexibilidad | n/a | Landing (Persuade) |
| 8 | Estética y minimalismo | 3 | Mundo coherente; los bloques [[PENDIENTE]] meten ruido |
| 9 | Recuperación de errores | 4 | Error del formulario con WhatsApp como alternativa |
| 10 | Ayuda | n/a | Landing (Persuade); las FAQ cubren dudas |
| **Total** | | **25/32** | **Bueno** |

## Especificidad
LLM: autoría alta en el Hero (barra + gis), el ciclo Carga & Descarga y los planes en filas; la estructura sección a sección (h2 a la izquierda + contenido) se repite y solo la Oferta la rompe.
Detector: CLI 0 hallazgos en src/. Navegador: 2 × tight-leading (line-height 1.2 en etiquetas que se parten en varias líneas) a 375 px; 0 a 1280 px.

## Problemas prioritarios
1. [P1] Primer viewport móvil sin persona: a 375 px la foto queda bajo los indicadores. Arreglo: subir la foto en móvil (antes de los indicadores) y reducir el aire superior. Comando: /impeccable layout
2. [P1] Resultados y Testimonios son 100 % provisionales. Arreglo: conseguir contenido real; si no llega, se vacían los datos y las secciones se ocultan solas (R-02). Comando: contenido
3. [P2] CTA de WhatsApp con 5 textos distintos para la misma acción. Arreglo: un texto canónico ("Agenda tu clase muestra gratis") para los CTA generales; los de cada servicio se quedan. Comando: /impeccable clarify
4. [P2] Las manos de gis se leen como huellas o ruido. Arreglo: forma más alargada y menos opaca, como marcas de agarre sobre la barra. Comando: /impeccable polish
5. [P3] Precio "[[PENDIENTE]]" de talleres a tamaño display. Arreglo: ocultar la fila de precio mientras no sea real. Comando: /impeccable harden

## Personas
- Principiante: no ve a nadie entrenando en el primer viewport; "Carga & Descarga" aparece antes de entender qué es.
- Remoto: la Rutina personalizada está a media página; el Hero dice "Morelia y online", pero no hay acceso directo.
- Intermedio: no hay skills concretos (muscle-up, handstand) ni pruebas de nivel; depende de Resultados, que es provisional.

## Observaciones menores
- tight-leading en etiquetas de varias líneas (nota de la oferta, etiquetas de semana).
- Navegación sin indicador de sección activa.
- Carrusel de testimonios sin pista visual de desplazamiento en móvil (el 85 % de ancho ayuda).

## Preguntas
- ¿Y si el Hero móvil abriera con la foto del coach colgado de la barra y el título encima?
- ¿Debe "online" tener su propia puerta en el Hero?
