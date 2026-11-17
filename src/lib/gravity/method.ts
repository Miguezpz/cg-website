// El método: puntos de fondo en Canvas 2D (una onda lenta, pausada fuera de
// pantalla) y la ruta de cuatro etapas, que se traza en 5 s con WAAPI y marca
// cada nodo cuando el trazo pasa por él.
import { createLoop, fitCanvas } from './util';

const DRAW_MS = 5000;
const SPACING = 24;

function initDots(reduce: boolean): void {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-dots]');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  const color = getComputedStyle(canvas).color;

  const draw = (time: number) => {
    const size = fitCanvas(canvas, 1.5);
    if (!size) return;
    const { width, height, scale } = size;
    const gap = SPACING * scale;
    const dot = Math.max(1, Math.round(scale));
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = color;
    for (let y = gap / 2; y < height; y += gap) {
      for (let x = gap / 2; x < width; x += gap) {
        const wave = Math.sin((x * 0.011 + y * 0.019) / scale - time * 0.0007);
        ctx.globalAlpha = 0.4 + 0.6 * (0.5 + 0.5 * wave);
        ctx.fillRect(Math.round(x), Math.round(y), dot, dot);
      }
    }
  };

  if (reduce) {
    new ResizeObserver(() => draw(0)).observe(canvas);
    return;
  }
  createLoop(canvas, draw, 12);
}

function initPath(): void {
  const svg = document.querySelector<SVGElement>('[data-method-path]');
  const stroke = svg?.querySelector<SVGPathElement>('[data-path-progress]');
  if (!svg || !stroke) return;
  const marks = [...svg.querySelectorAll<SVGElement>('[data-node-mark]')];

  // Estado inicial: sin trazo y sin marcas. Solo cuando hay JS y movimiento.
  stroke.style.strokeDashoffset = '1';
  for (const mark of marks) mark.style.scale = '0';

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      stroke.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
        duration: DRAW_MS,
        easing: 'linear',
        fill: 'forwards',
      });
      for (const mark of marks) {
        mark.animate([{ scale: 0 }, { scale: 1 }], {
          duration: 260,
          delay: Number(mark.dataset.at ?? 0) * DRAW_MS,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'forwards',
        });
      }
      svg.setAttribute('data-drawn', '');
    },
    { threshold: 0.45 },
  );
  observer.observe(svg);
}

export function initMethod(reduce: boolean): void {
  initDots(reduce);
  if (!reduce) initPath();
}
