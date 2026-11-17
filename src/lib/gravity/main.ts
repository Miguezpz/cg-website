// Arranque de la landing /gravedad. Lo que afecta a la primera pantalla
// (header, velo de carga y Hero) corre de inmediato; el resto, en tiempo
// libre. Con movimiento reducido no hay pila sticky, secuencia ligada al
// scroll ni bucles: quedan los cuadros fijos del HTML.
import { initFooterWave } from './footer-wave';
import { initForm } from './form';
import { initGridDissolve } from './grid-dissolve';
import { initHeader } from './header';
import { initHero } from './hero';
import { initMethod } from './method';
import { initProgression } from './progression';
import { initSession } from './session';
import { initStack } from './stack';
import { initTools } from './tools';
import { idle, reducedMotion } from './util';

export function initGravity(): void {
  const reduce = reducedMotion();
  initHeader();
  initForm();
  void initHero(reduce);

  idle(() => {
    if (!reduce) {
      initStack();
      initSession();
      initProgression();
    }
    initGridDissolve(reduce);
    initMethod(reduce);
    initTools(reduce);
    initFooterWave(reduce);
    if (reduce) return;
    // La secuencia final va en su propio chunk: se pide al acercarse.
    const finale = document.querySelector('[data-finale]');
    if (!finale) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        import('./finale')
          .then(({ initFinale }) => initFinale())
          .catch(() => {});
      },
      { rootMargin: '300% 0px' },
    );
    observer.observe(finale);
  });
}
