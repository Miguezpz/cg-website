// En la sesión: cada indicación sube desde su canto al entrar en pantalla.
// Sin JS o con movimiento reducido ya están a la vista.

export function initSession(): void {
  const rows = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!rows.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const row = entry.target as HTMLElement;
        row.animate(
          [
            { opacity: 0, translate: '0 1.5rem' },
            { opacity: 1, translate: '0 0' },
          ],
          {
            duration: 520,
            delay: Number(row.dataset.reveal ?? 0) * 120,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'backwards',
          },
        );
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  rows.forEach((row) => observer.observe(row));
}
