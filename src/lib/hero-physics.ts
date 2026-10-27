// Firma del Hero (DESIGN.md · Movimiento), solo con puntero fino y sin
// movimiento reducido: el título «siente la gravedad»; las letras cerca del
// puntero se hunden y vuelven con un resorte.

interface Spring {
  x: number;
  v: number;
  target: number;
}

const spring = (): Spring => ({ x: 0, v: 0, target: 0 });

/** Avanza un resorte un cuadro; devuelve si sigue en movimiento. */
function step(s: Spring, stiffness: number, damping: number): boolean {
  s.v = (s.v + (s.target - s.x) * stiffness) * damping;
  s.x += s.v;
  return Math.abs(s.v) > 0.002 || Math.abs(s.target - s.x) > 0.002;
}

export function initHeroPhysics(): void {
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!finePointer || reduce) return;

  const title = document.getElementById('hero-title');
  if (title) gravityTitle(title);
}

function gravityTitle(title: HTMLElement): void {
  const text = title.textContent?.trim().replace(/\s+/g, ' ') ?? '';
  // La palabra en vino conserva su color al partirse en letras.
  const accent = title.querySelector<HTMLElement>('[data-accent]');
  const accentWord = accent?.textContent?.trim().toLowerCase();
  let letters: {
    el: HTMLElement;
    cx: number;
    cy: number;
    y: Spring;
    r: Spring;
  }[] = [];
  let raf = 0;

  // Se parte en letras la primera vez que el puntero entra (no al cargar).
  const split = () => {
    title.setAttribute('aria-label', text);
    const fragment = document.createDocumentFragment();
    text.split(/\s+/).forEach((word, i) => {
      if (i) fragment.append(' ');
      const wordEl = document.createElement('span');
      wordEl.className = 'inline-block whitespace-nowrap';
      if (accent && word.toLowerCase() === accentWord) {
        wordEl.className += ` ${accent.className}`;
      }
      wordEl.setAttribute('aria-hidden', 'true');
      for (const char of word) {
        const letter = document.createElement('span');
        letter.className = 'inline-block';
        letter.textContent = char;
        wordEl.append(letter);
      }
      fragment.append(wordEl);
    });
    title.replaceChildren(fragment);
  };

  const measure = () => {
    letters = [...title.querySelectorAll<HTMLElement>('span > span')].map(
      (el) => {
        const prev = letters.find((l) => l.el === el);
        const rect = el.getBoundingClientRect();
        return {
          el,
          cx: rect.left + rect.width / 2,
          cy: rect.top + rect.height / 2 - (prev?.y.x ?? 0),
          y: prev?.y ?? spring(),
          r: prev?.r ?? spring(),
        };
      },
    );
  };

  const tick = () => {
    let moving = false;
    for (const l of letters) {
      moving = step(l.y, 0.14, 0.76) || moving;
      moving = step(l.r, 0.14, 0.76) || moving;
      l.el.style.translate = `0 ${l.y.x.toFixed(2)}px`;
      l.el.style.rotate = `${l.r.x.toFixed(2)}deg`;
    }
    raf = moving ? requestAnimationFrame(tick) : 0;
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };

  title.addEventListener('pointerenter', () => {
    if (!title.hasAttribute('aria-label')) split();
    measure();
  });
  title.addEventListener('pointermove', (event) => {
    const size = parseFloat(getComputedStyle(title).fontSize);
    const radius = size * 2.2;
    for (const l of letters) {
      const dx = l.cx - event.clientX;
      const pull =
        Math.max(0, 1 - Math.hypot(dx, l.cy - event.clientY) / radius) ** 2;
      l.y.target = pull * size * 0.14;
      // Las letras se inclinan hacia el punto más bajo, como una cuerda.
      l.r.target = -Math.sign(dx) * pull * 4;
    }
    kick();
  });
  title.addEventListener('pointerleave', () => {
    for (const l of letters) l.y.target = l.r.target = 0;
    kick();
  });
}
