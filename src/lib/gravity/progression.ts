// Progresión: la línea vino claro de 2 px y su rombo bajan por el riel
// conforme avanza el scroll. Sin JS (o con movimiento reducido) la línea ya
// está completa y el rombo, al final.
import { clamp, onScrollFrame } from './util';

export function initProgression(): void {
  const rail = document.querySelector<HTMLElement>('[data-rail]');
  const line = rail?.querySelector<HTMLElement>('[data-rail-progress]');
  const marker = rail?.querySelector<HTMLElement>('[data-rail-marker]');
  if (!rail || !line || !marker) return;

  let drawn = -1;
  onScrollFrame(rail, () => {
    const rect = rail.getBoundingClientRect();
    if (!rect.height) return;
    // El rombo va a ~55 % de la altura de la pantalla.
    const progress = clamp(
      (window.innerHeight * 0.55 - rect.top) / rect.height,
    );
    const step = Math.round(progress * 2000);
    if (step === drawn) return;
    drawn = step;
    line.style.transform = `scaleY(${progress})`;
    marker.style.translate = `0 ${-(1 - progress) * rect.height}px`;
  });
}
