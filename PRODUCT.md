# Product

<!-- impeccable:product-schema 1 -->

> Fuente: `spec-drive.md` (§1–2, §17.1.1) y la entrevista de T1.1 (2026-10-19). Ante un conflicto, manda el spec.

## Platform

web

## Users

Tres perfiles con el **mismo peso**; ninguno se sacrifica por otro. Casi todos llegan desde el móvil, normalmente desde la bio de Instagram o TikTok.

- **Principiante (18–40 años):** quiere ponerse en forma sin gimnasio y nunca ha entrenado calistenia. Su objeción es "no tengo fuerza" o "me voy a lastimar". Su trabajo: decidir si se atreve a escribirle al coach.
- **Intermedio que busca skills:** ya entrena y quiere progresar en muscle-up, handstand, front lever o streetlifting. Su objeción: "¿de verdad me vas a hacer progresar?". Su trabajo: juzgar si el coach sabe más que él.
- **Persona ocupada:** no tiene horario fijo. Su trabajo: saber si la Rutina personalizada le sirve sin un coach presente.

Los tres comparten una pregunta: cuánto cuesta y si vale la pena.

## Product Purpose

Control Gravedad es la escuela de calistenia en línea del coach **César Augusto**: rutinas personalizadas online (desde 2026-10-26 no se publican clases presenciales ni precios; spec §17.1.2). La landing es su embudo de ventas: el visitante conoce la autoridad del coach, ve resultados reales, resuelve sus objeciones y le escribe.

**Éxito:** un clic a WhatsApp o un formulario enviado. Lo secundario es que visite Instagram o TikTok.

## Positioning

Un método claro, **Carga & Descarga** (César lo implementa; no es su creador), que forma **deportistas hábiles y conscientes**. Las semanas alternan entre carga (fuerza relativa y absoluta, resistencia, técnica pulcra) y descarga (biomecánica, movilidad, elasticidad y descanso). Primero la técnica y el cuidado de músculos y articulaciones, no la cantidad de repeticiones. Un gimnasio genérico o un coach sin método no puede decir esto con verdad, pero el sitio nunca dice que el método sea suyo.

## Operating Context

- El contacto es por **WhatsApp** (+52 443 301 9533). El visitante llega con un mensaje prellenado que nombra el servicio.
- **Sin oferta de entrada** (la clase muestra gratis se retiró el 2026-10-26). El precio se comparte por WhatsApp; quien necesite algo más personalizado, le escribe.
- La Rutina personalizada se pide hoy por correo (controlgravedad@gmail.com), con un formulario y el comprobante de pago. Se entrega en PDF en 7–12 días.
- Se paga por **transferencia SPEI**. Los datos bancarios se mandan por WhatsApp y nunca se publican.
- Las redes son el escaparate: Instagram y TikTok @controlgravedad.

## Capabilities and Constraints

- **Disciplinas:** Calistenia · Streetlifting · Movilidad · Skills Movements · Funcional. También hay talleres.
- **Servicio publicado:** Rutina personalizada (online), sin precio en el sitio.
- **Skills que enseña:** parada de manos, muscle-up, front lever, planche, back lever y pistol squat.
- **Rutina:** vence a los 30 días, se renueva cada mes e incluye seguimiento. Edad: 15+ (menores con permiso). Salud: formulario de Google que envía el coach.
- **Sin definir aún (no inventar):** historia y certificaciones del coach.
- **Fuera de alcance:** pagos en línea, reservas, cuentas de usuario y blog.
- Los requisitos técnicos están en el spec (§5–§6): sitio estático, mejora progresiva y sin PII en la analítica.

## Brand Commitments

- **Nombre:** Control Gravedad (escuela) · César Augusto (coach). "Chesare Mozart" es su nombre en redes y solo aparece como referencia a ellas.
- **Lema:** "Formamos deportistas hábiles y conscientes." Otras frases propias: "Desafía tu ser gravitacional" y "Desafía la gravedad con nosotros".
- **Voz:** motivacional y cercana, en español de México, con humor en redes.
- **Tipografía:** el coach pidió letra elegante; el usuario levantó esa restricción en T1.2 (2026-10-19) al elegir la dirección «Gis y acero». También se levantaron "evitar plantilla genérica" y "evitar lo infantil".
- **Logo:** monograma CG blanco en un círculo con "CONTROL GRAVEDAD". Solo existe en 150 px; falta la versión vectorial.
- **Paleta:** la está definiendo un diseñador externo. Hasta entonces se usa una provisional, que debe poder reemplazarse cambiando solo los tokens (spec D-10).
- `#25D366` queda reservado para WhatsApp.

## Evidence on Hand

- **Confirmado:** el coach organizó **Gravedad Zero** (@gravedadzero_mx), un evento de calistenia en Morelia el 10 de enero de 2026 con exhibición, aprendizaje y comunidad. El número de participantes está pendiente. Instagram tiene 1,430 seguidores (2026-10-19).
- **En el historial de `main`** (sin verificar si son reales ni si hay permiso): fotos de antes y después, fotos del coach y un logo (`assets/`).
- **No existen todavía y no se pueden inventar:** testimonios, número de alumnos, certificaciones, años de experiencia, casos de antes y después con consentimiento, logo vectorial y paleta oficial.

## Product Principles

1. **La técnica antes que el ego.** Cada mensaje refuerza el progreso consciente y seguro, nunca el "sin dolor no hay ganancia".
2. **Honestidad verificable.** Solo cifras, logros y testimonios reales. No se inventa urgencia.
3. **Un paso hacia WhatsApp.** Cada sección termina en una acción clara y la conversación personal hace el resto.
4. **Tres puertas, mismo peso.** El principiante, el intermedio y el remoto encuentran su camino sin sentir que la página es para otro.
5. **El método es la marca.** Carga & Descarga y "hábiles y conscientes" distinguen a Control Gravedad; se cuentan antes que cualquier otra cosa.

## Accessibility & Inclusion

WCAG 2.2 AA, `prefers-reduced-motion`, objetivos táctiles ≥ 44 px y uso cómodo con una mano en el móvil (spec RNF-06/07). Además del público joven, el lenguaje debe invitar a quien nunca ha entrenado.
