// Utilidades compartidas de la landing /gravedad: movimiento reducido, color
// desde CSS, un único observador de scroll con rAF y bucles que se pausan
// fuera de pantalla o con la pestaña oculta.

export const reducedMotion = (): boolean =>
  matchMedia('(prefers-reduced-motion: reduce)').matches;

export const clamp = (value: number, min = 0, max = 1): number =>
  Math.min(max, Math.max(min, value));

/** Lee una propiedad personalizada (un token de color) ya resuelta. */
export const cssVar = (el: Element, name: string): string =>
  getComputedStyle(el).getPropertyValue(name).trim();

/** Convierte cualquier color CSS a componentes 0–1 (para GLSL). */
export function rgb(color: string): [number, number, number] {
  const probe = document.createElement('canvas');
  probe.width = probe.height = 1;
  const ctx = probe.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [1, 1, 1];
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

export interface CanvasSize {
  width: number;
  height: number;
  scale: number;
  resized: boolean;
}

/** Ajusta el búfer del canvas a su caja CSS (DPR limitado). */
export function fitCanvas(
  canvas: HTMLCanvasElement,
  maxDpr = 2,
): CanvasSize | null {
  const scale = Math.min(window.devicePixelRatio || 1, maxDpr);
  const width = Math.round(canvas.clientWidth * scale);
  const height = Math.round(canvas.clientHeight * scale);
  if (!width || !height) return null;
  const resized = canvas.width !== width || canvas.height !== height;
  if (resized) {
    canvas.width = width;
    canvas.height = height;
  }
  return { width, height, scale, resized };
}

/** Ejecuta `task` en tiempo libre (o pronto, si el navegador no lo ofrece). */
export function idle(task: () => void, timeout = 1200): void {
  if ('requestIdleCallback' in window) requestIdleCallback(task, { timeout });
  else setTimeout(task, 60);
}

// Observador de scroll: un solo listener y un solo rAF para toda la página.
const ticks = new Set<() => void>();
let queued = false;
let bound = false;

function flush(): void {
  queued = false;
  for (const tick of ticks) tick();
}

function request(): void {
  if (queued) return;
  queued = true;
  requestAnimationFrame(flush);
}

/**
 * Llama a `tick` (dentro de un rAF) con cada scroll o cambio de tamaño, solo
 * mientras `el` está cerca de la pantalla; al salir se llama una vez más para
 * dejar el estado final.
 */
export function onScrollFrame(
  el: Element,
  tick: () => void,
  margin = '25%',
): void {
  if (!bound) {
    bound = true;
    addEventListener('scroll', request, { passive: true });
    addEventListener('resize', request);
  }
  new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        ticks.add(tick);
        request();
      } else {
        ticks.delete(tick);
        tick();
      }
    },
    { rootMargin: `${margin} 0px` },
  ).observe(el);
}

export interface Loop {
  /** Activa o detiene el bucle (además de la pausa automática). */
  set(on: boolean): void;
}

/**
 * Bucle de animación que solo corre mientras `el` se ve y la pestaña está
 * activa. `fps` limita la frecuencia de dibujo.
 */
export function createLoop(
  el: Element,
  frame: (now: number, dt: number) => void,
  fps = 60,
): Loop {
  let raf = 0;
  let last = 0;
  let visible = false;
  let enabled = true;
  const interval = 1000 / fps - 3;

  const step = (now: number) => {
    raf = requestAnimationFrame(step);
    const dt = now - last;
    if (dt < interval) return;
    last = now;
    frame(now, Math.min(dt, 64));
  };
  const sync = () => {
    const run = enabled && visible && !document.hidden;
    if (run && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(step);
    } else if (!run && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(el);
  document.addEventListener('visibilitychange', sync);
  return {
    set(on) {
      enabled = on;
      sync();
    },
  };
}
