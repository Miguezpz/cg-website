// La prueba de gravedad: secuencia de 400vh ligada al scroll.
//   a. El agarre: control de «mantener» (puntero, Espacio o Enter, 1.2 s).
//   b. Tensión: cinco barras que se llenan y la película de la plancha,
//      cuadro a cuadro sobre Canvas 2D, con su lectura de 0 % a 100 %.
//   c. La cima: ráfaga de ~350 partículas de gis y el cierre.
// Nunca es una puerta: el scroll y «Saltar secuencia» siempre avanzan.
import { clamp, createLoop, fitCanvas, onScrollFrame, type Loop } from './util';

const A_END = 0.2;
const TENSION_END = 0.38;
const FILM_END = 0.8;
const HOLD_MS = 1200;
const PARTICLES = 350;
/** Memoria máxima para cuadros decodificados (el resto queda comprimido). */
const DECODED_BYTES = 96e6;

type Phase = 'a' | 'tension' | 'film' | 'c';

interface Film {
  load(): void;
  show(progress: number): void;
}

function createFilm(root: HTMLElement, canvas: HTMLCanvasElement): Film {
  const total = Number(root.dataset.frames ?? 0);
  const pad = Number(root.dataset.pad ?? 3);
  const sizes = (root.dataset.sizes ?? '')
    .split(',')
    .map(Number)
    .filter(Boolean)
    .sort((a, b) => a - b);
  const ctx = canvas.getContext('2d');
  if (!ctx || !total || !sizes.length) return { load() {}, show() {} };

  // 640 o 1280 según el ancho real en píxeles (viewport × DPR, máx. 2).
  const saveData =
    (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection?.saveData === true;
  const need = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
  const size =
    (saveData ? undefined : sizes.find((s) => s >= need * 0.8)) ??
    (saveData ? sizes[0] : sizes[sizes.length - 1]);
  const url = (index: number) =>
    `/assets/gravity/planche/${size}/f-${String(index + 1).padStart(pad, '0')}.webp`;
  const cover = matchMedia('(min-width: 48rem)');

  const blobs = new Array<Blob | undefined>(total);
  const decoded = new Map<number, ImageBitmap>();
  const decoding = new Set<number>();
  let limit = 12;
  let want = 0;
  let shown = -1;
  let started = false;
  let inflight = 0;

  // De grueso a fino: primero 1 de cada 16 cuadros, luego 8, 4, 2 y todos.
  const queue: number[] = [];
  const queued = new Set<number>();
  for (const stride of [16, 8, 4, 2, 1]) {
    for (let i = 0; i < total; i += stride) {
      if (queued.has(i)) continue;
      queued.add(i);
      queue.push(i);
    }
  }

  const nearest = (index: number, has: (i: number) => boolean) => {
    for (let d = 0; d < total; d++) {
      if (index - d >= 0 && has(index - d)) return index - d;
      if (index + d < total && has(index + d)) return index + d;
    }
    return -1;
  };

  const paint = (index: number) => {
    const bitmap = decoded.get(index);
    const fit = fitCanvas(canvas, 1.5);
    if (!bitmap || !fit) return;
    if (index === shown && !fit.resized) return;
    const { width, height } = fit;
    const ratio = cover.matches
      ? Math.max(width / bitmap.width, height / bitmap.height)
      : Math.min(width / bitmap.width, height / bitmap.height);
    const w = bitmap.width * ratio;
    const h = bitmap.height * ratio;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(bitmap, (width - w) / 2, (height - h) / 2, w, h);
    shown = index;
    canvas.dataset.frame = String(index + 1);
  };

  const decode = (index: number) => {
    const blob = blobs[index];
    if (!blob || decoded.has(index) || decoding.has(index)) return;
    decoding.add(index);
    createImageBitmap(blob).then(
      (bitmap) => {
        decoding.delete(index);
        decoded.set(index, bitmap);
        limit = Math.max(
          8,
          Math.floor(DECODED_BYTES / (bitmap.width * bitmap.height * 4)),
        );
        // Se sueltan los cuadros más lejanos al que se está viendo.
        while (decoded.size > limit) {
          let far = -1;
          for (const key of decoded.keys()) {
            if (far < 0 || Math.abs(key - want) > Math.abs(far - want)) {
              far = key;
            }
          }
          if (far === shown) shown = -1;
          decoded.get(far)?.close();
          decoded.delete(far);
        }
        render();
      },
      () => decoding.delete(index),
    );
  };

  const render = () => {
    const target = nearest(want, (i) => blobs[i] !== undefined);
    if (target < 0) return;
    if (decoded.has(target)) paint(target);
    else {
      decode(target);
      // Mientras llega, el cuadro decodificado más cercano.
      const fallback = nearest(want, (i) => decoded.has(i));
      if (fallback >= 0) paint(fallback);
    }
    // Vecinos listos para el siguiente paso del scroll.
    for (const offset of [1, -1, 2, -2]) {
      const neighbor = target + offset;
      if (neighbor >= 0 && neighbor < total) decode(neighbor);
    }
  };

  const pump = () => {
    while (inflight < 4 && queue.length) {
      const index = queue.shift()!;
      inflight++;
      fetch(url(index))
        .then((response) =>
          response.ok ? response.blob() : Promise.reject(response.status),
        )
        .then((blob) => {
          blobs[index] = blob;
          if (Math.abs(index - want) <= Math.abs(shown - want) || shown < 0) {
            render();
          }
        })
        .catch(() => {})
        .finally(() => {
          inflight--;
          pump();
        });
    }
  };

  return {
    load() {
      if (started) return;
      started = true;
      pump();
    },
    show(progress) {
      want = Math.round(clamp(progress) * (total - 1));
      render();
    },
  };
}

interface Burst {
  fire(): void;
}

function createBurst(canvas: HTMLCanvasElement): Burst {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { fire() {} };
  const color = getComputedStyle(canvas).color;
  // x, y, vx, vy, tamaño, edad, vida
  const data = new Float32Array(PARTICLES * 7);
  let alive = 0;
  let loop: Loop | null = null;

  const frame = (_now: number, dt: number) => {
    const fit = fitCanvas(canvas, 1.5);
    if (!fit) return;
    const { width, height, scale } = fit;
    const seconds = dt / 1000;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = color;
    alive = 0;
    for (let i = 0; i < data.length; i += 7) {
      const age = (data[i + 5] += dt);
      const life = data[i + 6];
      if (age >= life) continue;
      alive++;
      // Gravedad y un poco de freno del aire.
      data[i + 3] += 900 * scale * seconds;
      data[i + 2] *= 1 - 1.2 * seconds;
      data[i] += data[i + 2] * seconds;
      data[i + 1] += data[i + 3] * seconds;
      ctx.globalAlpha = 0.9 * (1 - age / life);
      const size = data[i + 4];
      ctx.fillRect(Math.round(data[i]), Math.round(data[i + 1]), size, size);
    }
    if (!alive) {
      ctx.clearRect(0, 0, width, height);
      loop?.set(false);
    }
  };

  return {
    fire() {
      const fit = fitCanvas(canvas, 1.5);
      if (!fit) return;
      const { width, height, scale } = fit;
      for (let i = 0; i < data.length; i += 7) {
        // Abanico hacia arriba desde el centro alto del cuadro.
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.5;
        const speed = (80 + Math.random() * 520) * scale;
        data[i] = width * (0.5 + (Math.random() - 0.5) * 0.12);
        data[i + 1] = height * (0.4 + (Math.random() - 0.5) * 0.06);
        data[i + 2] = Math.cos(angle) * speed;
        data[i + 3] = Math.sin(angle) * speed;
        data[i + 4] = Math.round((1 + Math.random() * 2) * scale);
        data[i + 5] = 0;
        data[i + 6] = 900 + Math.random() * 1400;
      }
      loop ??= createLoop(canvas, frame);
      loop.set(true);
    },
  };
}

export function initFinale(): void {
  const root = document.querySelector<HTMLElement>('[data-finale]');
  const track = root?.querySelector<HTMLElement>('[data-finale-track]');
  const stage = root?.querySelector<HTMLElement>('[data-finale-stage]');
  if (!root || !track || !stage) return;

  const panels = [...stage.querySelectorAll<HTMLElement>('[data-panel]')];
  const panelB = panels.find((panel) => panel.dataset.panel === 'b');
  const bars = [...stage.querySelectorAll<HTMLElement>('[data-bar]')];
  const readout = stage.querySelector<HTMLElement>('[data-readout]');
  const filmCanvas =
    stage.querySelector<HTMLCanvasElement>('[data-film-canvas]');
  const burstCanvas = stage.querySelector<HTMLCanvasElement>(
    '[data-burst-canvas]',
  );
  const lines = [...stage.querySelectorAll<HTMLElement>('[data-grip-line]')];

  // Al activarse, la pista pasa a medir 400vh. Si ya se estaba viendo lo que
  // hay debajo (p. ej. se llegó con #contacto), el scroll se corrige para que
  // nada salte.
  const after = root.querySelector<HTMLElement>('[data-section="contacto"]');
  const below = track.getBoundingClientRect().bottom < window.innerHeight / 2;
  const before = after ? after.getBoundingClientRect().top : 0;
  root.setAttribute('data-enhanced', '');
  if (after && below) {
    window.scrollBy({
      top: after.getBoundingClientRect().top - before,
      behavior: 'instant',
    });
  }
  const film = filmCanvas ? createFilm(root, filmCanvas) : null;
  const burst = burstCanvas ? createBurst(burstCanvas) : null;

  const span = () => track.offsetHeight - stage.offsetHeight;
  const jump = (progress: number) => {
    const top = window.scrollY + track.getBoundingClientRect().top;
    window.scrollTo({ top: top + progress * span(), behavior: 'instant' });
  };

  // Los cuadros se piden cuando el final se acerca, nunca antes.
  const near = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      near.disconnect();
      film?.load();
    },
    { rootMargin: '120% 0px' },
  );
  near.observe(root);

  // a. El texto aparece, en dos tiempos, la primera vez que se ve el agarre.
  for (const line of lines) line.style.opacity = '0';
  const intro = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      intro.disconnect();
      lines.forEach((line, i) => {
        line.animate(
          [
            { opacity: 0, translate: '0 1.25rem' },
            { opacity: 1, translate: '0 0' },
          ],
          {
            duration: 700,
            delay: 150 + i * 450,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'backwards',
          },
        );
        line.style.opacity = '';
      });
    },
    { threshold: 0.5 },
  );
  intro.observe(stage);

  let phase: Phase | '' = '';
  let percent = -1;

  const setPhase = (next: Phase) => {
    const previous = phase;
    phase = next;
    const key = next === 'tension' || next === 'film' ? 'b' : next;
    for (const panel of panels) {
      panel.toggleAttribute('data-active', panel.dataset.panel === key);
    }
    if (key === 'b') panelB?.setAttribute('data-phase', next);
    if (next === 'c' && previous === 'film') burst?.fire();
  };

  onScrollFrame(root, () => {
    const total = span();
    if (total <= 0) return;
    const t = clamp(-track.getBoundingClientRect().top / total);
    const next: Phase =
      t < A_END
        ? 'a'
        : t < TENSION_END
          ? 'tension'
          : t < FILM_END
            ? 'film'
            : 'c';
    if (next !== phase) setPhase(next);

    const tension = clamp((t - A_END) / (TENSION_END - A_END));
    bars.forEach((bar, i) => {
      bar.style.transform = `scaleY(${clamp(tension * bars.length - i)})`;
    });

    const progress = clamp((t - TENSION_END) / (FILM_END - TENSION_END));
    const value = Math.round(progress * 100);
    if (readout && value !== percent) {
      percent = value;
      readout.textContent = `${value}%`;
    }
    if (next === 'film') film?.show(progress);
  });

  // Teclado: si el foco entra en un panel que no se ve, el scroll va a él.
  stage.addEventListener('focusin', (event) => {
    const panel = (event.target as Element).closest<HTMLElement>(
      '[data-panel]',
    );
    if (!panel || panel.hasAttribute('data-active')) return;
    const key = panel.dataset.panel;
    jump(key === 'a' ? 0.02 : key === 'b' ? TENSION_END + 0.01 : 0.92);
  });

  initHold(stage, () => jump(A_END + 0.004));
}

/** Control «Mantén para agarrar»: 1.2 s con puntero, Espacio o Enter. */
function initHold(stage: HTMLElement, onHeld: () => void): void {
  const wrap = stage.querySelector<HTMLElement>('[data-hold-wrap]');
  const button = stage.querySelector<HTMLButtonElement>('[data-hold]');
  const arc = stage.querySelector<SVGElement>('[data-hold-arc]');
  const status = stage.querySelector<HTMLElement>('[data-hold-status]');
  if (!wrap || !button || !arc) return;
  wrap.hidden = false;

  let filling: Animation | null = null;
  let done = false;

  const complete = () => {
    if (done) return;
    done = true;
    if (status) status.textContent = status.dataset.held ?? '';
    // El control se acerca a la cámara y la secuencia corta en seco a oscuro.
    const zoom = button.animate([{ scale: 1 }, { scale: 7 }], {
      duration: 380,
      easing: 'cubic-bezier(0.7, 0, 0.84, 0)',
      fill: 'forwards',
    });
    const finish = () => {
      button.blur();
      onHeld();
      zoom.cancel();
      filling?.cancel();
      filling = null;
      done = false;
    };
    zoom.finished.then(finish, finish);
  };

  const start = () => {
    if (filling || done) return;
    if (status) status.textContent = '';
    const animation = arc.animate(
      [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
      { duration: HOLD_MS, easing: 'linear', fill: 'forwards' },
    );
    filling = animation;
    animation.finished.then(
      () => {
        if (filling === animation) complete();
      },
      () => {},
    );
  };

  const cancel = () => {
    if (!filling || done) return;
    const reached = clamp(Number(filling.currentTime ?? 0) / HOLD_MS);
    filling.cancel();
    filling = null;
    arc.animate([{ strokeDashoffset: 1 - reached }, { strokeDashoffset: 1 }], {
      duration: 220,
      easing: 'ease-out',
    });
  };

  button.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    button.setPointerCapture(event.pointerId);
    start();
  });
  for (const type of ['pointerup', 'pointercancel', 'blur'] as const) {
    button.addEventListener(type, cancel);
  }
  button.addEventListener('keydown', (event) => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    if (!event.repeat) start();
  });
  button.addEventListener('keyup', (event) => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    // Al soltar Espacio el navegador dispara un click (detail 0) que
    // completaría el agarre aunque no se haya sostenido: se evita aquí.
    event.preventDefault();
    cancel();
  });
  button.addEventListener('contextmenu', (event) => event.preventDefault());
  // Tecnologías de apoyo que «activan» el botón sin mantenerlo.
  button.addEventListener('click', (event) => {
    if (event.detail === 0) complete();
  });
}
