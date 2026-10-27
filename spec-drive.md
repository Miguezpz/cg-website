# Spec: Landing Page — Control Gravedad (Coach César Augusto)

> Documento de especificación (spec-driven development). Es la **fuente de verdad** del proyecto: define **qué** se construye (Parte A), **cómo** (Parte B), **en qué orden** (Parte C) y **qué falta** (Parte D). Cualquier cambio de alcance se refleja primero aquí y se anota en el historial.

| Campo | Valor |
|---|---|
| Marca / escuela | **Control Gravedad** |
| Coach | **César Augusto** (en redes: "Chesare Mozart") |
| Modalidad | **Solo online** (desde 2026-10-26). Lo presencial existe solo a petición y **no se publica** (§17.1.2) |
| Branch | ramas que salen de `main` (`main` = producción) |
| Versión | v0.9 (borrador) |
| Punto de partida | Proyecto desde cero. No se reutiliza código, estilos ni estructura del branch `main` |
| Idioma del sitio | Español (`es-MX`) |
| Hosting | **Vercel, plan Hobby (gratuito)**, en un subdominio `*.vercel.app` (sin dominio propio). Reemplaza al sitio actual en `*.netlify.app` (ver §11.1) |
| Lema | "Formamos deportistas hábiles y conscientes." |

> T0.0 (información de la marca desde Instagram) quedó cerrada el 2026-10-19. Lo recibido está en §17.1.1; lo que falta, marcado como `[[PENDIENTE]]`.

**Convención de IDs:** `RF-xx` requisito funcional · `RNF-xx` requisito no funcional · `ADR-xx` decisión técnica · `Tx.y` tarea · `M#` hito · `D-xx` decisión abierta · `R-xx` riesgo. Las tareas citan los requisitos que cubren, y cada requisito dice cómo se verifica.

---

# Parte A — Producto (qué y por qué)

## 1. Objetivo

Construir una **landing page de conversión** para **Control Gravedad**, la escuela de calistenia del coach **César Augusto**, que funcione como embudo de ventas digital: el visitante conoce la **autoridad** del coach, ve **resultados reales**, resuelve sus **objeciones** y termina **contactándolo** para contratar clases.

### Métricas

| Tipo | Métrica | Fuente |
|---|---|---|
| **Conversión principal** | Clic en cualquier enlace de WhatsApp (`whatsapp_click`) | GA4 |
| **Conversión principal** | Envío exitoso del formulario (`form_submit`) | GA4 |
| Secundaria | Clic a Instagram / TikTok (`social_click`) | GA4 |
| Secundaria | Profundidad de scroll (¿llegan a Resultados / FAQ?) | GA4 (medición mejorada) |
| Salud | Core Web Vitals reales (LCP, INP, CLS) | PageSpeed Insights / CrUX (Vercel Speed Insights solo si cabe en los límites del plan Hobby) |

**Meta inicial:** el primer mes se mide la línea base de conversión (conversiones ÷ visitantes únicos). Las metas numéricas se fijan después con datos reales.

## 2. Público objetivo y mensajes

| Perfil | Necesidad | Objeción típica | Sección que la responde |
|---|---|---|---|
| Principiante (18–40 años) | Ponerse en forma sin gimnasio | "No tengo fuerza / nunca he entrenado" | Cómo funciona, FAQ, Testimonios de principiantes |
| Intermedio | Aprender skills (muscle-up, handstand, front lever) | "¿Realmente me vas a hacer progresar?" | Sobre el coach, Resultados |
| Ocupado / remoto | Entrenar con guía desde casa | "No tengo tiempo / no vivo cerca" | Servicios (Rutina personalizada), FAQ |
| Todos | Saber cuánto cuesta y si vale la pena | "Seguro es caro" | Servicios y FAQ: el precio se pide por WhatsApp (no se publica, §17.1.2) |
| Todos | Entrenar sin lesionarse | "Me voy a lastimar" | Cómo funciona (método Carga & Descarga), FAQ |

**Mensaje central:** formar deportistas *hábiles y conscientes* con el método **Carga & Descarga**, que el coach implementa (no es su creador, 2026-10-26) y que alterna semanas de fuerza con semanas de técnica, movilidad y descanso (§17.1.1). Disciplinas: Calistenia, Streetlifting, Movilidad, Skills Movements y Funcional. Tono: motivacional y cercano; el sitio lo traduce a un registro elegante (§10).

**Dispositivo principal:** móvil. Todo se diseña *mobile-first* y se valida primero a 375 px.

## 3. Alcance

### Incluido (v1)
- Landing de una sola página (`/`) con las secciones de §4.
- Página `/privacidad` (aviso de privacidad, obligatorio porque el formulario recolecta datos personales).
- Página `404` con la marca y un CTA de regreso.
- Botón flotante de WhatsApp, formulario funcional, analítica de conversión, SEO técnico.
- Despliegue en Vercel Hobby en `controlgravedad.vercel.app`.

### Fuera de alcance (v1)
- Pagos en línea, blog, área de miembros, login, reservas automáticas, multi-idioma, CMS, pruebas A/B.

## 4. Requisitos funcionales

Orden de secciones = orden del embudo: **atención → autoridad → oferta → prueba → facilidad → objeciones → acción**.

### RF-01 · Header y navegación
- Logo o nombre a la izquierda; enlaces ancla: Sobre mí · Servicios · Skills · Resultados · FAQ · Contacto; CTA "Contáctame" siempre visible.
- Header *sticky* que gana fondo al hacer scroll.
- En móvil: menú hamburguesa accesible.

**Aceptación:** los enlaces llevan a su sección sin que el header la tape (`scroll-margin-top`); el menú abre y cierra con teclado y con `Esc`, actualiza `aria-expanded`, y se cierra al elegir un enlace.

### RF-02 · Hero
- Imagen a pantalla completa (o video con *poster*, ver D-03); título orientado a beneficio; subtítulo de 1 línea.
- CTA primario **"Escríbeme por WhatsApp"** → WhatsApp; CTA secundario "Ver la rutina" → `#servicios`; enlace "¿Necesitas algo más personalizado? Escríbeme" → `#a-medida` (2026-10-26).
- 2–3 indicadores de autoridad (ej. "+X alumnos", "X años").

**Aceptación:** título y CTA primario visibles sin scroll a 375×667; el elemento LCP es una imagen con `fetchpriority="high"` (nunca el video).

### RF-03 · Sobre el coach (`#sobre-mi`)
- Foto profesional, historia breve (≤ 120 palabras), al menos 3 credenciales (certificaciones, años, logros).
- Credencial confirmada: **organizador de Gravedad Zero**, evento de calistenia en Morelia (10 de enero de 2026; participantes `[[PENDIENTE]]`). En el sitio no se nombra la ciudad (§17.1.2). El resto de la historia y credenciales: `[[PENDIENTE]]`.
- Nombre visible del coach: **César Augusto**; "Chesare Mozart" solo como referencia a sus redes.

### RF-04 · Servicios (`#servicios`)
- **Sin precios publicados** (decisión del coach, 2026-10-26): el precio se comparte por WhatsApp. Ni el sitio ni el JSON-LD publican precios.
- Un solo servicio, **Rutina personalizada (online):** 2 rutinas en PDF para 4 semanas (carga y descarga), ejercicios explicados, imágenes demostrativas y glosario; entrega por correo en 7–12 días.
- Bloque **"¿Necesitas algo más personalizado?"** (`#a-medida`) con CTA a WhatsApp: es la única puerta a un entrenamiento más a la medida (incluido lo presencial, que el coach decide caso por caso y **no** se menciona en el sitio).
- ~~Clases presenciales (Morelia)~~ y ~~Talleres~~: retirados el 2026-10-26.
- Pago por transferencia SPEI; los datos bancarios se envían por WhatsApp y **nunca** se publican en el sitio.

**Aceptación:** cada CTA abre WhatsApp con un mensaje prellenado **distinto** que nombra el servicio (ver §9.1).

### RF-04.1 · Ruta de skills (`#skills`)
- Entre Servicios y Resultados (2026-10-26). Por cada skill que enseña el coach (parada de manos, muscle-up, front lever, planche, back lever y pistol squat), **una sola figura de gis que hace el skill** mientras se ve. Los skills de posición (parada de manos, front lever, back lever, planche) llegan a ella una vez y se quedan; los de repeticiones (muscle-up, pistol squat) van en bucle. Todas las figuras van a la misma escala; parada de manos, front lever y pistol squat los hace ella, y los demás él. Sin etapas, sin meta y sin cronómetro (2026-10-26, a pedido del usuario; reemplaza la escalera de 4 etapas de T3.15–T3.17).
- Pestañas con radios nativos y `:has()`: funciona sin JS. Cada skill tiene su CTA de WhatsApp, que nombra el skill (`data-source="skills"`, `data-service="skill-<id>"`).
- Se llega desde el menú («Skills») y desde la respuesta de la FAQ «¿Qué skills puedo aprender?».

**Aceptación:** se cambia de skill con mouse, touch y flechas del teclado; los dibujos son decorativos (`aria-hidden`); sin JS o con movimiento reducido la figura queda en su pose fija.

### RF-05 · Resultados: antes y después (`#resultados`)
- 2–4 casos con slider comparativo, más el nombre o inicial, el tiempo de entrenamiento y un logro concreto.
- Slider implementado con `<input type="range">` + `clip-path` (accesible por diseño, sin librerías).

**Aceptación:** funciona con mouse, touch y flechas del teclado; tiene `aria-label` y `aria-valuetext` ("Mostrando 50% antes"); cada imagen tiene un `alt` descriptivo; sin JS se ven ambas fotos lado a lado.

### RF-06 · Testimonios (`#testimonios`)
- 3–6 testimonios con nombre, cita y, si los hay, logro y foto. Carrusel con *scroll-snap* en móvil y cuadrícula en escritorio.
- Hoy son reseñas de Google Maps recortadas sin cambiar palabras, con la atribución «Reseña en Google Maps» junto a la «G» de Google (2026-10-26), nombre con apellido abreviado (ej. «Roberto G.») y **sin** foto de perfil (2026-10-26). Requieren el permiso de cada persona antes de compartir el sitio (§17.1.1, pendientes).

**Aceptación:** todo el contenido es legible y navegable sin JS.

### RF-07 · Cómo funciona
- Tres pasos: **Escríbeme** (te comparto precio y detalles) → **Recibe tu rutina** → **Entrena a tu ritmo** (2026-10-26).
- Presenta el método **Carga & Descarga** (semana de carga: fuerza, resistencia y técnica pulcra; semana de descarga: biomecánica, movilidad, elasticidad y descanso).

### RF-08 · ~~Oferta de entrada~~ (retirada el 2026-10-26)
- La clase muestra gratis era presencial; al quedar el servicio solo online, el usuario decidió quitar la oferta de entrada (D-02). No se sustituye por otra.

### RF-09 · Preguntas frecuentes (`#faq`)
- 6–8 preguntas con `<details>`/`<summary>` nativos. Deben cubrir: experiencia previa, precio (se pide por WhatsApp), formas de pago (SPEI), qué se recibe y cuándo, skills, equipo, edad y salud, y algo más personalizado.
- Respuestas ya disponibles: precio, pago, Rutina personalizada (con seguimiento y renovación mensual), skills, edad y salud, y algo más personalizado. Las demás: `[[PENDIENTE]]`.

**Aceptación:** funciona sin JS; las mismas preguntas se emiten como JSON-LD `FAQPage`.

### RF-10 · Contacto y CTA final (`#contacto`)
- Título de cierre, botón grande de WhatsApp y enlaces a Instagram y TikTok.
- Formulario: nombre*, WhatsApp/teléfono*, objetivo* (select), mensaje (opcional) y casilla de aceptación del aviso de privacidad*.
- Anti-spam: campo *honeypot*.
- Estados visibles: enviando (botón deshabilitado), éxito y error (con el WhatsApp como alternativa).

**Aceptación:** un envío real llega al email del coach; la confirmación aparece sin recargar; con JS desactivado, el formulario se envía igual (POST nativo) y redirige a una página de gracias; los errores de validación se anuncian a lectores de pantalla (`aria-live`).

### RF-11 · Footer
- Nombre, redes, zona de servicio ("Online"), © año actual (calculado en build) y enlace a `/privacidad`.

### RF-12 · Botón flotante de WhatsApp
- Fijo abajo a la derecha, con `aria-label`, y respeta `env(safe-area-inset-bottom)` en iOS.

**Aceptación:** no tapa el CTA del Hero ni los botones del formulario a 375 px. Se oculta cuando `#contacto` está en pantalla para no duplicar el CTA.

### RF-13 · Páginas `/privacidad` y `404`
- `/privacidad`: aviso conforme a la LFPDPPP (responsable, datos recabados, finalidad, derechos ARCO, uso de cookies/analítica). El texto lo valida el cliente.
- `404`: mensaje breve, el mismo header y footer, y un CTA a `/`.

## 5. Requisitos no funcionales

| ID | Requisito | Cómo se verifica |
|---|---|---|
| RNF-01 | Lighthouse móvil **≥ 95** en Performance, Accessibility, Best Practices y SEO | Lighthouse CI en cada PR (T4.2) |
| RNF-02 | LCP < 2.5 s · CLS < 0.1 · INP < 200 ms (móvil, 4G simulado) | Lighthouse CI + PageSpeed Insights en producción |
| RNF-03 | JS **propio** < 20 KB gzip. Terceros (GA4) cargados de forma diferida y fuera del camino crítico | Revisión del reporte de build |
| RNF-04 | Imágenes vía `astro:assets` (AVIF/WebP, `srcset`, `width`/`height` explícitos, lazy salvo el Hero) | Lighthouse + revisión de código |
| RNF-05 | Máx. 2 familias tipográficas autoalojadas (Fontsource), subset latino, `font-display: swap`, la del Hero precargada | Pestaña Network |
| RNF-06 | WCAG 2.2 AA: contraste ≥ 4.5:1, navegable con teclado, foco visible, un solo `<h1>`, landmarks, objetivos táctiles ≥ 44 px | `web-design-guidelines` + axe en e2e (T4.1) |
| RNF-07 | `prefers-reduced-motion` desactiva animaciones no esenciales | e2e con `reducedMotion: 'reduce'` |
| RNF-08 | Mejora progresiva: sin JS, todo el contenido se ve y los CTAs y el formulario funcionan | e2e con `javaScriptEnabled: false` |
| RNF-09 | SEO: `title`/`description` únicos con marca + keyword local (ej. "Control Gravedad · Calistenia online con César Augusto"), canónica, OG/Twitter 1200×630, `sitemap.xml`, `robots.txt`, JSON-LD | Rich Results Test + Lighthouse SEO |
| RNF-10 | Seguridad: cabeceras CSP, `X-Content-Type-Options`, `Referrer-Policy` y `Permissions-Policy` vía `vercel.json`; sin secretos en el repo | securityheaders.com sobre la URL de preview |
| RNF-11 | Compatibilidad: últimas 2 versiones de Chrome, Safari (incl. iOS), Firefox y Edge; breakpoints 375 / 768 / 1280 px | e2e en Chromium + WebKit; dispositivo real en T4.4 |
| RNF-12 | Privacidad: el aviso declara la analítica; no se envían datos del formulario a GA4 (sin PII en eventos) | Revisión de `analytics.ts` |

---

# Parte B — Diseño técnico (cómo)

## 6. Decisiones técnicas (ADR resumidos)

| ID | Decisión | Alternativa descartada | Motivo |
|---|---|---|---|
| ADR-01 | **Astro** (última estable al iniciar; versión fijada en `package.json`), salida **estática** | Next.js | Cero JS por defecto, ideal para una landing; no necesita servidor |
| ADR-02 | **TypeScript estricto** (`astro/tsconfigs/strict`) | JS plano | Valida el modelo de contenido en build |
| ADR-03 | **Tailwind CSS v4** con `@tailwindcss/vite` y tokens en `@theme` | CSS a mano | Velocidad; los tokens salen de `DESIGN.md` |
| ADR-04 | **Sin React ni librerías de UI/animación** (shadcn/ui, Framer Motion, AOS) | shadcn/ui + Framer Motion | Peso innecesario; las animaciones se hacen con CSS, `@starting-style`, IntersectionObserver o WAAPI |
| ADR-05 | Interactividad con `<script>` de Astro (TS, empaquetado y diferido) o elementos nativos (`<details>`, `<input type=range>`) | Islands de frameworks | Menos JS y mejora progresiva |
| ADR-06 | Formulario con **Web3Forms** (POST directo, plan gratuito) | Endpoint propio en Vercel + Resend | Evita servidor en v1. **Plan de escape:** si hay spam o se necesita guardar leads, migrar a una Astro Action con `@astrojs/vercel` + Resend + Turnstile |
| ADR-07 | **GA4** para eventos de conversión, cargado diferido; Web Vitals reales vía PageSpeed Insights/CrUX | Vercel Web Analytics / Speed Insights | Los eventos personalizados de Vercel Analytics no están en el plan Hobby; GA4 es gratis y no depende del hosting |
| ADR-11 | **Portabilidad:** cero dependencias específicas de Vercel (sin adaptador, sin funciones, sin `@vercel/*`). Lo único propio de Vercel es `vercel.json` | Usar funciones o servicios de Vercel | Permite mudarse a Cloudflare Pages o Netlify en minutos si el plan Hobby deja de servir (R-05) |
| ADR-08 | Contenido en **`src/data/*.ts` tipado** (un archivo por dominio) | Content Collections o CMS | Una sola página con poco contenido; los tipos bastan y es fácil de editar |
| ADR-09 | Imágenes en `src/assets/` procesadas por `astro:assets` | `public/` sin optimizar | Genera AVIF/WebP, `srcset` y dimensiones automáticamente |
| ADR-10 | Pruebas: **@playwright/test** (e2e + axe) y **Lighthouse CI** en GitHub Actions | Solo pruebas manuales | Hace verificables los RNF y protege contra regresiones |

## 7. Arquitectura y estructura

```
/
├── .claude/skills/            # Skills de Claude Code (ver §13)
├── .github/workflows/ci.yml   # check + build + e2e + Lighthouse
├── public/                    # favicon, og-image.jpg, robots.txt
├── src/
│   ├── assets/                # Imágenes optimizadas (hero/, coach/, results/, testimonials/)
│   ├── components/
│   │   ├── ui/                # Button, Card, Badge, SectionHeading, Container
│   │   ├── sections/          # Hero, About, Services, Results, Testimonials, HowItWorks, Offer, Faq, Contact
│   │   ├── BeforeAfterSlider.astro
│   │   ├── Header.astro · Footer.astro · WhatsAppButton.astro · JsonLd.astro
│   ├── data/                  # Contenido editable y tipado
│   │   ├── site.ts            # Marca, contacto, redes, SEO, indicadores
│   │   ├── services.ts · results.ts · testimonials.ts · faq.ts
│   │   └── types.ts
│   ├── layouts/BaseLayout.astro   # <head>, SEO, OG, fuentes, analítica
│   ├── lib/
│   │   ├── whatsapp.ts        # waLink({ service?, source }) → URL wa.me
│   │   └── analytics.ts       # track(event, params) con GA4 diferido
│   ├── pages/
│   │   ├── index.astro · privacidad.astro · gracias.astro · 404.astro
│   └── styles/global.css      # Tailwind + @theme (tokens de DESIGN.md)
├── tests/e2e/                 # Pruebas de Playwright
├── astro.config.mjs · tsconfig.json · playwright.config.ts · lighthouserc.json · vercel.json
├── .env.example
├── CLAUDE.md · PRODUCT.md · DESIGN.md · spec-drive.md
```

**Principios:** los componentes no contienen textos fijos (todo sale de `src/data/`); cada sección es independiente y recibe sus datos por props; ningún componente importa de otra sección.

## 8. Modelo de contenido

```ts
// src/data/types.ts (borrador)
type Plan      = { name: string; price: string; detail: string };
type Service   = { id: 'presencial' | 'rutina' | 'talleres'; name: string; audience: string;
                   includes: string[]; plans: Plan[]; waMessage: string };
type Result    = { name: string; duration: string; achievement: string;
                   before: ImageMetadata; after: ImageMetadata; alt: { before: string; after: string } };
type Testimonial = { name: string; quote: string; achievement?: string; photo?: ImageMetadata };
type FaqItem   = { q: string; a: string };
```

**Contenido provisional:** mientras no haya contenido real, los textos de ejemplo llevan el marcador `[[PENDIENTE]]` y las imágenes se guardan en `src/assets/placeholders/`. El script `npm run check:content` falla si alguno sigue presente; es obligatorio antes de producción (T4.6).

## 9. Integraciones

### 9.1 WhatsApp
- `waLink({ service, source })` → `https://wa.me/<PUBLIC_WHATSAPP_NUMBER>?text=<encodeURIComponent(msg)>`.
- Mensaje base: *"Hola, vi tu página web y me interesa {servicio}."* Así el coach sabe que el contacto viene de la web.
- Todos los enlaces llevan `data-track="whatsapp"` y `data-source="hero|services|skills|contact|floating"` para la analítica, y `data-service` con el servicio (`rutina`, `a-medida`, `skill-<id>` o `general`).

### 9.2 Formulario (Web3Forms)
- `<form method="POST" action="https://api.web3forms.com/submit">` con `access_key` (pública por diseño), `redirect` → `/gracias` (fallback sin JS) y `botcheck` (honeypot).
- Con JS: `fetch` + estados de UI y `track('form_submit', { goal })`, sin enviar nombre ni teléfono a GA4.

### 9.3 Analítica
| Evento GA4 | Disparador | Parámetros |
|---|---|---|
| `whatsapp_click` | Clic en `[data-track=whatsapp]` | `source`, `service` |
| `form_submit` | Envío exitoso | `goal` |
| `social_click` | Clic en Instagram/TikTok | `network` |
| `skill_view` | Elegir un skill en la ruta de skills | `skill` |

- Un solo listener delegado en `document` (sin handlers por botón). Excepción: `skill_view` sale del cambio de radio de la ruta de skills.
- `whatsapp_click` y `form_submit` se marcan como **eventos clave** en GA4.
- GA4 se carga después de `load` o en la primera interacción para cumplir RNF-01 y RNF-03.

### 9.4 SEO y datos estructurados
- JSON-LD: `Person` (el coach) + `Service` por servicio con `areaServed` (online: México), **sin `offers`** porque no se publican precios + `FAQPage`. Se usa `LocalBusiness` solo si hay una dirección física pública (D-06).
- `site` definido en `astro.config.mjs` (necesario para la canónica y el sitemap).

## 10. Diseño visual

- La dirección visual la define **Impeccable** en modo *Persuade* y queda en `DESIGN.md` (tokens, tipografía, espaciado, componentes, movimiento). `PRODUCT.md` guarda el contexto de negocio (§1–2 de este spec).
- Punto de partida (puede cambiar en T1.2): estilo oscuro, enérgico y deportivo; fotos protagonistas; un solo color de acento; `#25D366` reservado para WhatsApp.
- **Dirección elegida en T1.2: «Gis y acero»** (acero negro mate, magnesia, concreto y un acento amarillo de seguridad, reemplazado el 2026-10-25 por el vino de la guía de marca; Archivo Variable condensada para titulares, reemplazada el 2026-10-25 por Readex Pro). Detalle en `DESIGN.md`. El coach había pedido tipografía elegante; el usuario levantó esa restricción al elegir esta dirección (2026-10-19).
- **Paleta (D-10):** T1.2 propuso una paleta provisional con acento amarillo. El 2026-10-25 llegó la guía de marca (*Brand Guidelines Vol. 1*): vino `#6A1E2B`, burdeos `#4F111E`, negro y blanco, y el amarillo se reemplazó por el vino (T3.10). Los hex se leyeron de una imagen y están por confirmar con el diseñador. Ningún componente usa colores sueltos: cambiar la paleta debe ser editar solo los tokens de `DESIGN.md` y `@theme`.
- Los tokens de `DESIGN.md` se trasladan 1:1 a `@theme` en `global.css`. Ningún componente usa colores sueltos.

## 11. Infraestructura y despliegue (Vercel)

| Entorno | Origen | URL | Indexable |
|---|---|---|---|
| Local | `npm run dev` | `localhost:4321` | — |
| Preview | Cada push y PR | `*.vercel.app` | No (Vercel añade `noindex` en previews) |
| Producción | Branch de producción (D-05) | `https://controlgravedad.vercel.app` (nombrar así el proyecto en Vercel si está disponible) | Sí |

- **Preset:** Astro · Build `npm run build` · Output `dist` · versión de Node fijada en `package.json` (`engines`). No requiere adaptador mientras el sitio sea estático.
- **Variables de entorno** (`.env.example`): `PUBLIC_SITE_URL`, `PUBLIC_WHATSAPP_NUMBER`, `PUBLIC_WEB3FORMS_KEY`, `PUBLIC_GA_ID`. Todas son públicas por diseño (se incrustan en el build); no hay secretos.
- **`vercel.json`:** cabeceras de seguridad (RNF-10) y caché larga para `/_astro/*`.
- **Dominio propio:** no hay en v1. Se puede añadir después sin costo de hosting (Hobby lo permite); solo se paga el dominio (D-09).
- **Despliegue temprano:** el proyecto se conecta a Vercel en la Fase 0 para tener una URL de preview desde el primer día.
- **Plan:** Vercel **Hobby** (gratuito), decisión del usuario (D-04). Incluye dominio propio con HTTPS, previews por branch y CDN, que es todo lo que necesita un sitio estático. Los términos de Hobby limitan el uso a fines no comerciales; es un riesgo aceptado y mitigado (R-05, ADR-11).

### 11.1 Migración desde Netlify

El sitio actual (branch `main`) está publicado en **Netlify** en un subdominio `*.netlify.app` (sin dominio propio) y conectado al repositorio. Como no hay DNS que migrar, el cambio consiste en **redirigir la URL vieja a la nueva**:

1. ✅ *(Hecho el 2026-10-19.)* **Antes de fusionar `nuevo-sitio` → `main`**, desactivar los builds automáticos en Netlify (*Site configuration → Build & deploy → Stop builds*). Si no, Netlify intentará desplegar el nuevo proyecto Astro sobre el sitio en producción.
2. Verificar la nueva landing en producción en `https://controlgravedad.vercel.app`.
3. Convertir el sitio de Netlify en una redirección: hacer un *deploy manual* (arrastrar una carpeta en Netlify) que solo contenga un archivo `_redirects` con `/*  https://controlgravedad.vercel.app/:splat  301!`. Así los enlaces viejos ya compartidos siguen funcionando.
4. Actualizar el enlace de la bio de Instagram, TikTok y Google Business (si existe) a la nueva URL.
5. Dar de alta la nueva URL en Search Console y enviar el sitemap.

## 12. Calidad y CI

| Capa | Herramienta | Qué valida | Cuándo |
|---|---|---|---|
| Tipos y Astro | `astro check` | Tipos, props y modelo de contenido | CI + antes de cada commit |
| Formato | Prettier (+ `prettier-plugin-astro`, `prettier-plugin-tailwindcss`) | Estilo consistente | CI |
| E2E | `@playwright/test` (Chromium + WebKit, móvil y escritorio) | Menú, anclas, slider, formulario (mock de Web3Forms), `href` de WhatsApp, sin JS, reduced motion | CI |
| Accesibilidad | `@axe-core/playwright` | 0 violaciones serias o críticas | CI |
| Rendimiento | Lighthouse CI (`lighthouserc.json` con aserciones de RNF-01) | Puntuaciones ≥ 95 | CI |
| Contenido | `npm run check:content` | Sin `[[PENDIENTE]]` | Antes de producción |
| Visual (manual) | Skill `playwright-cli` | Capturas a 375 / 768 / 1280 px | Al terminar cada sección |

**CI (GitHub Actions):** `install → check → build → e2e → lighthouse` en cada push y PR. Un PR no se fusiona si CI falla.

## 13. Skills de Claude Code y flujo de trabajo

| Skill | Rol único | Cuándo |
|---|---|---|
| **impeccable** | Dirección visual (modo *Persuade*) | T1.1 `init` → `PRODUCT.md`; T1.2 `shape` → `DESIGN.md`; construcción de secciones; T3.5 `critique` + `polish` |
| **emil-design-eng** | Detalle de movimiento y microinteracciones | T3.4. Sus ejemplos con React/Framer Motion se traducen a CSS/WAAPI (ADR-04) |
| **web-design-guidelines** | Auditoría (solo revisa) | Al cerrar cada tarea de la Fase 2 y en T4.3 |
| **playwright-cli** | Verificación visual interactiva | Al cerrar cada tarea de UI |

**Descartadas** por duplicar el rol de Impeccable: *taste-skill*, *awesome-design-md* e *image-to-code*. Se reconsideran solo si hay un mockup de referencia.

**Jerarquía ante conflictos:** este spec > `DESIGN.md` > Impeccable > Emil. Emil solo ajusta el comportamiento del movimiento, nunca el estilo.

**Ciclo por tarea:** construir → `astro check` + build → capturas con `playwright-cli` (375 y 1280 px) → revisión con `web-design-guidelines` → corregir → commit.

---

# Parte C — Plan de implementación

## 14. Hitos

| Hito | Resultado verificable | Incluye |
|---|---|---|
| **M0 · Información de la marca recibida** | El usuario compartió la información de Instagram (§17.1) y quedó volcada en el spec | T0.0 |
| **M1 · Esqueleto en línea** | URL de preview en Vercel con CI en verde | Fase 0 |
| **M2 · Sistema de diseño** | `PRODUCT.md`, `DESIGN.md`, layout base y componentes UI en preview | Fase 1 |
| **M3 · Landing mínima que convierte** | Header, Hero, Servicios, Contacto y WhatsApp flotante funcionando. Ya podría publicarse | T2.1–T2.4 |
| **M4 · Landing completa** | Todas las secciones con contenido provisional | Fase 2 + Fase 3 |
| **M5 · Lanzamiento** | Contenido real, QA aprobado y sitio en producción | Fase 4 |

## 15. Tareas

Formato: **ID · tarea** — *depende de* · *cubre* · **listo cuando**.

### Fase 0 — Fundaciones (→ M0, M1)
- **T0.0 · ✅ Recibir la información de la marca (cerrada 2026-10-19).** Al iniciar la siguiente sesión de desarrollo, **Claude pregunta al usuario** por la información del Instagram de Control Gravedad (checklist en §17.1). Con lo recibido: actualizar §2, RF-03, RF-04, RF-08, RF-09, §17 y §18, y dejar los huecos que falten como `[[PENDIENTE]]`. **Listo cuando** el usuario confirma que el spec refleja la marca. **→ M0**
- **T0.1 · ✅ Limpiar el legado** — *dep.* T0.0: eliminar `index.html`, `script.js`, `styles.css`, `assets/` y `.vscode/` (si no se usa). **Listo cuando** solo quedan `.claude/`, `CLAUDE.md` y `spec-drive.md`.
- **T0.2 · ✅ Inicializar Astro** (plantilla mínima, TS estricto, `engines.node`; Astro 7.4.1 fijado, Node ≥ 22.22 vía `.nvmrc`) — *dep.* T0.1. **Listo cuando** `npm run dev` y `npm run build` funcionan.
- **T0.3 · ✅ Tailwind v4 + `@astrojs/sitemap` + Prettier** — *dep.* T0.2. **Listo cuando** una clase de Tailwind se refleja en el build.
- **T0.4 · ✅ Configuración del repo:** `.gitignore` (incluye `.playwright-cli/`, `.env`, `dist/`), `.env.example` y scripts de npm (`check`, `test:e2e`, `check:content`, `format`). **Listo cuando** `npm run check` pasa.
- **T0.5 · ✅ Playwright + axe + Lighthouse CI + GitHub Actions** con una prueba humo — *dep.* T0.3. **Listo cuando** CI está en verde en GitHub. *(Verde el 2026-10-19.)*
- **T0.6 · ✅ Conectar Vercel Hobby** (importar el repo con `nuevo-sitio` como branch de preview, variables de entorno, `vercel.json` con cabeceras) — *dep.* T0.5. **Listo cuando** existe la URL de preview y securityheaders.com da A o superior. *(Conectado el 2026-10-19: producción en `https://controlgravedad.vercel.app` desde `main`; las 6 cabeceras de seguridad y la caché inmutable de `/_astro/*` verificadas con `curl`.)* **→ M1**

### Fase 1 — Contexto y sistema de diseño (→ M2)
- **T1.1 · ✅ `impeccable init`** usando §1–2 de este spec → `PRODUCT.md`. **Listo cuando** el usuario aprueba `PRODUCT.md`. *(Aprobado el 2026-10-19.)*
- **T1.2 · ✅ `impeccable shape`** de la landing → dirección visual + `DESIGN.md` — *dep.* T1.1 y, si es posible, fotos reales (§17 🟠). **Listo cuando** el usuario aprueba la dirección visual. *(Elegida «Gis y acero» el 2026-10-19, sin fotos reales.)*
- **T1.3 · ✅ Tokens en `global.css` + fuentes Fontsource** — *dep.* T1.2 · RNF-05.
- **T1.4 · ✅ `BaseLayout`** (meta SEO, OG, canónica, `lang="es-MX"`, *skip link*) — RNF-09.
- **T1.5 · ✅ Componentes UI** (`Button` primario/secundario/WhatsApp, `Card`, `Badge`, `SectionHeading`, `Container`) con estados hover, active, focus y disabled — RNF-06.
- **T1.6 · ✅ Modelo de contenido** (`src/data/types.ts` + datos provisionales con `[[PENDIENTE]]`) — §8.
- **T1.7 · ✅ `lib/whatsapp.ts` + `lib/analytics.ts`** con un listener delegado — §9.1 y §9.3. **Listo cuando** la prueba e2e valida el `href` generado. **→ M2**

### Fase 2 — Secciones (→ M3, luego M4)
Cada tarea se cierra con el ciclo de §13 y su prueba e2e.
- **T2.1 · ✅ Header + menú móvil** — RF-01
- **T2.2 · ✅ Hero** — RF-02
- **T2.3 · ✅ Servicios** — RF-04
- **T2.4 · ✅ Contacto (UI del formulario + WhatsApp) + botón flotante** — RF-10, RF-12. **→ M3**
- **T2.5 · ✅ Sobre el coach** — RF-03
- **T2.6 · ✅ Resultados + `BeforeAfterSlider`** — RF-05
- **T2.7 · ✅ Testimonios** — RF-06
- **T2.8 · ✅ Cómo funciona + Oferta** — RF-07, RF-08
- **T2.9 · ✅ FAQ** — RF-09
- **T2.10 · ✅ Footer + `/privacidad` + `/gracias` + `404`** — RF-11, RF-13

### Fase 3 — Integraciones y pulido (→ M4)
- **T3.1 · Web3Forms** (envío real, fallback sin JS, estados, honeypot) — RF-10, ADR-06. **Listo cuando** un envío de prueba llega al email. *(Estados, validación accesible, honeypot, fallback sin JS y `form_submit` hechos y probados con la API simulada. [[PENDIENTE]] `PUBLIC_WEB3FORMS_KEY` en Vercel y envío de prueba real; el usuario lo dejó para después.)*
- **T3.2 · GA4 diferido + eventos** — §9.3, RNF-03, RNF-12. **Listo cuando** los eventos aparecen en DebugView. *(Código hecho en T1.7/T3.1: carga diferida, listener delegado y eventos sin PII. [[PENDIENTE]] `PUBLIC_GA_ID` en Vercel y verificación en DebugView.)*
- **T3.3 · ✅ JSON-LD** (`Person`, `Service`, `FAQPage`) — §9.4. **Listo cuando** Rich Results Test no reporta errores. *(Grafo con `SportsOrganization`, `Person`, `Service` con `Offer` en MXN y `FAQPage`; lo provisional se excluye. Validado por e2e; falta pasar Rich Results Test sobre producción cuando se publique.)*
- **T3.4 · ✅ Animaciones** (revelado al scroll, microinteracciones) con `emil-design-eng` — RNF-07. *(Un solo momento propio, el gis de Carga & Descarga, sin revelados genéricos; presión `scale(0.97)`, entrada del menú con `@starting-style` y tiempos asimétricos en el botón flotante. Detalle en `DESIGN.md` · Movimiento.)*
- **T3.5 · ✅ `impeccable critique` + `polish`** sobre la landing completa. *(Crítica 25/32 en un solo contexto, sin subagentes; polish de todo lo que no es contenido: Hero móvil con la foto antes de los indicadores, entrada a la rutina online, un solo texto para los CTA, marcas de agarre de gis, precios pendientes ocultos, sección activa en el menú, pista del carrusel e interlineado de etiquetas. Detector: 0 hallazgos.)* **→ M4**
- **T3.6 · ✅ Movimiento «Peso y control»** (pedido del usuario, 2026-10-19: que la página se sienta viva) — RNF-01/02/07. Entrada del Hero, revelados ligados al scroll con CSS, barras de acero que se trazan, magnesia que cae, indicador de sección, FAQ animadas y microinteracciones. Detalle en `DESIGN.md` · Movimiento. **Listo cuando** Lighthouse sigue ≥ 95 y con movimiento reducido no hay animaciones. *(Lighthouse: 99/100/100/100, LCP 1.9 s, CLS 0; 178 e2e en verde.)*
- **T3.7 · ✅ Ola 1 · Más gis** (pedido del usuario, 2026-10-24): clases por semana dibujadas como marcas de gis en los paquetes, trazos de gis en los títulos, nube de magnesia al tocar WhatsApp, palomitas de gis en el formulario y la FAQ, y grano de pizarrón en los fondos. Motor en `src/lib/chalk.ts`.
- **T3.8 · ✅ Ola 2 · Contar el método** (2026-10-24): línea de gis entre los 3 pasos ligada al scroll, ciclo Carga & Descarga interactivo (radios nativos + `:has()`, funciona sin JS), cinta de disciplinas que avanza solo con el scroll y transición entre páginas (View Transitions, el header persiste).
- **T3.9 · ✅ Ola 3 · Firma** (2026-10-24): el título del Hero «siente la gravedad» bajo el puntero, la foto colgante responde con física de péndulo y anotaciones a mano informativas en Kalam recortada (14 KB; segunda familia de RNF-05), que se carga al acercarse para no afectar el LCP. *(Lighthouse: 99/100/100/100, LCP 1.88 s, CLS 0; 239 e2e en verde; JS propio ≈ 4.4 KB gzip.)*
- **T3.10 · ✅ Acento vino de la guía de marca** (2026-10-25, branch `red-theme`) — D-10, RNF-06: `signal` pasa del amarillo al vino `#6A1E2B` (hover en burdeos `#4F111E`) con texto `chalk` encima; nuevo `signal-glow` `#E0707F` para foco, cursor y enlaces sobre acero; foco en vino oscuro en las secciones claras (`on-light`); resplandor vino en el CTA primario (única sombra del sistema); error sobre oscuro a naranja `#FFA057`. *(Tipografía de la guía, Momentum Grotesk, fuera de alcance: se queda Archivo. 275 e2e en verde, axe incluido.)*
- **T3.11 · ✅ Tipografía Readex Pro** (2026-10-25, branch `red-theme`) — RNF-05: Readex Pro Variable (Fontsource, latino, solo peso 160–700, 31 KB, precargada) reemplaza a Archivo (90 KB) a pedido del usuario. Sin eje de ancho: se quitan las utilidades `stretch-*`, los pesos 800–900 pasan a 700 y la escala de titulares se reduce (display `clamp(2.625rem, 12.5vw, 5.25rem)`, h2 `clamp(2rem, 8vw, 3.75rem)`) para que nada se desborde a 320 px. `og-image.jpg` regenerada con Readex. Kalam sigue como segunda familia.
- **T3.12 · ✅ Más vino, en dos niveles** (2026-10-26, sobre `main`) — D-10: el relleno vino queda solo para acciones; el vino claro marca lo que significa algo (semanas de carga, números de los pasos, progreso de scroll, sección activa del menú) y un halo vino da profundidad a la foto del Hero y al cierre de Contacto. Regla en `DESIGN.md` (Color).
- **T3.13 · Atletas de gis** (2026-10-26, sobre `main`) — RNF-07: siluetas de gis que hacen ejercicios ligados al scroll, en SVG + JS mínimo (sin canvas ni librerías; ADR-04/05). Por fases: ✅ **1)** dominadas junto a «Entrena online» (prototipo para validar el estilo); ✅ **2)** salto hacia la barra que no está en la 404 (una sola vez, sin scroll); ✖ **3)** atleta en la cinta de disciplinas: descartado por saturar la zona del Hero; ✅ **4)** a pedido del usuario, fondos en paralelas (ella) junto a «Lo que dicen los alumnos» y muscle-up en anillas (él, en carbón) bajo «Preguntas frecuentes»; el muscle-up sigue la biomecánica del muscle-up estricto (ver `DESIGN.md`). Para cumplir «nunca dos en la misma pantalla» (prueba e2e), la pistol squat pasó de «Carga & Descarga» a /gracias, donde se mueve una sola vez. Reglas en `DESIGN.md` (Movimiento · Atletas de gis).
- **T3.14 · ✅ Palabra clave en vino** (2026-10-26) — D-10: «gravedad» en el Hero y «hoy» en el cierre van en vino claro (se conserva al partir el título en letras). *(Lighthouse local tras T3.11–T3.14: 99/100/100/100 en `/`, LCP 1.9 s, CLS 0, TBT 0 ms; `/privacidad` 100/100/100/100.)*

- **T3.15 · ✅ Ruta de skills** (2026-10-26, sobre `main`) — RF-04.1, RNF-07: sección `#skills` con una escalera de 4 etapas por skill, dibujadas en gis con las proporciones de los atletas (`src/lib/skill-poses.ts`, poses fijas). En los levers y la plancha, el ángulo del brazo se calcula para que el centro de masa quede bajo la barra o sobre las manos. Las etapas suben desde su escalón al verse y al cambiar de skill. Se descartaron el front lever como separador (ya está en la escalera) y más magnesia (ya existe en el Hero y en los enlaces de WhatsApp).
- **T3.16 · ✅ Meta en movimiento y etapa en WhatsApp** (2026-10-26, sobre `main`) — RF-04.1: la meta de cada skill se ejecuta una vez al verse (y al elegir otro skill) y termina en su pose fija; cada etapa es un radio y la elegida se agrega al mensaje de WhatsApp. Reglas en `DESIGN.md` (Ruta de skills).
- **T3.17 · ✅ Ruta de skills conectada y medida** (2026-10-26, sobre `main`) — RF-01, RF-04.1, RF-09, §9.3: «Skills» en el menú; enlace desde la FAQ; eventos `skill_view` y `skill_stage` (sin PII); la etapa elegida se propone en el formulario de contacto; cronómetro de gis en la meta. Lighthouse local: 99/100/100/100 en `/` (LCP 2.0 s, CLS 0, TBT 0 ms) y 100/100/100/100 en `/privacidad`. *(Descartado: enlazar la cinta de disciplinas, porque se mueve con el scroll y repite cada palabra tres veces.)*
- **T3.18 · ✅ Skills en bucle, sin etapas** (2026-10-26, sobre `main`) — RF-04.1, §9.1, §9.3: a pedido del usuario, cada skill es una sola figura de gis que lo hace en bucle (ida, sostén, vuelta y una pausa) mientras la sección se ve. Se quitan las etapas, la meta, el cronómetro, «¿En qué etapa vas?» (con su nota en WhatsApp y su propuesta en el formulario) y el evento `skill_stage`. Los skills de barra no llevan escalón de piso.
- **T3.19 · ✅ Misma escala, ella y él, posición o repeticiones** (2026-10-26, sobre `main`) — RF-04.1: a pedido del usuario, todas las figuras van a la misma escala (unidades del dibujo → rem); parada de manos, front lever y pistol squat los hace ella (proporciones de los atletas, glúteo y cola de caballo que cuelga con la gravedad) y muscle-up, planche y back lever él; los skills de posición llegan a ella una vez (y otra vez al volver a elegirlos) y se quedan, y los de repeticiones van en bucle.
- **T3.20 · ✅ Biomecánica de los skills** (2026-10-26, sobre `main`) — RF-04.1, RNF-07: a pedido del usuario, revisión de las animaciones contra la técnica de cada ejercicio. Pistol squat (skill y atleta de `/gracias`): la inclinación del tronco se calcula para que el centro de masa quede sobre el pie de apoyo; la rodilla pasa la punta del pie, el glúteo baja cerca del talón y la pierna libre queda casi paralela al piso. Muscle-up: hollow body con balanceo, jalón explosivo, transición brusca y fondo con la cadera contra la barra y el centro de masa sobre las manos. Levers, plancha, parada de manos y muscle-up en anillas ya cumplían.

### Fase 4 — QA y lanzamiento (→ M5)
- **T4.1 · ✅ Completar la suite e2e** (sin JS, reduced motion, axe, WebKit) — RNF-06–08, RNF-11.
- **T4.2 · ✅ Lighthouse CI con aserciones ≥ 95** — RNF-01, RNF-02. *(Bloqueante en CI: 4 categorías ≥ 95, LCP < 2.5 s, CLS < 0.1, TBT < 200 ms en `/` y `/privacidad`. Local: 100/100/100/100, LCP 1.7 s, CLS 0. JS propio ≈ 2.3 KB gzip, RNF-03.)*
- **T4.3 · ✅ Auditoría final con `web-design-guidelines`** y corrección de hallazgos. *(2026-10-19: sin hallazgos que corregir; se aceptan como decisiones conscientes el `outline-none` del `<main>` (solo recibe foco programático del skip link), la voz en primera persona del coach y los precios como texto en `src/data/services.ts` en lugar de `Intl.NumberFormat`.)*
- **T4.4 · Pruebas en dispositivos reales** (iPhone con Safari y Android con Chrome): formulario, WhatsApp y slider.
- **T4.5 · Cargar contenido y fotos reales** — §17.
- **T4.6 · `check:content` en verde** (sin `[[PENDIENTE]]`).
- **T4.7 · Producción en Vercel:** ~~desactivar los builds de Netlify (§11.1 paso 1)~~ (hecho), pasar `nuevo-sitio` → `main` según D-05, `PUBLIC_SITE_URL=https://controlgravedad.vercel.app` y GA4 verificado en producción. *(Publicación anticipada el 2026-10-19 a petición del usuario, con contenido provisional visible. Pendiente para cerrarla: T4.6, `PUBLIC_GA_ID` y la key de Web3Forms.)*
- **T4.8 · Retiro del sitio de Netlify** (§11.1 pasos 2–5) — *dep.* T4.7. **Listo cuando** la URL `*.netlify.app` redirige (301) a la nueva, las bios de las redes apuntan a la nueva URL y el sitemap está enviado a Search Console. **→ M5**
- **T4.9 · ✅ Solo online y sin precios** (2026-10-26, branch `solo-online`) — RF-02, RF-04, RF-07–RF-09, RF-11, §9.4: notas del coach (§17.1.2). Fuera clases presenciales, Talleres, la oferta de clase muestra gratis, los precios (también del JSON-LD) y toda mención de Morelia en la landing y el SEO; un solo servicio (Rutina personalizada) con el precio por WhatsApp; bloque "¿Necesitas algo más personalizado?" (`#a-medida`) enlazado desde el Hero y la FAQ; pasos de "Cómo funciona" reescritos; `og-image.jpg` regenerada. e2e: la home no muestra precios, "presencial", "Morelia" ni "clase muestra".

## 16. Definición de "terminado"

**Por tarea:** cumple la aceptación de los RF/RNF que cita · `astro check` y build sin errores · prueba e2e añadida o actualizada · capturas revisadas a 375 y 1280 px · sin hallazgos abiertos de `web-design-guidelines` · commit con mensaje descriptivo.

**Por lanzamiento (M5):** todas las tareas cerradas · CI en verde · RNF-01 a RNF-12 verificados · contenido real · aviso de privacidad aprobado por el cliente · sitio en `controlgravedad.vercel.app` con HTTPS.

---

# Parte D — Pendientes, decisiones y riesgos

## 17. Contenido y assets del cliente

### 17.1 ⛔ Información de la marca desde Instagram (T0.0, bloqueante)

**Claude lo pide al inicio de la siguiente sesión.** El usuario puede pegarlo como texto o compartir capturas de pantalla.

- [ ] **Información general de la marca:** descripción o bio, misión o filosofía, a quién va dirigida y el tono de comunicación (formal, cercano, motivacional…).
- [ ] **Servicios:** lista completa de lo que ofrece (clases grupales o individuales, presencial, online, planes, retos, talleres…).
- [ ] **Costos y precios:** por clase, paquetes y mensualidades, por modalidad. Promociones vigentes y métodos de pago.
- [ ] **Horarios:** días y horas de las clases presenciales; disponibilidad para online.
- [ ] **Ubicación(es) en Morelia:** parque, gimnasio o estudio, y si se puede publicar la dirección (D-06).
- [ ] **Modalidad online:** cómo funciona (app, videollamada, videos, seguimiento por WhatsApp), frecuencia y qué recibe el alumno.
- [ ] **Restricciones y políticas:** edad mínima, condiciones de salud, nivel requerido, cupo por grupo, cancelaciones o reposiciones, reglamento.
- [ ] **Sobre el coach:** historia, años de experiencia, certificaciones, logros o competencias.
- [ ] **Prueba social:** testimonios, publicaciones de antes y después (con permiso), número aproximado de alumnos.
- [ ] **Oferta de entrada:** si ya existe una clase de prueba, valoración gratuita o similar (D-02).
- [ ] **Identidad visual:** logo, colores y tipografías que ya usa en Instagram; publicaciones que mejor la representan.
- [ ] **Contacto y redes:** usuario de Instagram, TikTok (si existe), número de WhatsApp y email.
- [ ] **Preguntas frecuentes** que le hacen por mensaje directo.
- [ ] **Otros:** cualquier dato de la marca que el usuario considere relevante.

### 17.1.1 Información recibida (2026-10-19)

> Resultado de T0.0, ya volcado en §2, RF-03, RF-04, RF-07, RF-08, RF-09 y §18.

**Marca**
- Lema (bio de Instagram): "Formamos deportistas hábiles y conscientes." · "Desafía tu ser gravitacional" · "Desafía la gravedad con nosotros".
- Disciplinas: Calistenia · Streetlifting · Movilidad · Skills Movements · Funcional. También imparte talleres.
- Tono: motivacional, con humor en los reels.
- Redes: Instagram [@controlgravedad](https://www.instagram.com/controlgravedad) (1,430 seguidores al 2026-10-19) · TikTok [@controlgravedad](https://www.tiktok.com/@controlgravedad).

**Contacto**
- WhatsApp: +52 443 301 9533 (`524433019533` en los enlaces).
- Email público (formulario y aviso de privacidad): **controlgravedad@gmail.com**. El email personal del coach no se publica.

**Método: Carga & Descarga** (publicación del 2024-04-10). César lo **implementa**; no es su creador, así que el sitio nunca lo presenta como «método propio» (2026-10-26). Las semanas alternan:
- *Semana de carga:* fuerza relativa y absoluta, resistencia cardiovascular y muscular, técnica pulcra y rangos de repetición adecuados.
- *Semana de descarga:* biomecánica y técnica, descanso, movilidad y elasticidad para cuidar músculos y articulaciones ("progreso consciente").

**Servicios y precios** (publicación del 2024-12-18, MXN)

| Servicio | Precio | Detalle |
|---|---|---|
| Clase muestra | Gratis | Sujeta a disponibilidad de horario y espacio en la clase → oferta de entrada (D-02) |
| Clase individual | $60 | 1 clase presencial |
| Paquete I | $360 | 3 clases por semana durante 30 días |
| Paquete II | $500 | 5 clases por semana durante 30 días |
| Rutina personalizada | $860 | 2 rutinas en PDF para 4 semanas (carga y descarga), ejercicios explicados, imágenes demostrativas y glosario. Requiere correo, formulario y comprobante de pago; se entrega por correo en 7–12 días |

- Todos los entrenamientos presenciales los imparte un coach capacitado.
- La modalidad "online" es la Rutina personalizada (no hay asesoría en vivo, salvo que se indique otra cosa).

> La tabla anterior es lo publicado en Instagram en 2024. Lo vigente para el sitio está en §17.1.2.

#### 17.1.2 Notas del coach (2026-10-26)

- **No publicar precios:** la persona interesada debe escribirle para conocerlos.
- **Ya no da clases presenciales en Morelia; solo online.** Se quita del sitio todo lo que diga que hay clases presenciales, y Morelia ya no aparece (salvo en el aviso de privacidad, como domicilio del responsable).
- Sí entrena en persona caso por caso (por ejemplo, yendo al gimnasio del alumno), pero **no quiere que se publique**: el sitio solo invita a escribirle "si necesitas algo más personalizado".
- FAQ "¿Necesito equipo?": se quita "El equipo de la clase lo pone el coach". Se quita "¿Puedo entrenar si no vivo en Morelia?".
- Decisiones del usuario sobre lo que esto deja abierto: se retira la oferta de entrada (clase muestra gratis), el único servicio publicado es la Rutina personalizada y Talleres se retira.
- **Respuestas del coach (2026-10-26, segunda tanda):**
  - Skills que enseña: parada de manos, muscle-up, front lever, planche, back lever y pistol squat.
  - Pago por SPEI. El plan vence a los 30 días; **sí** incluye seguimiento después de enviar la rutina y **sí** se renueva cada mes.
  - Talleres: fuera hasta nuevo aviso; el coach avisará cuando haya.
  - Edad: a partir de 15 años; menores con permiso de un adulto.
  - Salud: César envía un Google Form donde pide el estado de salud y las lesiones (fuera del sitio).

**Pagos:** transferencia SPEI, con nombre y apellido en el concepto y captura del comprobante. La CLABE **no** se publica en el sitio ni en el repo; se comparte por WhatsApp.

**Gravedad Zero** ([@gravedadzero_mx](https://www.instagram.com/gravedadzero_mx)): evento de calistenia organizado por el coach en Morelia el 2026-01-10 (exhibición, aprendizaje y comunidad). No hay ediciones próximas. Se usa como credencial en RF-03, no como evento.

**Contenido demo (2026-10-24, a pedido del usuario):** lo que falta se rellenó con texto e imágenes de ejemplo. Cada pieza muestra un aviso visible «Demo» (`DemoNote`) con lo que hay que reunir o desarrollar. Las fotos son de stock CC0/dominio público (`src/assets/demo/CREDITOS.md`). No se inventaron precios, certificaciones ni años de experiencia. El contenido demo no se publica en el JSON-LD, y los `[[PENDIENTE]]` siguen en comentarios de `src/data/` para que `check:content` bloquee el lanzamiento hasta tener lo real.

**Pendientes de T0.0** (lista revisada el 2026-10-26)

*Antes de compartir el sitio:*
- [ ] [[PENDIENTE]] **Permiso de uso de las reseñas de Google Maps** (Roberto González, Sofía Hernández y Asdrubal Ramirez): el coach les escribe, les muestra el recorte exacto que se publica y guarda la respuesta (captura del chat). Si alguien dice que no, se quita su reseña de `src/data/testimonials.ts`. Hasta entonces, la sección muestra el aviso «Demo».
- [ ] [[PENDIENTE]] Historia, años de experiencia y certificaciones del coach.
- [ ] [[PENDIENTE]] ¿Qué necesita el alumno para entrenar (barra, paralelas, ligas…)? Hoy la FAQ dice solo "Ropa cómoda, agua y toalla" (demo).
- [ ] [[PENDIENTE]] Fotos: la del Hero en alta resolución (≥ 1600 × 2000 px) y fotos reales de antes y después (con consentimiento escrito). *(2026-10-26: llegaron las de Gael, ya en el sitio; de él faltan el consentimiento, el tiempo de entrenamiento y el logro. Falta un segundo atleta.)*
- [ ] [[PENDIENTE]] Aviso de privacidad: nombre del responsable, fecha y validación del texto.
- [ ] [[PENDIENTE]] Formulario de salud del coach (Google Form): agregarle aviso de privacidad y casilla de consentimiento expreso, porque pide datos sensibles (LFPDPPP).

*Cuando estén:*
- [ ] [[PENDIENTE]] Número de participantes de Gravedad Zero (el usuario lo consulta con el coach).
- [ ] [[PENDIENTE]] Talleres: el coach avisa cuando haya; mientras, no se publican.
- [ ] [[PENDIENTE]] Más testimonios (idealmente de alumnos de la rutina online) para llegar a 4–6 (RF-06).
- [ ] [[PENDIENTE]] Logo en SVG oficial. Mientras tanto, `src/components/ui/Logo.astro` es un redibujo vectorial del de 150 px (también en `favicon.svg` y `og-image.jpg`).
- [ ] [[PENDIENTE]] Paleta oficial: aplicada la de la guía de marca Vol. 1 (vino `#6A1E2B`, burdeos `#4F111E`); falta que el diseñador confirme los hex exactos (D-10).
- [ ] [[PENDIENTE]] Preguntas frecuentes que recibe por DM.

*Resueltos:*
- [x] Nombre del coach en el sitio: **César Augusto** (T1.1).
- [x] Precios, clase individual, horarios y ubicación en Morelia: ya no aplican (solo online, sin precios publicados; §17.1.2).
- [x] Skills, edad mínima y salud: respondidos el 2026-10-26 (§17.1.2).
- [x] Etapas de cada skill: ya no aplican (T3.18, la ruta de skills ya no muestra etapas).
- [x] CTA de la Rutina personalizada: WhatsApp.
- [x] Tipografía: restricción de "elegante" levantada por el usuario en T1.2; se usó Archivo y desde el 2026-10-25 Readex Pro, a pedido del usuario (§10, `DESIGN.md`).
- [x] Prueba social: 3 reseñas de Google Maps (falta su permiso, arriba).

### 17.2 Assets y datos restantes

Leyenda: 🔴 bloquea el inicio · 🟠 bloquea el diseño (T1.2) · 🟢 bloquea solo el lanzamiento (T4.5). Varios de estos se cubren con §17.1.

| | Elemento | Especificación |
|---|---|---|
| ✅ | Nombre del coach / marca | **César Augusto** · escuela **Control Gravedad** |
| ✅ | Ciudad / zona de servicio | **Online** (2026-10-26; antes Morelia presencial + online) |
| ✅ | Información de la marca desde Instagram | §17.1.1 (T0.0) |
| 🟠 | Foto o video del Hero | Foto ≥ 2400×1600 px (horizontal) **y** ≥ 1080×1920 px (vertical). Video: 10–20 s, sin audio, 1080p |
| 🟠 | Fotos profesionales del coach | ≥ 1600 px por el lado mayor, buena luz y fondo limpio |
| 🟠 | Preferencias de estilo / color | Referencias que le gusten o colores de marca existentes |
| 🟢 | Logo | SVG preferido |
| ✅ | Número de WhatsApp | `524433019533` |
| ✅ | Instagram y TikTok | @controlgravedad en ambas |
| ✅ | Email que recibe los formularios | controlgravedad@gmail.com |
| 🟢 | Historia, certificaciones y logros | ≤ 120 palabras + lista |
| ✅ | Servicios | Solo la Rutina personalizada, sin precio publicado (RF-04, §17.1.2) |
| 🟢 | Fotos de antes/después | Mismo encuadre, pose y luz; vertical 4:5; **consentimiento escrito** de cada alumno |
| 🟢 | Testimonios | Nombre, foto (opcional), texto y autorización de uso |
| ✅ | Oferta de entrada | Ninguna: la clase muestra gratis se retiró el 2026-10-26 (D-02) |
| 🟢 | Datos para el aviso de privacidad | Nombre del responsable y email de contacto ARCO |
| 🟢 | Cuenta de GA4 | ¿Ya existe? ¿Quién la administra? |

## 18. Decisiones abiertas

| ID | Pregunta | Default propuesto | Bloquea |
|---|---|---|---|
| D-01 | ~~¿Mostrar precios?~~ | ✅ **Resuelta: sí**, ya son públicos en Instagram (vigencia `[[PENDIENTE]]`) | — |
| D-02 | ~~¿Cuál es la oferta de entrada?~~ | ✅ **Resuelta: ninguna.** Era la clase muestra gratis (presencial); se retiró el 2026-10-26 al quedar el servicio solo online | — |
| D-03 | ¿Hero con video o imagen? | Imagen; video solo en escritorio si hay buen material | T2.2 |
| D-04 | ~~¿Vercel Pro u otro hosting?~~ | ✅ **Resuelta: Vercel Hobby (gratuito)** | — |
| D-05 | ~~Branch de producción~~ | ✅ **Resuelta (2026-10-19):** `main` es producción en Vercel y ya contiene el sitio nuevo (*fast-forward* desde `nuevo-sitio`). Se sigue desarrollando en `nuevo-sitio` (preview) y los cambios pasan a `main` solo cuando el usuario lo pide | — |
| D-06 | ¿Hay dirección física pública (estudio o gimnasio)? | No → `Person` + `Service` con `areaServed` | T3.3 |
| D-07 | ~~¿Dónde está publicado el sitio actual?~~ | ✅ **Resuelta: en Netlify**; se migra a Vercel (§11.1) | — |
| D-08 | ~~¿El sitio de Netlify usa dominio propio?~~ | ✅ **Resuelta: no, usa `*.netlify.app`**. La migración es por redirección 301 (§11.1) | — |
| D-09 | ¿Comprar un dominio propio (ej. `controlgravedad.mx`)? | Opcional, después de v1. Mejora la confianza y el SEO; en Vercel Hobby no cuesta conectarlo | — |
| D-10 | Paleta de colores oficial | Aplicada la guía de marca Vol. 1 (T3.10, 2026-10-25): acento vino en lugar del amarillo provisional. Falta confirmar los hex con el diseñador (solo tokens) | Nada (si cambian, solo tokens) |

## 19. Riesgos

| ID | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| R-01 | El contenido y las fotos reales llegan tarde | Retrasa M5; un diseño hecho con fotos de stock no representa la marca | Contenido provisional con `[[PENDIENTE]]` + `check:content`; pedir los 🟠 primero |
| R-02 | Fotos de antes/después de baja calidad o sin consentimiento | Pierde credibilidad o tiene riesgo legal | Especificación de §17 + consentimiento escrito; si faltan, la sección se oculta |
| R-03 | GA4 baja la puntuación de Lighthouse | Incumple RNF-01 | Carga diferida (§9.3) |
| R-04 | Spam en el formulario | Ruido en el email del coach | Honeypot; plan de escape de ADR-06 |
| R-05 | Uso comercial en Vercel Hobby (sus términos lo restringen a uso no comercial) | Vercel podría pausar el proyecto | **Riesgo aceptado por el usuario.** Mitigación: ADR-11 (sitio 100% portable). Si ocurre, se pasa a Vercel Pro o a Cloudflare Pages/Netlify (gratis, permiten uso comercial) sin cambiar código |
| R-06 | Netlify despliega el proyecto nuevo al fusionar en `main` | Sitio en producción roto o sobrescrito durante la migración | §11.1 paso 1 antes del merge (T4.7) |
| R-07 | Enlaces viejos a `*.netlify.app` (bio de Instagram, mensajes) dejan de llevar al sitio | Se pierden visitas | Redirección 301 en Netlify + actualizar las bios (§11.1 pasos 3–4) |

---

## Historial de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| v0.1 | 2026-10-18 | Borrador inicial |
| v0.1.1 | 2026-10-18 | Skills de Claude Code (§13) |
| v0.2 | 2026-10-18 | Reestructura en Partes A–D; IDs y aceptación por requisito; ADRs; arquitectura y modelo de contenido; estrategia de pruebas y CI; hitos y tareas con dependencias; especificación de assets; decisiones abiertas y riesgos |
| v0.3 | 2026-10-18 | Marca (Control Gravedad / Cesar Augusto); Vercel Hobby (D-04); migración desde Netlify (§11.1, T4.8, R-06); ADR-11 de portabilidad; D-08 |
| v0.4 | 2026-10-18 | Morelia + online; sin dominio propio (D-08 resuelta, D-09); migración por redirección 301; **T0.0 bloqueante**: información de Instagram (§17.1) que Claude pide al iniciar la siguiente sesión |
| v0.5 | 2026-10-19 | **T0.0 cerrada:** información de la marca (§17.1.1) volcada en §2, RF-03/04/07/08/09, §8 y §18; D-01 y D-02 resueltas; D-10 (paleta provisional); tipografía elegante (§10); sin dominio propio en §3, M5 y §16 |
| v0.6 | 2026-10-19 | T1.1 (`PRODUCT.md`), T1.2 (dirección «Gis y acero», `DESIGN.md`) y T1.3 (tokens + Archivo); restricción de tipografía elegante levantada por el usuario; nombre del coach: César Augusto |
| v0.6.1 | 2026-10-19 | D-05 resuelta: `main` adelantada a `nuevo-sitio` (builds de Netlify ya desactivados); el desarrollo sigue en `nuevo-sitio` |
| v0.7 | 2026-10-19 | Fases 2–3 y T4.1–T4.3 completas; `main` publicada en producción con contenido provisional (a petición del usuario); pendientes: contenido real (T4.5), Web3Forms, GA4 y pruebas en dispositivos (T4.4) |
| v0.8 | 2026-10-19 | T3.6: sistema de movimiento «Peso y control» (reemplaza la regla de un solo momento propio de `DESIGN.md`) |
| v0.9 | 2026-10-24 | T3.7–T3.9: tres olas de movimiento y gis (marcas por semana, títulos marcados, nube de magnesia, línea entre pasos, ciclo interactivo, cinta de disciplinas, View Transitions, título con gravedad, foto con física, anotaciones en Kalam) |
| v0.9.1 | 2026-10-24 | Contenido e imágenes demo con aviso visible de lo que falta (sin datos comerciales inventados); `[[PENDIENTE]]` conservados en comentarios |
| v0.9.2 | 2026-10-25 | `nuevo-sitio` eliminada (era idéntica a `main`); el trabajo sigue en branches que salen de `main`. T3.10: acento vino de la guía de marca Vol. 1 en el branch `red-theme` (D-10 casi resuelta, faltan los hex confirmados) |
| v0.9.3 | 2026-10-25 | T3.11: tipografía Readex Pro en lugar de Archivo (branch `red-theme`) |
| v0.10 | 2026-10-26 | Notas del coach (§17.1.2): **solo online y sin precios publicados**. Se retiran clases presenciales, Talleres y la oferta de entrada (D-02); RF-02/04/07/08/09/11 y §9 actualizados (T4.9) |
| v0.10.1 | 2026-10-26 | Segunda tanda de respuestas del coach (§17.1.2): skills que enseña, seguimiento y renovación mensual de la rutina, edad (15+, menores con permiso) y formulario de salud |
| v0.10.2 | 2026-10-26 | Testimonios: 3 reseñas reales de Google Maps (recortadas, con atribución, sin foto); su permiso de uso queda pendiente. Lista de pendientes de §17.1 revisada |
| v0.10.3 | 2026-10-26 | T3.12: más elementos vino según la guía de marca (vino en dos niveles: acción / significado y profundidad) |
| v0.10.4 | 2026-10-26 | T3.13 fase 1: primer atleta de gis (dominadas ligadas al scroll) junto a «Entrena online» |
| v0.10.5 | 2026-10-26 | T3.13 fase 2: pistol squat junto a «Carga & Descarga» y salto en la 404; fase 3 descartada |
| v0.10.6 | 2026-10-26 | T3.14: palabra clave en vino en el Hero y el cierre; Lighthouse verificado |
| v0.10.7 | 2026-10-26 | T3.13 fase 4: fondos en paralelas y muscle-up en anillas; la pistol squat pasa a /gracias; prueba de «nunca dos atletas en la misma pantalla» |
| v0.10.8 | 2026-10-26 | T3.13: muscle-up en anillas más realista (agarre falso, jalón al pecho inclinado atrás, transición rápida, correa que sigue el centro de masa) |
| v0.10.9 | 2026-10-26 | T3.13: en el muscle-up las anillas se quedan en el pecho y los codos siguen bajando hasta el bloqueo; brazos legibles sobre el torso |
| v0.10.10 | 2026-10-26 | T3.13: el codo del muscle-up ya no se voltea hacia la espalda al subir o bajar |
| v0.11 | 2026-10-26 | RF-04.1 / T3.15: ruta de skills (escalera de 4 etapas por skill, con CTA de WhatsApp por skill) |
| v0.11.1 | 2026-10-26 | T3.16: la meta de cada skill se ejecuta; «¿En qué etapa vas?» agrega la etapa al mensaje de WhatsApp (§9.1) |
| v0.11.2 | 2026-10-26 | T3.17: «Skills» en el menú y la FAQ, eventos `skill_view`/`skill_stage` (§9.3), etapa propuesta en el formulario y cronómetro en la meta |
| v0.11.3 | 2026-10-26 | RF-06: logo de Google junto a cada reseña de Google Maps |
| v0.11.4 | 2026-10-26 | T3.13: glúteos naturales en la atleta de gis (fondos y pistol squat): curva de la espalda baja al muslo en vez de un círculo |
| v0.12 | 2026-10-26 | RF-04.1 / T3.18: la ruta de skills pasa a una figura en bucle por skill; se quitan etapas, meta, cronómetro y `skill_stage` (§9.1, §9.3) |
| v0.12.1 | 2026-10-26 | RF-04.1 / T3.19: misma escala para todas las figuras; ella y él; los skills de posición se quedan en ella y los de repeticiones van en bucle |
| v0.12.2 | 2026-10-26 | T3.13: la atleta de los fondos lleva las piernas estiradas al frente en diagonal (técnica correcta); muscle-up de la ruta de skills fluido; glúteo con las proporciones de ella |
| v0.12.3 | 2026-10-26 | Se quitan las marcas de agarre de gis sobre la barra del Hero y su polvo de magnesia |
| v0.12.4 | 2026-10-26 | Sin resplandores: se quitan los halos vino de la foto del Hero y del cierre de Contacto, y el halo del CTA primario (queda su canto de 1 px). Ajusta T3.10/T3.12 |
| v0.12.5 | 2026-10-26 | Foto del Hero: se desenrolla desde la barra con un zoom que se asienta, una sola vez; se quitan su balanceo, su respuesta al puntero y su parallax |
| v0.12.6 | 2026-10-26 | César **implementa** el método Carga & Descarga, no es su creador: se corrigen la credencial («Implementa el método…») y el indicador del Hero («método de trabajo»); §2 y §17.1.1 |
