# CLAUDE.md

Landing page de conversión para **Control Gravedad**, la escuela de calistenia del coach **César Augusto** (clases presenciales en Morelia, Michoacán, y online). Astro (estático) + Tailwind v4 + TypeScript, desplegada en **Vercel Hobby** (gratuito) en `controlgravedad.vercel.app`. Reemplaza al sitio actual de `main`, publicado en `*.netlify.app`.

**La fuente de verdad es [`spec-drive.md`](spec-drive.md).** Antes de implementar, lee la tarea (`Tx.y`) y los requisitos (`RF-xx`/`RNF-xx`) que cubre. Si algo no está en el spec o lo contradice, pregunta antes de improvisar, y refleja cualquier cambio de alcance en el spec (incluido su historial).

## ⛔ Primero, al iniciar cualquier sesión de desarrollo

Si la tarea **T0.0** del spec no está marcada como cerrada, **antes de hacer cualquier otra cosa pide al usuario la información de la marca tomada del Instagram de Control Gravedad**: costos, precios, horarios, restricciones, información general de la marca, etc. El checklist completo está en el spec, §17.1. No avances con otras tareas hasta recibirla (o hasta que el usuario diga explícitamente que se omita).

## Estado

- Branch de trabajo: `nuevo-sitio`. Proyecto desde cero: **no** se usa nada del branch `main`.
- Progreso: ver §15 del spec (las tareas cerradas se marcan ahí).

## Comandos

> Disponibles a partir de la Fase 0.

```bash
nvm use                # Node ≥ 22.22 (versión en .nvmrc; Astro 7 la exige)
npm run dev            # servidor local en http://localhost:4321
npm run build          # build de producción → dist/
npm run preview        # sirve dist/
npm run check          # astro check (tipos y contenido)
npm run test:e2e       # Playwright (e2e + axe)
npm run check:content  # falla si queda algún [[PENDIENTE]]
npm run format         # Prettier (format:check en CI)
```

## Reglas del proyecto

- **Portable (ADR-11):** nada específico de Vercel (sin adaptador, funciones ni paquetes `@vercel/*`); lo único propio de Vercel es `vercel.json`.
- **Sin React ni librerías de UI/animación** (shadcn/ui, Framer Motion, AOS). La interactividad va con `<script>` de Astro, elementos nativos, CSS o WAAPI (ADR-04/05).
- **Mejora progresiva:** sin JS, todo el contenido se ve y los CTAs y el formulario funcionan.
- **Contenido fuera de los componentes:** todo texto, precio, imagen o enlace vive en `src/data/*.ts`. Los componentes solo reciben props.
- **Contenido provisional** siempre marcado con `[[PENDIENTE]]`. Nunca inventes datos que parezcan reales (credenciales, cifras, testimonios, precios).
- **Enlaces de WhatsApp** solo vía `waLink()` de `src/lib/whatsapp.ts`, con `data-track="whatsapp"` y `data-source`.
- **Estilos:** solo tokens de `@theme` (salen de `DESIGN.md`); nada de colores ni tamaños sueltos.
- **Imágenes:** `astro:assets` (`<Image>`/`<Picture>`) con `alt` descriptivo; solo el Hero lleva prioridad alta.
- **Accesibilidad:** WCAG 2.2 AA; `prefers-reduced-motion` respetado; objetivos táctiles ≥ 44 px.
- **Sin PII en analítica:** nunca enviar nombre ni teléfono a GA4.
- **Idioma:** el texto visible está en español (`es-MX`); el código (nombres de variables, componentes, archivos) está en inglés.

## Skills (rol único de cada una)

| Skill | Usar para |
|---|---|
| `impeccable` | Dirección visual, `PRODUCT.md`/`DESIGN.md`, `critique`/`polish`. Modo *Persuade* |
| `emil-design-eng` | Detalle de animaciones y microinteracciones (traducir sus ejemplos de React a CSS/WAAPI) |
| `web-design-guidelines` | Auditar cada sección terminada |
| `playwright-cli` | Ver la página en el navegador y tomar capturas a 375 / 768 / 1280 px |

Jerarquía ante conflictos: `spec-drive.md` > `DESIGN.md` > Impeccable > Emil.

## Ciclo por tarea

1. Construir lo que pide la tarea, y nada más.
2. `npm run check` + `npm run build`.
3. Capturas con `playwright-cli` a 375 y 1280 px y revisarlas.
4. Revisar con `web-design-guidelines` y corregir hallazgos.
5. Añadir o actualizar la prueba e2e.
6. Marcar la tarea en el spec (§15) y hacer commit (solo si el usuario lo pide).

## Git

- Commits pequeños, uno por tarea, con el mensaje en español y el ID de la tarea: `feat(T2.2): hero con CTA a WhatsApp`.
- No hacer push ni merge a `main` sin confirmación del usuario.
- ⚠️ `main` está conectado a Netlify: antes de fusionar en `main` hay que desactivar los builds de Netlify (spec §11.1).
