// Header de /gravedad: transparente solo arriba del todo, sección activa en
// el menú y cierre del menú móvil (<details>) al elegir un enlace.

export function initHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-g-header]');
  if (!header) return;

  const sentinel = document.querySelector('[data-g-sentinel]');
  if (sentinel) {
    new IntersectionObserver(([entry]) => {
      header.toggleAttribute('data-at-top', entry.isIntersecting);
    }).observe(sentinel);
  }

  const menu = header.querySelector<HTMLDetailsElement>('[data-g-menu]');
  if (menu) {
    menu.addEventListener('click', (event) => {
      if ((event.target as Element).closest('a')) menu.open = false;
    });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !menu.open) return;
      menu.open = false;
      menu.querySelector<HTMLElement>('summary')?.focus();
    });
  }

  // Sección activa: la última (en orden del documento) que cruza la línea
  // media de la pantalla. En la pila sticky, la que tapa a las anteriores.
  const links = [...header.querySelectorAll<HTMLAnchorElement>('[data-g-nav]')];
  const sections = [
    ...document.querySelectorAll<HTMLElement>('[data-section]'),
  ];
  const onLine = new Set<HTMLElement>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) onLine.add(el);
        else onLine.delete(el);
      }
      const current = sections.findLast((section) => onLine.has(section));
      const hash = current ? `#${current.dataset.section}` : '';
      for (const link of links) {
        if (link.hash === hash) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    },
    { rootMargin: '-50% 0px -50% 0px' },
  );
  sections.forEach((section) => observer.observe(section));
}
