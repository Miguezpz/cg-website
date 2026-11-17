// Pila sticky de las tres primeras secciones: cada una se queda fija mientras
// la siguiente le pasa por encima; la tapada se encoge a 0.92 y se oscurece
// con un 55 % de negro. Sin este script (o con movimiento reducido) las
// secciones van una tras otra, en flujo normal.
import { clamp, onScrollFrame } from './util';

export function initStack(): void {
  const stack = document.querySelector<HTMLElement>('[data-stack]');
  if (!stack) return;
  const parts = [
    ...stack.querySelectorAll<HTMLElement>(':scope > [data-stack-item]'),
  ].map((item) => ({
    item,
    inner: item.querySelector<HTMLElement>('[data-stack-inner]'),
    shade: item.querySelector<HTMLElement>('[data-stack-shade]'),
  }));
  if (parts.length < 2) return;

  // Una sección más alta que la pantalla se fija cuando ya se vio completa.
  const measure = () => {
    const viewport = window.innerHeight;
    for (const { item } of parts) {
      item.style.setProperty(
        '--stick-top',
        `${Math.min(0, viewport - item.offsetHeight)}px`,
      );
    }
  };
  const observer = new ResizeObserver(measure);
  parts.forEach(({ item }) => observer.observe(item));
  addEventListener('resize', measure);
  measure();
  stack.setAttribute('data-enhanced', '');

  const state = parts.map(() => -1);
  onScrollFrame(stack, () => {
    const viewport = window.innerHeight;
    for (let i = 0; i < parts.length - 1; i++) {
      const next = parts[i + 1].item.getBoundingClientRect().top;
      const covered = Math.round(clamp(1 - next / viewport) * 500) / 500;
      if (covered === state[i]) continue;
      state[i] = covered;
      const { inner, shade } = parts[i];
      if (inner) {
        inner.style.transform = covered ? `scale(${1 - 0.08 * covered})` : '';
      }
      if (shade) shade.style.opacity = String(0.55 * covered);
    }
  });
}
