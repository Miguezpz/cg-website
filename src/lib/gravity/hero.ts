// Hero «revelado de gis»: coordina el velo de carga y el canvas WebGL2. El
// <img> nítido ya está pintado (LCP); el velo de magnesia se carga después y
// el shader se prepara en tiempo libre, en su propio chunk.
import { createLoader } from './loader';
import { idle } from './util';

function imageReady(img: HTMLImageElement): Promise<void> {
  if (img.complete && img.naturalWidth > 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    img.addEventListener('load', () => resolve(), { once: true });
    img.addEventListener('error', () => reject(new Error('hero image')), {
      once: true,
    });
  });
}

/** Descarga un recurso avisando de su avance real (bytes recibidos). */
async function fetchBlob(
  url: string,
  onProgress: (fraction: number) => void,
): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const total = Number(response.headers.get('content-length'));
  if (!response.body || !total) return response.blob();
  const reader = response.body.getReader();
  const chunks: BlobPart[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress(received / total);
  }
  return new Blob(chunks, {
    type: response.headers.get('content-type') ?? 'image/webp',
  });
}

export async function initHero(reduce: boolean): Promise<void> {
  const loader = createLoader(
    document.querySelector<HTMLElement>('[data-loader]'),
    reduce,
  );
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const canvas = hero?.querySelector<HTMLCanvasElement>('[data-hero-canvas]');
  const img = hero?.querySelector<HTMLImageElement>('[data-hero-figure] img');
  // Con movimiento reducido queda la foto nítida, sin shader.
  if (reduce || !hero || !canvas || !img) {
    await loader.finish();
    return;
  }

  try {
    await imageReady(img);
    loader.set(0.5);
    if (!('createImageBitmap' in window)) throw new Error('no bitmap');
    // El velo se pide cuando la foto (LCP) ya llegó, para no competir con ella.
    const small = canvas.dataset.chalkSrcSmall;
    const chalkUrl =
      (img.naturalWidth <= 480 && small) || canvas.dataset.chalkSrc || '';
    const textures = async (
      onProgress: (fraction: number) => void = () => {},
    ) => {
      const blob = await fetchBlob(chalkUrl, onProgress);
      return Promise.all([createImageBitmap(img), createImageBitmap(blob)]);
    };
    const [{ createChalkReveal }, bitmaps] = await Promise.all([
      import('./hero-gl'),
      textures((fraction) => loader.set(0.5 + fraction * 0.45)),
    ]);
    await new Promise<void>((resolve) => idle(resolve, 400));
    // Si el velo de carga ya se fue (tope de tiempo), no se cubre una foto que
    // ya se está viendo: el shader arranca revelado y solo responde al puntero.
    const reveal = createChalkReveal(hero, canvas, bitmaps, textures, {
      veiled: !loader.done,
    });
    void loader.finish();
    reveal?.start();
  } catch {
    // Sin WebGL2, sin red o con error: la foto fija sigue a la vista.
    void loader.finish();
  }
}
