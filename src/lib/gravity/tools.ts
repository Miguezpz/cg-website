// Herramientas mínimas: Three.js (y el visor) se piden solo cuando la sección
// se acerca a la pantalla, para no pesar en la carga inicial.

export function initTools(reduce: boolean): void {
  const root = document.querySelector<HTMLElement>('[data-ring-viewer]');
  if (!root) return;
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      import('./ring-viewer')
        .then(({ mountRing }) => mountRing(root, reduce))
        // Sin WebGL o sin red: queda la foto del recorte.
        .catch(() => {});
    },
    { rootMargin: '600px 0px' },
  );
  observer.observe(root);
}
