// Footer «onda de tensión»: una correa negra tejida que ondula en Canvas 2D,
// con su canto superior de 2 px en vino claro. Sin resplandor: relleno plano
// con trama y un poco de grano de gis.
import { createLoop, cssVar, fitCanvas } from './util';

const BASE = 18;

export function initFooterWave(reduce: boolean): void {
  const footer = document.querySelector<HTMLElement>('[data-footer]');
  const canvas = footer?.querySelector<HTMLCanvasElement>('[data-wave-canvas]');
  const ctx = canvas?.getContext('2d');
  if (!footer || !canvas || !ctx) return;

  const strap = cssVar(canvas, '--strap');
  const thread = cssVar(canvas, '--thread');
  const edge = cssVar(canvas, '--edge');
  const speck = cssVar(canvas, '--speck');
  let pattern: CanvasPattern | null = null;
  let patternScale = 0;

  // Trama de la correa: hilos cruzados de 1 px y motas de gis, en un mosaico.
  const weave = (scale: number): CanvasPattern | null => {
    const tile = document.createElement('canvas');
    const size = Math.round(12 * scale);
    tile.width = tile.height = size * 4;
    const t = tile.getContext('2d');
    if (!t) return null;
    t.fillStyle = strap;
    t.fillRect(0, 0, tile.width, tile.height);
    t.fillStyle = thread;
    const line = Math.max(1, Math.round(scale));
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2) continue;
        t.fillRect((col * size) / 2, (row * size) / 2, size / 2, line);
      }
    }
    t.fillStyle = speck;
    t.globalAlpha = 0.14;
    for (let i = 0; i < 26; i++) {
      const value = Math.sin(i * 91.7) * 43758.5453;
      const other = Math.sin(i * 17.3) * 24634.6345;
      t.fillRect(
        Math.floor((value - Math.floor(value)) * tile.width),
        Math.floor((other - Math.floor(other)) * tile.height),
        line,
        line,
      );
    }
    return ctx.createPattern(tile, 'repeat');
  };

  const draw = (time: number) => {
    const size = fitCanvas(canvas, 1.5);
    if (!size) return;
    const { width, height, scale } = size;
    if (!pattern || patternScale !== scale) {
      pattern = weave(scale);
      patternScale = scale;
    }
    const top = (x: number) =>
      (BASE +
        8 * Math.sin((x / scale) * 0.008 + time * 0.0011) +
        5 * Math.sin((x / scale) * 0.017 - time * 0.0007 + 1.3)) *
      scale;
    const step = 8 * scale;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(0, top(0));
    for (let x = step; x < width + step; x += step) ctx.lineTo(x, top(x));
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = pattern ?? strap;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, top(0));
    for (let x = step; x < width + step; x += step) ctx.lineTo(x, top(x));
    ctx.lineWidth = 2 * scale;
    ctx.strokeStyle = edge;
    ctx.stroke();
  };

  footer.setAttribute('data-wave', '');
  if (reduce) {
    new ResizeObserver(() => draw(0)).observe(canvas);
    return;
  }
  createLoop(canvas, draw, 30);
}
