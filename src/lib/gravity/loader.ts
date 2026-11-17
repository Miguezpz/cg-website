// Velo de carga: la silueta de la anilla se llena con el avance real de los
// assets del Hero. Nunca atrapa la página: tiene un tope de tiempo y, además,
// el CSS lo oculta solo (gravity.css) si este script no llega a correr.

export interface Loader {
  /** Avance de 0 a 1. */
  set(progress: number): void;
  /** Desvanece el velo y lo quita del DOM. */
  finish(): Promise<void>;
  /** `true` cuando el velo ya se fue (o nunca estuvo). */
  readonly done: boolean;
}

/** Tope desde que empezó la navegación: pasado este tiempo, el velo se va. */
const CAP_MS = 2600;

export function createLoader(el: HTMLElement | null, skip: boolean): Loader {
  if (!el || skip) {
    el?.remove();
    return { set() {}, finish: () => Promise.resolve(), done: true };
  }

  const fill = el.querySelector<SVGElement>('[data-loader-fill]');
  const line = el.querySelector<HTMLElement>('[data-loader-line]');
  const height = Number(fill?.dataset.height ?? 0);
  let done = false;
  let leaving: Promise<void> | undefined;

  const set = (progress: number) => {
    if (done) return;
    const p = Math.min(1, Math.max(0, progress));
    if (fill) fill.style.transform = `translateY(${height * (1 - p)}px)`;
    if (line) line.style.scale = `${p} 1`;
  };

  const finish = () => {
    if (leaving) return leaving;
    set(1);
    done = true;
    clearTimeout(cap);
    const remove = () => el.remove();
    leaving = el
      .animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 280,
        delay: 120,
        easing: 'ease-out',
        fill: 'forwards',
      })
      .finished.then(remove, remove);
    return leaving;
  };

  const cap = setTimeout(finish, Math.max(300, CAP_MS - performance.now()));

  return {
    set,
    finish,
    get done() {
      return done;
    },
  };
}
