// Gis vivo (DESIGN.md · Movimiento):
// - Los SVG con [data-chalk] se trazan a mano la primera vez que entran en pantalla.
// - Al tocar un enlace de WhatsApp salta una nube de magnesia desde el dedo.
// Con movimiento reducido no se hace nada: el gis ya se ve dibujado.

const reduceMotion = () =>
  matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initChalk(): void {
  initNear();
  if (reduceMotion()) return;
  initDraw();
  document.addEventListener('pointerdown', onPointerDown, { passive: true });
}

/** Marca las notas a mano cuando están a una pantalla de distancia. */
function initNear(): void {
  const notes = document.querySelectorAll<Element>('.chalk-note');
  if (!notes.length) return;
  if (!('IntersectionObserver' in window)) {
    notes.forEach((note) => note.setAttribute('data-near', ''));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('data-near', '');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '100% 0px' },
  );
  notes.forEach((note) => observer.observe(note));
}

function initDraw(): void {
  const items = document.querySelectorAll<Element>('[data-chalk]');
  if (!items.length || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('data-drawn', '');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.6 },
  );
  for (const item of items) {
    item.setAttribute('data-chalk-ready', '');
    observer.observe(item);
  }
}

function onPointerDown(event: PointerEvent): void {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (!target.closest('[data-track="whatsapp"]')) return;
  burst(event.clientX, event.clientY);
}

/** Nube de magnesia: salta hacia arriba en abanico y cae acelerando. */
function burst(x: number, y: number): void {
  const layer = document.createElement('div');
  layer.className = 'chalk-burst';
  layer.setAttribute('aria-hidden', 'true');
  layer.style.left = `${x}px`;
  layer.style.top = `${y}px`;
  document.body.append(layer);

  const animations = Array.from({ length: 12 }, () => {
    const particle = document.createElement('span');
    const size = 2 + Math.random() * 3;
    particle.style.width = particle.style.height = `${size}px`;
    layer.append(particle);

    const angle = ((-90 + (Math.random() - 0.5) * 150) * Math.PI) / 180;
    const distance = 16 + Math.random() * 34;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const fall = 36 + Math.random() * 54;
    return particle.animate(
      [
        {
          translate: '0 0',
          opacity: 0.95,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        },
        {
          translate: `${dx}px ${dy}px`,
          opacity: 0.85,
          offset: 0.3,
          easing: 'cubic-bezier(0.55, 0, 0.9, 0.45)',
        },
        { translate: `${dx * 1.3}px ${dy + fall}px`, opacity: 0 },
      ],
      { duration: 800 + Math.random() * 400, fill: 'forwards' },
    );
  });

  Promise.allSettled(animations.map((a) => a.finished)).then(() =>
    layer.remove(),
  );
}
