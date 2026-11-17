// Visor 3D de la anilla (Three.js, cargado bajo demanda desde tools.ts).
// Gira despacio sola, se arrastra con el puntero y se gira con las flechas;
// la rueda no hace zoom. Luz neutra de estudio. Si `gravity-film.json` aún
// no trae el GLB, se dibuja una anilla procedural: toro en tono abedul y
// correa negra plana.
import {
  AmbientLight,
  Box3,
  BoxGeometry,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  RepeatWrapping,
  Scene,
  Texture,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
  type Object3D,
} from 'three';
import type { GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clamp, createLoop, cssVar } from './util';

const AUTO_SPEED = 0.00022; // rad/ms: una vuelta cada ~28 s
const KEY_STEP = 0.2;
const TILT_MAX = 0.6;
const FIT_SIZE = 2.6;

function proceduralRing(canvas: HTMLCanvasElement): Object3D {
  const wood = new MeshStandardMaterial({
    color: cssVar(canvas, '--wood'),
    roughness: 0.78,
    metalness: 0,
  });
  const strap = new MeshStandardMaterial({
    color: cssVar(canvas, '--strap'),
    roughness: 1,
    metalness: 0,
    flatShading: true,
  });
  const group = new Group();
  group.add(new Mesh(new TorusGeometry(1, 0.13, 24, 96), wood));
  // Correa: dos cintas planas que abrazan la anilla y suben juntas.
  for (const z of [-0.15, 0.15]) {
    const band = new Mesh(new BoxGeometry(0.34, 1.75, 0.02), strap);
    band.position.set(0, 1.72, z);
    group.add(band);
  }
  const loop = new Mesh(new BoxGeometry(0.34, 0.02, 0.32), strap);
  loop.position.set(0, 0.85, 0);
  group.add(loop);
  return group;
}

/**
 * Carga el GLB sin pasar por URLs `blob:` (la CSP de vercel.json no las
 * permite): las texturas incrustadas se decodifican con createImageBitmap
 * directamente desde el búfer.
 */
async function loadGlb(url: string): Promise<Object3D> {
  const { GLTFLoader } =
    await import('three/examples/jsm/loaders/GLTFLoader.js');
  const loader = new GLTFLoader();
  // Ocupa el lugar del plugin de WebP: atiende toda textura incrustada.
  loader.register((parser: GLTFParser) => ({
    name: 'EXT_texture_webp',
    loadTexture(index: number): Promise<Texture> | null {
      const def = parser.json.textures[index];
      const source = def.extensions?.EXT_texture_webp?.source ?? def.source;
      const image = parser.json.images?.[source];
      if (image?.bufferView === undefined) return null;
      return parser
        .getDependency('bufferView', image.bufferView)
        .then((view: ArrayBuffer) =>
          createImageBitmap(new Blob([view], { type: image.mimeType })),
        )
        .then((bitmap: ImageBitmap) => {
          const texture = new Texture(bitmap);
          texture.flipY = false;
          texture.wrapS = texture.wrapT = RepeatWrapping;
          texture.needsUpdate = true;
          return texture;
        });
    },
  }));
  const gltf = await loader.loadAsync(url);
  return gltf.scene;
}

export async function mountRing(
  root: HTMLElement,
  reduce: boolean,
): Promise<void> {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-ring-canvas]');
  if (!canvas) return;

  let model: Object3D;
  try {
    model = root.dataset.glb
      ? await loadGlb(root.dataset.glb)
      : proceduralRing(canvas);
  } catch {
    model = proceduralRing(canvas);
  }

  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  // Centra el modelo y lo lleva a un tamaño conocido.
  const box = new Box3().setFromObject(model);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  model.position.sub(center);
  const pivot = new Group();
  pivot.add(model);
  pivot.scale.setScalar(FIT_SIZE / Math.max(size.x, size.y, size.z, 0.001));

  const scene = new Scene();
  scene.add(pivot);
  // Luz neutra: una direccional de estudio y un relleno ambiental.
  const key = new DirectionalLight(undefined, 2.4);
  key.position.set(2.5, 3.5, 4);
  scene.add(key, new AmbientLight(undefined, 1.1));

  const camera = new PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0, 6.4);

  let yaw = -0.55;
  let tilt = 0.12;
  let holdUntil = 0;
  let dragging = false;
  let queued = false;

  const render = () => {
    queued = false;
    pivot.rotation.set(tilt, yaw, 0);
    renderer.render(scene, camera);
  };
  const invalidate = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(render);
  };

  const resize = () => {
    const width = root.clientWidth;
    const height = root.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  };
  new ResizeObserver(resize).observe(root);

  canvas.hidden = false;
  resize();
  root.setAttribute('data-ready', '');
  const hint = document.querySelector<HTMLElement>('[data-ring-hint]');
  if (hint) hint.hidden = false;

  // Giro automático lento; se detiene mientras se interactúa y un momento
  // después. Con movimiento reducido no hay giro propio.
  if (!reduce) {
    createLoop(canvas, (now, dt) => {
      if (!dragging && now > holdUntil) yaw += dt * AUTO_SPEED;
      render();
    });
  }

  const touch = () => {
    holdUntil = performance.now() + 2500;
    invalidate();
  };

  let lastX = 0;
  let lastY = 0;
  canvas.addEventListener('pointerdown', (event) => {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    yaw += (event.clientX - lastX) * 0.01;
    tilt = clamp(tilt + (event.clientY - lastY) * 0.006, -TILT_MAX, TILT_MAX);
    lastX = event.clientX;
    lastY = event.clientY;
    touch();
  });
  const release = () => {
    dragging = false;
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  canvas.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') yaw -= KEY_STEP;
    else if (event.key === 'ArrowRight') yaw += KEY_STEP;
    else if (event.key === 'ArrowUp') {
      tilt = clamp(tilt - KEY_STEP / 2, -TILT_MAX, TILT_MAX);
    } else if (event.key === 'ArrowDown') {
      tilt = clamp(tilt + KEY_STEP / 2, -TILT_MAX, TILT_MAX);
    } else return;
    // Las flechas giran la anilla en vez de mover la página.
    event.preventDefault();
    canvas.dataset.yaw = yaw.toFixed(2);
    touch();
  });
}
