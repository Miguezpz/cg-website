# Spec: Landing Page — Control Gravedad (Coach Cesar Augusto)

> Documento de especificación (spec-driven development). Es la **fuente de verdad** del proyecto: define **qué** se construye (Parte A), **cómo** (Parte B), **en qué orden** (Parte C) y **qué falta** (Parte D). Cualquier cambio de alcance se refleja primero aquí y se anota en el historial.

| Campo | Valor |
|---|---|
| Marca / escuela | **Control Gravedad** |
| Coach | **Cesar Augusto** |
| Modalidad | **Presencial en Morelia, Michoacán** y **online** |
| Branch | `nuevo-sitio` |
| Versión | v0.3 (borrador) |
| Punto de partida | Proyecto desde cero. No se reutiliza código, estilos ni estructura del branch `main` |
| Idioma del sitio | Español (`es-MX`) |
| Hosting | **Vercel, plan Hobby (gratuito)**, en un subdominio `*.vercel.app` (sin dominio propio). Reemplaza al sitio actual en `*.netlify.app` (ver §11.1) |

> ## ⛔ Antes de cualquier desarrollo: T0.0
> El usuario debe compartir la **información de la marca tomada del Instagram de Control Gravedad** (costos, precios, horarios, restricciones, información general, etc.; checklist completo en §17.1).
> **Claude debe pedir esta información al inicio de la siguiente sesión de desarrollo**, antes de ejecutar cualquier otra tarea.

**Convención de IDs:** `RF-xx` requisito funcional · `RNF-xx` requisito no funcional · `ADR-xx` decisión técnica · `Tx.y` tarea · `M#` hito · `D-xx` decisión abierta · `R-xx` riesgo. Las tareas citan los requisitos que cubren, y cada requisito dice cómo se verifica.

---

# Parte A — Producto (qué y por qué)

## 1. Objetivo

Construir una **landing page de conversión** para **Control Gravedad**, la escuela de calistenia del coach **Cesar Augusto**, que funcione como embudo de ventas digital: el visitante conoce la **autoridad** del coach, ve **resultados reales**, resuelve sus **objeciones** y termina **contactándolo** para contratar clases.

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
| Ocupado / remoto | Entrenar con guía desde casa | "No tengo tiempo / no vivo cerca" | Servicios (online), FAQ |
| Todos | Saber cuánto cuesta y si vale la pena | "Seguro es caro" | Oferta de entrada, Servicios ("desde $X") |

**Dispositivo principal:** móvil. Todo se diseña *mobile-first* y se valida primero a 375 px.

## 3. Alcance

### Incluido (v1)
- Landing de una sola página (`/`) con las secciones de §4.
- Página `/privacidad` (aviso de privacidad, obligatorio porque el formulario recolecta datos personales).
- Página `404` con la marca y un CTA de regreso.
- Botón flotante de WhatsApp, formulario funcional, analítica de conversión, SEO técnico.
- Despliegue en Vercel con dominio propio.

### Fuera de alcance (v1)
- Pagos en línea, blog, área de miembros, login, reservas automáticas, multi-idioma, CMS, pruebas A/B.

## 4. Requisitos funcionales

Orden de secciones = orden del embudo: **atención → autoridad → oferta → prueba → facilidad → objeciones → acción**.

### RF-01 · Header y navegación
- Logo o nombre a la izquierda; enlaces ancla: Sobre mí · Servicios · Resultados · FAQ · Contacto; CTA "Contáctame" siempre visible.
- Header *sticky* que gana fondo al hacer scroll.
- En móvil: menú hamburguesa accesible.

**Aceptación:** los enlaces llevan a su sección sin que el header la tape (`scroll-margin-top`); el menú abre y cierra con teclado y con `Esc`, actualiza `aria-expanded`, y se cierra al elegir un enlace.

### RF-02 · Hero
- Imagen a pantalla completa (o video con *poster*, ver D-03); título orientado a beneficio; subtítulo de 1 línea.
- CTA primario **"Agenda tu clase de prueba"** → WhatsApp; CTA secundario "Ver resultados" → `#resultados`.
- 2–3 indicadores de autoridad (ej. "+X alumnos", "X años").

**Aceptación:** título y CTA primario visibles sin scroll a 375×667; el elemento LCP es una imagen con `fetchpriority="high"` (nunca el video).

### RF-03 · Sobre el coach (`#sobre-mi`)
- Foto profesional, historia breve (≤ 120 palabras), al menos 3 credenciales (certificaciones, años, logros).

### RF-04 · Servicios (`#servicios`)
- Tarjetas: **Clases presenciales (Morelia)**, **Asesoría online**, **Planes de entrenamiento**. El catálogo final se ajusta a lo que entregue T0.0.
- Cada tarjeta: nombre, para quién es, qué incluye (3–5 puntos), precio o "desde $X" (D-01) y CTA.

**Aceptación:** cada CTA abre WhatsApp con un mensaje prellenado **distinto** que nombra el servicio (ver §9.1).

### RF-05 · Resultados: antes y después (`#resultados`)
- 2–4 casos con slider comparativo, más el nombre o inicial, el tiempo de entrenamiento y un logro concreto.
- Slider implementado con `<input type="range">` + `clip-path` (accesible por diseño, sin librerías).

**Aceptación:** funciona con mouse, touch y flechas del teclado; tiene `aria-label` y `aria-valuetext` ("Mostrando 50% antes"); cada imagen tiene un `alt` descriptivo; sin JS se ven ambas fotos lado a lado.

### RF-06 · Testimonios (`#testimonios`)
- 3–6 testimonios con foto, nombre, cita y logro. Carrusel con *scroll-snap* en móvil y cuadrícula en escritorio.

**Aceptación:** todo el contenido es legible y navegable sin JS.

### RF-07 · Cómo funciona
- Tres pasos: **Escríbeme** → **Clase de valoración** → **Tu plan a la medida**.

### RF-08 · Oferta de entrada
- Bloque destacado con la oferta (D-02), urgencia **honesta** opcional ("cupos limitados por mes") y CTA a WhatsApp.

### RF-09 · Preguntas frecuentes (`#faq`)
- 6–8 preguntas con `<details>`/`<summary>` nativos. Deben cubrir: experiencia previa, ubicación, precios, duración, equipo, edad y modalidad online.

**Aceptación:** funciona sin JS; las mismas preguntas se emiten como JSON-LD `FAQPage`.

### RF-10 · Contacto y CTA final (`#contacto`)
- Título de cierre, botón grande de WhatsApp y enlaces a Instagram y TikTok.
- Formulario: nombre*, WhatsApp/teléfono*, objetivo* (select), mensaje (opcional) y casilla de aceptación del aviso de privacidad*.
- Anti-spam: campo *honeypot*.
- Estados visibles: enviando (botón deshabilitado), éxito y error (con el WhatsApp como alternativa).

**Aceptación:** un envío real llega al email del coach; la confirmación aparece sin recargar; con JS desactivado, el formulario se envía igual (POST nativo) y redirige a una página de gracias; los errores de validación se anuncian a lectores de pantalla (`aria-live`).

### RF-11 · Footer
- Nombre, redes, zona de servicio ("Morelia, Michoacán · Online"), © año actual (calculado en build) y enlace a `/privacidad`.

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
| RNF-09 | SEO: `title`/`description` únicos con marca + keyword local (ej. "Control Gravedad · Clases de calistenia en Morelia y online con Cesar Augusto"), canónica, OG/Twitter 1200×630, `sitemap.xml`, `robots.txt`, JSON-LD | Rich Results Test + Lighthouse SEO |
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
type Service   = { id: 'presencial' | 'online' | 'plan'; name: string; audience: string;
                   includes: string[]; price?: string; waMessage: string };
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
- Todos los enlaces llevan `data-track="whatsapp"` y `data-source="hero|services|offer|contact|floating"` para la analítica.

### 9.2 Formulario (Web3Forms)
- `<form method="POST" action="https://api.web3forms.com/submit">` con `access_key` (pública por diseño), `redirect` → `/gracias` (fallback sin JS) y `botcheck` (honeypot).
- Con JS: `fetch` + estados de UI y `track('form_submit', { goal })`, sin enviar nombre ni teléfono a GA4.

### 9.3 Analítica
| Evento GA4 | Disparador | Parámetros |
|---|---|---|
| `whatsapp_click` | Clic en `[data-track=whatsapp]` | `source`, `service` |
| `form_submit` | Envío exitoso | `goal` |
| `social_click` | Clic en Instagram/TikTok | `network` |

- Un solo listener delegado en `document` (sin handlers por botón).
- `whatsapp_click` y `form_submit` se marcan como **eventos clave** en GA4.
- GA4 se carga después de `load` o en la primera interacción para cumplir RNF-01 y RNF-03.

### 9.4 SEO y datos estructurados
- JSON-LD: `Person` (el coach) + `Service` por servicio con `areaServed` (presencial: Morelia, Michoacán; online: México) + `FAQPage`. Se usa `LocalBusiness` solo si hay una dirección física pública (D-06).
- `site` definido en `astro.config.mjs` (necesario para la canónica y el sitemap).

## 10. Diseño visual

- La dirección visual la define **Impeccable** en modo *Persuade* y queda en `DESIGN.md` (tokens, tipografía, espaciado, componentes, movimiento). `PRODUCT.md` guarda el contexto de negocio (§1–2 de este spec).
- Punto de partida (puede cambiar en T1.2): estilo oscuro, enérgico y deportivo; fotos protagonistas; tipografía display condensada + sans legible; un solo color de acento; `#25D366` reservado para WhatsApp.
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

1. **Antes de fusionar `nuevo-sitio` → `main`**, desactivar los builds automáticos en Netlify (*Site configuration → Build & deploy → Stop builds*). Si no, Netlify intentará desplegar el nuevo proyecto Astro sobre el sitio en producción.
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
| **M5 · Lanzamiento** | Contenido real, QA aprobado y dominio en producción | Fase 4 |

## 15. Tareas

Formato: **ID · tarea** — *depende de* · *cubre* · **listo cuando**.

### Fase 0 — Fundaciones (→ M0, M1)
- **T0.0 · ⛔ Recibir la información de la marca (BLOQUEANTE, va antes de todo).** Al iniciar la siguiente sesión de desarrollo, **Claude pregunta al usuario** por la información del Instagram de Control Gravedad (checklist en §17.1). Con lo recibido: actualizar §2, RF-03, RF-04, RF-08, RF-09, §17 y §18, y dejar los huecos que falten como `[[PENDIENTE]]`. **Listo cuando** el usuario confirma que el spec refleja la marca. **→ M0**
- **T0.1 · Limpiar el legado** — *dep.* T0.0: eliminar `index.html`, `script.js`, `styles.css`, `assets/` y `.vscode/` (si no se usa). **Listo cuando** solo quedan `.claude/`, `CLAUDE.md` y `spec-drive.md`.
- **T0.2 · Inicializar Astro** (plantilla mínima, TS estricto, `engines.node`) — *dep.* T0.1. **Listo cuando** `npm run dev` y `npm run build` funcionan.
- **T0.3 · Tailwind v4 + `@astrojs/sitemap` + Prettier** — *dep.* T0.2. **Listo cuando** una clase de Tailwind se refleja en el build.
- **T0.4 · Configuración del repo:** `.gitignore` (incluye `.playwright-cli/`, `.env`, `dist/`), `.env.example` y scripts de npm (`check`, `test:e2e`, `check:content`, `format`). **Listo cuando** `npm run check` pasa.
- **T0.5 · Playwright + axe + Lighthouse CI + GitHub Actions** con una prueba humo — *dep.* T0.3. **Listo cuando** CI está en verde en GitHub.
- **T0.6 · Conectar Vercel Hobby** (importar el repo con `nuevo-sitio` como branch de preview, variables de entorno, `vercel.json` con cabeceras) — *dep.* T0.5. **Listo cuando** existe la URL de preview y securityheaders.com da A o superior. **→ M1**

### Fase 1 — Contexto y sistema de diseño (→ M2)
- **T1.1 · `impeccable init`** usando §1–2 de este spec → `PRODUCT.md`. **Listo cuando** el usuario aprueba `PRODUCT.md`.
- **T1.2 · `impeccable shape`** de la landing → dirección visual + `DESIGN.md` — *dep.* T1.1 y, si es posible, fotos reales (§17 🟠). **Listo cuando** el usuario aprueba la dirección visual.
- **T1.3 · Tokens en `global.css` + fuentes Fontsource** — *dep.* T1.2 · RNF-05.
- **T1.4 · `BaseLayout`** (meta SEO, OG, canónica, `lang="es-MX"`, *skip link*) — RNF-09.
- **T1.5 · Componentes UI** (`Button` primario/secundario/WhatsApp, `Card`, `Badge`, `SectionHeading`, `Container`) con estados hover, active, focus y disabled — RNF-06.
- **T1.6 · Modelo de contenido** (`src/data/types.ts` + datos provisionales con `[[PENDIENTE]]`) — §8.
- **T1.7 · `lib/whatsapp.ts` + `lib/analytics.ts`** con un listener delegado — §9.1 y §9.3. **Listo cuando** la prueba e2e valida el `href` generado. **→ M2**

### Fase 2 — Secciones (→ M3, luego M4)
Cada tarea se cierra con el ciclo de §13 y su prueba e2e.
- **T2.1 · Header + menú móvil** — RF-01
- **T2.2 · Hero** — RF-02
- **T2.3 · Servicios** — RF-04
- **T2.4 · Contacto (UI del formulario + WhatsApp) + botón flotante** — RF-10, RF-12. **→ M3**
- **T2.5 · Sobre el coach** — RF-03
- **T2.6 · Resultados + `BeforeAfterSlider`** — RF-05
- **T2.7 · Testimonios** — RF-06
- **T2.8 · Cómo funciona + Oferta** — RF-07, RF-08
- **T2.9 · FAQ** — RF-09
- **T2.10 · Footer + `/privacidad` + `/gracias` + `404`** — RF-11, RF-13

### Fase 3 — Integraciones y pulido (→ M4)
- **T3.1 · Web3Forms** (envío real, fallback sin JS, estados, honeypot) — RF-10, ADR-06. **Listo cuando** un envío de prueba llega al email.
- **T3.2 · GA4 diferido + eventos** — §9.3, RNF-03, RNF-12. **Listo cuando** los eventos aparecen en DebugView.
- **T3.3 · JSON-LD** (`Person`, `Service`, `FAQPage`) — §9.4. **Listo cuando** Rich Results Test no reporta errores.
- **T3.4 · Animaciones** (revelado al scroll, microinteracciones) con `emil-design-eng` — RNF-07.
- **T3.5 · `impeccable critique` + `polish`** sobre la landing completa. **→ M4**

### Fase 4 — QA y lanzamiento (→ M5)
- **T4.1 · Completar la suite e2e** (sin JS, reduced motion, axe, WebKit) — RNF-06–08, RNF-11.
- **T4.2 · Lighthouse CI con aserciones ≥ 95** — RNF-01, RNF-02.
- **T4.3 · Auditoría final con `web-design-guidelines`** y corrección de hallazgos.
- **T4.4 · Pruebas en dispositivos reales** (iPhone con Safari y Android con Chrome): formulario, WhatsApp y slider.
- **T4.5 · Cargar contenido y fotos reales** — §17.
- **T4.6 · `check:content` en verde** (sin `[[PENDIENTE]]`).
- **T4.7 · Producción en Vercel:** desactivar los builds de Netlify (§11.1 paso 1), merge según D-05, `PUBLIC_SITE_URL=https://controlgravedad.vercel.app` y GA4 verificado en producción.
- **T4.8 · Retiro del sitio de Netlify** (§11.1 pasos 2–5) — *dep.* T4.7. **Listo cuando** la URL `*.netlify.app` redirige (301) a la nueva, las bios de las redes apuntan a la nueva URL y el sitemap está enviado a Search Console. **→ M5**

## 16. Definición de "terminado"

**Por tarea:** cumple la aceptación de los RF/RNF que cita · `astro check` y build sin errores · prueba e2e añadida o actualizada · capturas revisadas a 375 y 1280 px · sin hallazgos abiertos de `web-design-guidelines` · commit con mensaje descriptivo.

**Por lanzamiento (M5):** todas las tareas cerradas · CI en verde · RNF-01 a RNF-12 verificados · contenido real · aviso de privacidad aprobado por el cliente · sitio en el dominio propio con HTTPS.

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

### 17.2 Assets y datos restantes

Leyenda: 🔴 bloquea el inicio · 🟠 bloquea el diseño (T1.2) · 🟢 bloquea solo el lanzamiento (T4.5). Varios de estos se cubren con §17.1.

| | Elemento | Especificación |
|---|---|---|
| ✅ | Nombre del coach / marca | **Cesar Augusto** · escuela **Control Gravedad** (confirmar si es "César" con acento) |
| ✅ | Ciudad / zona de servicio | **Morelia, Michoacán (presencial) + online** |
| 🔴 | Información de la marca desde Instagram | §17.1 (T0.0) |
| 🟠 | Foto o video del Hero | Foto ≥ 2400×1600 px (horizontal) **y** ≥ 1080×1920 px (vertical). Video: 10–20 s, sin audio, 1080p |
| 🟠 | Fotos profesionales del coach | ≥ 1600 px por el lado mayor, buena luz y fondo limpio |
| 🟠 | Preferencias de estilo / color | Referencias que le gusten o colores de marca existentes |
| 🟢 | Logo | SVG preferido |
| 🟢 | Número de WhatsApp | Con código de país (52…) |
| 🟢 | Instagram y TikTok | Usuarios |
| 🟢 | Email que recibe los formularios | Para la cuenta de Web3Forms |
| 🟢 | Historia, certificaciones y logros | ≤ 120 palabras + lista |
| 🟢 | Servicios: qué incluye cada uno y precios | Ver D-01 |
| 🟢 | Fotos de antes/después | Mismo encuadre, pose y luz; vertical 4:5; **consentimiento escrito** de cada alumno |
| 🟢 | Testimonios | Nombre, foto (opcional), texto y autorización de uso |
| 🟢 | Oferta de entrada | Ver D-02 |
| 🟢 | Datos para el aviso de privacidad | Nombre del responsable y email de contacto ARCO |
| 🟢 | Cuenta de GA4 | ¿Ya existe? ¿Quién la administra? |

## 18. Decisiones abiertas

| ID | Pregunta | Default propuesto | Bloquea |
|---|---|---|---|
| D-01 | ¿Mostrar precios? | "Desde $X MXN" | T2.3 (puede ir con valor provisional) |
| D-02 | ¿Cuál es la oferta de entrada? | "Primera clase de valoración gratis" | T2.8 |
| D-03 | ¿Hero con video o imagen? | Imagen; video solo en escritorio si hay buen material | T2.2 |
| D-04 | ~~¿Vercel Pro u otro hosting?~~ | ✅ **Resuelta: Vercel Hobby (gratuito)** | — |
| D-05 | Branch de producción | Merge de `nuevo-sitio` → `main` al cerrar M4; `main` es producción en Vercel | T4.7 |
| D-06 | ¿Hay dirección física pública (estudio o gimnasio)? | No → `Person` + `Service` con `areaServed` | T3.3 |
| D-07 | ~~¿Dónde está publicado el sitio actual?~~ | ✅ **Resuelta: en Netlify**; se migra a Vercel (§11.1) | — |
| D-08 | ~~¿El sitio de Netlify usa dominio propio?~~ | ✅ **Resuelta: no, usa `*.netlify.app`**. La migración es por redirección 301 (§11.1) | — |
| D-09 | ¿Comprar un dominio propio (ej. `controlgravedad.mx`)? | Opcional, después de v1. Mejora la confianza y el SEO; en Vercel Hobby no cuesta conectarlo | — |

## 19. Riesgos

| ID | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| R-01 | El contenido y las fotos reales llegan tarde | Retrasa M5; un diseño hecho con fotos de stock no representa la marca | Contenido provisional con `[[PENDIENTE]]` + `check:content`; pedir los 🟠 primero |
| R-02 | Fotos de antes/después de baja calidad o sin consentimiento | Pierde credibilidad o tiene riesgo legal | Especificación de §17 + consentimiento escrito; si faltan, la sección se oculta |
| R-03 | GA4 baja la puntuación de Lighthouse | Incumple RNF-01 | Carga diferida (§9.3) |
| R-04 | Spam en el formulario | Ruido en el email del coach | Honeypot; plan de escape de ADR-06 |
| R-05 | Uso comercial en Vercel Hobby (sus términos lo restringen a uso no comercial) | Vercel podría pausar el proyecto | **Riesgo aceptado por el usuario.** Mitigación: ADR-11 (sitio 100% portable). Si ocurre, se pasa a Vercel Pro o a Cloudflare Pages/Netlify (gratis, permiten uso comercial) sin cambiar código |
| R-07 | Enlaces viejos a `*.netlify.app` (bio de Instagram, mensajes) dejan de llevar al sitio | Se pierden visitas | Redirección 301 en Netlify + actualizar las bios (§11.1 pasos 3–4) |
| R-06 | Netlify despliega el proyecto nuevo al fusionar en `main` | Sitio en producción roto o sobrescrito durante la migración | §11.1 paso 1 antes del merge (T4.7) |

---

## Historial de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| v0.1 | 2026-10-18 | Borrador inicial |
| v0.1.1 | 2026-10-18 | Skills de Claude Code (§13) |
| v0.2 | 2026-10-18 | Reestructura en Partes A–D; IDs y aceptación por requisito; ADRs; arquitectura y modelo de contenido; estrategia de pruebas y CI; hitos y tareas con dependencias; especificación de assets; decisiones abiertas y riesgos |
| v0.3 | 2026-10-18 | Marca (Control Gravedad / Cesar Augusto); Vercel Hobby (D-04); migración desde Netlify (§11.1, T4.8, R-06); ADR-11 de portabilidad; D-08 |
| v0.4 | 2026-10-18 | Morelia + online; sin dominio propio (D-08 resuelta, D-09); migración por redirección 301; **T0.0 bloqueante**: información de Instagram (§17.1) que Claude pide al iniciar la siguiente sesión |
