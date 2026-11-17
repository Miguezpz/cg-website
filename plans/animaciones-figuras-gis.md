# Plan: técnica y animación de las figuras de gis

- **Estado:** pendiente (sin empezar; no se tocó código ni el spec)
- **Creado:** 2026-11-16
- **Tarea del spec:** nueva, T3.28 (añadirla a §15 y al historial al empezar)
- **Archivos:** `src/lib/skill-poses.ts`, `src/lib/athlete-poses.ts`, `src/lib/athletes.ts`, `src/components/sections/Skills.astro`, `tests/e2e/biomechanics.spec.ts`, `DESIGN.md`

## Contexto

T3.24 ya verifica largos de hueso, bloqueos, flexión máxima y equilibrio en los sostenes. Este plan ataca lo que esa auditoría no medía. Los números salen de medir las articulaciones en las 11 figuras (`joints()` de cada una) y de las tiras de `node scripts/filmstrip.mjs`.

## Qué se encontró

| Figura | Problema medido | Técnica correcta |
|---|---|---|
| **Muscle-up en barra** (skill) | En la transición (p ≈ 0.47) la cadera queda 47 unidades detrás de la barra, doblada a 104°, y el hombro nunca pasa al frente de las manos (x de −14 a −2). El último 18 % de la subida (p 0.82 → 1) está quieto. | El pecho pasa por encima de la barra con los hombros delante de las manos; la cadera dobla poco (≥ 140°) y termina pegada a la barra. |
| **Muscle-up en anillas** (scroll) | La anilla se desplaza 27 unidades de lado entre s = 0.4 y 0.5 (la correa salta de un tope de ±0.26 rad al otro). | Las anillas casi no se mueven de lado; el cuerpo gira alrededor de ellas. |
| **Fondos** (scroll) | El antebrazo se inclina 23° hacia atrás a media bajada (s = 0.5). | Antebrazo casi vertical (≤ 10°), el codo sobre la muñeca; el equilibrio lo dan el tronco y las piernas. |
| **Dominadas** (scroll) | Colgado con el codo a 165°, agarre de 62 contra 30 de hombros (2×) y sin fase escapular. | Colgado con brazos rectos, agarre a ~1.5× hombros; primero bajan los hombros y luego doblan los codos. |
| **Pistol squat** (skill) | De pie ya tiene la pierna libre horizontal y el tronco 9.5° hacia atrás. | Empieza con la pierna libre apenas levantada (~35°, como la atleta de `/gracias`) y sube conforme baja. |
| **Back lever y parada de manos** | La velocidad del centro de masa llega a 4.2× (back lever, p 0.39) y 3.5× (parada, p 0.22) la media. | En el back lever el giro con brazos rectos es lento y parejo; en la parada la patada sí es rápida, pero la llegada frena. |
| **Todas las de scroll** | La curva es un medio coseno simétrico, sin pausa arriba ni abajo. | Pausa breve en el bloqueo y en el fondo. |

Levers, plancha y parada de manos tienen la posición final correcta: ahí falta vida, no técnica.

## Pasos (un commit por paso)

### 1. Pruebas primero — `tests/e2e/biomechanics.spec.ts`

Añadir los límites que faltan, para que fallen y guíen el resto:

- [ ] Fondos: antebrazo ≤ 10° de la vertical en toda la repetición.
- [ ] Muscle-up de barra: hombro delante de las manos en la transición y cadera ≥ 140°.
- [ ] Anillas: la anilla se mueve ≤ 3 unidades entre cuadros (101 cuadros).
- [ ] Dominadas: codo ≥ 175° en el colgado.
- [ ] Giros con brazos rectos: velocidad pico del centro de masa ≤ 2.5× la media.

### 2. Técnica — `skill-poses.ts`, `athlete-poses.ts`

- [ ] **Muscle-up en barra:** rehacer los fotogramas de 0.38 a 0.82 de la subida y los de la negativa (`back`); repartir la subida en todo el 0 → 1.
- [ ] **Fondos:** fijar el codo sobre la muñeca y resolver la inclinación del tronco con `solve`, en vez de resolver qué tan adelante va el hombro.
- [ ] **Anillas:** suavizar el ángulo de la correa con `flow` en lugar del tope de ±0.26 rad.
- [ ] **Dominadas:** agarre a ±23, colgado recto y un primer 12 % escapular (el hombro baja respecto a la cabeza sin doblar el codo).
- [ ] **Pistol (skill):** pierna libre de 35° a 98°.
- [ ] **Back lever:** repartir el giro en un tramo más largo (0.2 → 0.7).

### 3. Animación — `athletes.ts`, `Skills.astro`

- [ ] Curva por repetición con pausas (≈ 8 % arriba y abajo) en vez del medio coseno, reutilizando `flow`.
- [ ] Cola de caballo con retraso: sigue a la cabeza medio cuadro tarde (patada a la parada de manos y pistol).
- [ ] Respiración en el colgado y en el soporte del muscle-up durante las pausas, con el `sway` que ya existe.

Este paso es el menos comprobado: se planeó con cuadros fijos y números, sin ver las figuras en movimiento. Revisarlo en el navegador antes de darlo por bueno.

### 4. Cierre

- [ ] `npm run check` + `npm run build` + `npm run test:e2e`.
- [ ] Regenerar las tiras (`node scripts/filmstrip.mjs`) y capturas a 375 y 1280 px.
- [ ] Actualizar `DESIGN.md` (Atletas de gis, Ruta de skills) y el spec (§15 e historial).
- [ ] Borrar este archivo.

## Lo que no cambia

- Los sostenes siguen con micro-ajustes (decisión del usuario, T3.24); no se añaden figuras ni magnesia.
- La escala y la regla «ningún skill más alto que el muscle-up» se mantienen.
- Sin librerías: todo sale de `keys`, `flow`, `solve` y `sway`.

## Pendiente con el coach

Que César vea las tiras actuales. La inclinación de brazos de la plancha completa (50° desde la vertical) sale del cálculo de equilibrio, pero un atleta real suele verse más cerca de 35–45°: solo él puede decir si se lee bien.
