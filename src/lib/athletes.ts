// Atletas de gis (DESIGN.md · Atletas de gis): cada repetición avanza con el
// scroll mientras el atleta cruza la pantalla; si el scroll se detiene, el
// atleta también. En páginas sin scroll (404), el movimiento ocurre una sola
// vez al aparecer. Con movimiento reducido no se hace nada: queda la pose fija.

import { athletes, type Exercise, type Shape } from './athlete-poses';

const ATTRS: Record<Shape['kind'], string[]> = {
  line: ['x1', 'y1', 'x2', 'y2'],
  circle: ['cx', 'cy'],
  path: ['d'],
};

export function update(
  parts: HTMLCollection | undefined,
  shapes: Shape[],
): void {
  if (!parts) return;
  shapes.forEach((shape, i) => {
    const el = parts[i];
    if (!el) return;
    for (const attr of ATTRS[shape.kind]) {
      el.setAttribute(attr, String(shape[attr as keyof typeof shape]));
    }
  });
}

/** Dibuja el cuerpo para un esfuerzo/avance `s`, y el equipo que se mueve. */
function apply(svg: SVGSVGElement, s: number): void {
  const rig = athletes[svg.dataset.athlete as Exercise];
  if (!rig) return;
  update(svg.querySelector('[data-body]')?.children, rig.pose(s));
  if (rig.gear) update(svg.querySelector('[data-gear]')?.children, rig.gear(s));
}

/** Ms por repetición cuando un atleta de repeticiones se mueve una sola vez. */
const REP_MS = 1100;

/** Pose de un atleta de repeticiones según el avance total (0 → 1). */
function reps(svg: SVGSVGElement, travel: number): void {
  const rig = athletes[svg.dataset.athlete as Exercise];
  if (rig?.play !== 'scroll') return;
  // Cada repetición sube y baja con una curva suave (coseno).
  const phase = (travel * rig.reps) % 1;
  apply(svg, (1 - Math.cos(phase * 2 * Math.PI)) / 2);
}

function drawScroll(svg: SVGSVGElement): void {
  const rect = svg.getBoundingClientRect();
  // 0 cuando asoma por abajo, 1 cuando sale por arriba.
  reps(
    svg,
    Math.min(
      1,
      Math.max(0, (innerHeight - rect.top) / (innerHeight + rect.height)),
    ),
  );
}

function playOnce(svg: SVGSVGElement): void {
  const rig = athletes[svg.dataset.athlete as Exercise];
  if (!rig) return;
  const duration = rig.play === 'once' ? rig.duration : rig.reps * REP_MS;
  let start = 0;
  const tick = (now: number) => {
    start ||= now;
    const progress = Math.min(1, (now - start) / duration);
    if (rig.play === 'once') apply(svg, progress);
    // Al terminar la última repetición, `phase` vuelve a 0 (posición inicial).
    else reps(svg, progress === 1 ? 0 : progress);
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function initAthletes(): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const svgs = document.querySelectorAll<SVGSVGElement>('svg[data-athlete]');
  if (!svgs.length || !('IntersectionObserver' in window)) return;

  const visible = new Set<SVGSVGElement>();
  let frame = 0;
  const update = () => {
    frame = 0;
    visible.forEach(drawScroll);
  };
  const schedule = () => {
    if (!frame && visible.size) frame = requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const svg = entry.target as SVGSVGElement;
        if (svg.dataset.play === 'once') {
          // Empieza cuando se ve bien, no cuando apenas asoma.
          if (entry.intersectionRatio < 0.6) continue;
          observer.unobserve(svg);
          playOnce(svg);
        } else if (entry.isIntersecting) visible.add(svg);
        else visible.delete(svg);
      }
      schedule();
    },
    { threshold: [0, 0.6] },
  );
  svgs.forEach((svg) => observer.observe(svg));
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
}
