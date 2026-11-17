// Costura entre una sección oscura y una clara: una retícula de 24 px del
// color de la sección que entra se disuelve hacia arriba. Cada celda tiene un
// umbral fijo (determinista), así que el patrón no parpadea: solo crece con
// el scroll. Cuadros mate, sin suavizado.
import { clamp, fitCanvas, onScrollFrame } from './util';

const CELL = 24;

/** Umbral fijo por celda, en [0, 1). */
function threshold(col: number, row: number, seed: number): number {
  const value = Math.sin(col * 127.1 + row * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

export function initGridDissolve(reduce: boolean): void {
  const canvases =
    document.querySelectorAll<HTMLCanvasElement>('[data-dissolve]');
  canvases.forEach((canvas, seed) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const color = getComputedStyle(canvas).color;
    let drawn = -1;

    const draw = (progress: number) => {
      const size = fitCanvas(canvas);
      if (!size) return;
      const step = Math.round(progress * 48);
      if (step === drawn && !size.resized) return;
      drawn = step;
      const { width, height, scale } = size;
      const cell = Math.round(CELL * scale);
      const rows = Math.ceil(height / cell);
      const cols = Math.ceil(width / cell);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      // La fila 0 toca la sección: es la más llena. Hacia arriba, menos. Con la
      // costura al pie de la pantalla aún no hay nada: crece al subir.
      for (let row = 0; row < rows; row++) {
        const density = (1 - (row + 0.5) / rows) * 1.7 * progress;
        const y = height - (row + 1) * cell;
        for (let col = 0; col < cols; col++) {
          if (threshold(col, row, seed) < density) {
            ctx.fillRect(col * cell, y, cell, cell);
          }
        }
      }
    };

    if (reduce) {
      // Cuadro fijo, a media disolución.
      new ResizeObserver(() => draw(0.5)).observe(canvas);
      return;
    }
    onScrollFrame(canvas, () => {
      const seam = canvas.getBoundingClientRect().bottom;
      draw(clamp(1 - seam / window.innerHeight));
    });
  });
}
