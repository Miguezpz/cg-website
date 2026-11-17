// Shader del Hero (WebGL2 nativo): mezcla el retrato nítido con el mismo
// encuadre cubierto de magnesia. El gis se disipa de arriba hacia abajo y el
// puntero lo vuelve a «cepillar»; el borde es un canto duro de 1.5 px, sin
// resplandor. Solo dibuja cuando algo cambia y se pausa fuera de pantalla.
import { cssVar, rgb } from './util';

const VERTEX = `#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = vec2(aPosition.x * 0.5 + 0.5, 0.5 - aPosition.y * 0.5);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

// Ruido simplex 2D de Ian McEwan (Ashima Arts), licencia MIT.
const FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uClear;
uniform sampler2D uChalk;
uniform sampler2D uTrail;
uniform vec2 uCover;
uniform float uFront;
uniform float uEdge;
uniform vec3 uGlow;
uniform vec3 uWhite;
out vec4 outColor;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = (vUv - 0.5) * uCover + 0.5;
  float noise = 0.5 + 0.5 * (0.7 * snoise(vUv * vec2(3.0, 4.0)) +
                             0.3 * snoise(vUv * vec2(9.0, 12.0) + 7.3));
  float threshold = mix(vUv.y, noise, 0.45);
  float trail = texture(uTrail, vUv).a;
  // > 0: hay gis. Primero el frente que baja; después, lo que deja el puntero.
  float mask = max(threshold - uFront, trail - mix(0.3, 0.8, noise));
  float dist = mask / max(fwidth(mask), 1e-5);
  float chalk = clamp(dist + 0.5, 0.0, 1.0);
  float edge = clamp(uEdge + 0.5 - abs(dist), 0.0, 1.0);
  vec3 color = mix(texture(uClear, uv).rgb, texture(uChalk, uv).rgb, chalk);
  vec3 line = mix(uGlow, uWhite, step(0.62, 0.5 + 0.5 * snoise(vUv * 18.0 + 3.1)));
  outColor = vec4(mix(color, line, edge), 1.0);
}`;

const TRAIL_W = 96;
const TRAIL_H = 128;
const REVEAL_DELAY = 600;
const REVEAL_MS = 2500;
const FRONT_VEILED = -0.05;
const FRONT_CLEAR = 1.05;
const SWEEP_EVERY = 6000;
const SWEEP_MS = 1100;

type Bitmaps = [ImageBitmap, ImageBitmap];

export interface ChalkReveal {
  /** Arranca el revelado inicial (o deja el retrato limpio si no hay velo). */
  start(): void;
}

function compile(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

export function createChalkReveal(
  hero: HTMLElement,
  canvas: HTMLCanvasElement,
  initial: Bitmaps,
  reload: () => Promise<Bitmaps>,
  { veiled }: { veiled: boolean },
): ChalkReveal | null {
  const gl = canvas.getContext('webgl2', {
    antialias: false,
    powerPreference: 'low-power',
  });
  if (!gl) return null;

  const figure = canvas.closest<HTMLElement>('[data-hero-figure]') ?? canvas;
  const parallax = canvas.closest<HTMLElement>('[data-hero-parallax]');
  const trail = document.createElement('canvas');
  trail.width = TRAIL_W;
  trail.height = TRAIL_H;
  const trailCtx = trail.getContext('2d')!;
  trailCtx.lineCap = 'round';
  trailCtx.lineJoin = 'round';
  trailCtx.strokeStyle = cssVar(canvas, '--chalk') || 'white';

  const glow = rgb(cssVar(canvas, '--glow'));
  const white = rgb(cssVar(canvas, '--chalk'));

  let uniforms: Record<string, WebGLUniformLocation | null> = {};
  let trailTexture: WebGLTexture | null = null;
  let imageAspect = 0.75;
  let ready = false;

  const texture = (unit: number, source: TexImageSource): WebGLTexture => {
    const tex = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    return tex;
  };

  const setup = ([clear, chalk]: Bitmaps): boolean => {
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    uniforms = Object.fromEntries(
      [
        'uClear',
        'uChalk',
        'uTrail',
        'uCover',
        'uFront',
        'uEdge',
        'uGlow',
        'uWhite',
      ].map((name) => [name, gl.getUniformLocation(program, name)]),
    );
    imageAspect = clear.width / clear.height;
    texture(0, clear);
    texture(1, chalk);
    trailTexture = texture(2, trail);
    // Las texturas ya están en la GPU: se libera la copia decodificada.
    clear.close();
    chalk.close();
    gl.uniform1i(uniforms.uClear, 0);
    gl.uniform1i(uniforms.uChalk, 1);
    gl.uniform1i(uniforms.uTrail, 2);
    gl.uniform3fv(uniforms.uGlow, glow);
    gl.uniform3fv(uniforms.uWhite, white);
    return true;
  };

  // Estado de la animación.
  let front = veiled ? FRONT_VEILED : FRONT_CLEAR;
  let revealAt = 0;
  let revealed = !veiled;
  let trailUntil = 0;
  let trailDirty = false;
  let last: { x: number; y: number } | null = null;
  let sweepAt = 0;
  let visible = true;
  let lost = false;
  let raf = 0;
  let previous = 0;
  let sized = false;

  const resize = () => {
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(canvas.clientWidth * scale);
    const height = Math.round(canvas.clientHeight * scale);
    if (!width || !height) return;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
    // Mismo encuadre que `object-fit: cover` del <img> que está debajo.
    const aspect = width / height;
    gl.uniform2f(
      uniforms.uCover,
      Math.min(1, aspect / imageAspect),
      Math.min(1, imageAspect / aspect),
    );
    gl.uniform1f(uniforms.uEdge, 0.75 * scale);
    sized = true;
  };

  const stroke = (x: number, y: number) => {
    const from = last ?? { x, y };
    for (const [width, alpha] of [
      [22, 0.35],
      [12, 0.9],
    ]) {
      trailCtx.globalAlpha = alpha;
      trailCtx.lineWidth = width;
      trailCtx.beginPath();
      trailCtx.moveTo(from.x, from.y);
      trailCtx.lineTo(x, y);
      trailCtx.stroke();
    }
    last = { x, y };
    trailDirty = true;
  };

  const active = (now: number) =>
    !revealed || now < trailUntil || (sweepAt > 0 && now < sweepAt + SWEEP_MS);

  const frame = (now: number) => {
    raf = 0;
    if (!ready || lost) return;
    if (!sized) resize();
    const dt = Math.min(now - previous, 64);
    previous = now;

    if (!revealed) {
      const t = Math.min(1, Math.max(0, (now - revealAt) / REVEAL_MS));
      // Entrada y salida suaves: el frente no arranca ni frena de golpe.
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      front = FRONT_VEILED + (FRONT_CLEAR - FRONT_VEILED) * eased;
      if (t >= 1) revealed = true;
    }

    // Barrido automático en pantallas táctiles: una pasada en diagonal.
    if (sweepAt > 0 && now >= sweepAt) {
      const u = (now - sweepAt) / SWEEP_MS;
      if (u <= 1) {
        stroke(
          TRAIL_W * (0.12 + 0.76 * u),
          TRAIL_H * (0.72 - 0.34 * Math.sin(u * Math.PI)),
        );
        trailUntil = now + 900;
      } else {
        sweepAt = 0;
        last = null;
      }
    }

    // El rastro se desvanece en ~0.6 s.
    if (now < trailUntil) {
      trailCtx.globalCompositeOperation = 'destination-out';
      trailCtx.globalAlpha = 1 - Math.exp(-dt / 200);
      trailCtx.fillRect(0, 0, TRAIL_W, TRAIL_H);
      trailCtx.globalCompositeOperation = 'source-over';
      trailDirty = true;
    } else if (trailUntil) {
      trailCtx.clearRect(0, 0, TRAIL_W, TRAIL_H);
      trailUntil = 0;
      trailDirty = true;
      last = null;
    }
    if (trailDirty) {
      trailDirty = false;
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, trailTexture);
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        trail,
      );
    }

    gl.uniform1f(uniforms.uFront, front);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (active(now) || trailUntil) schedule();
  };

  const schedule = () => {
    if (raf || !ready || lost || !visible || document.hidden) return;
    raf = requestAnimationFrame((now) => {
      if (!previous) previous = now;
      frame(now);
    });
  };

  ready = setup(initial);
  if (!ready) return null;
  resize();
  gl.uniform1f(uniforms.uFront, front);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  canvas.setAttribute('data-ready', '');

  new ResizeObserver(() => {
    if (lost || !ready) return;
    resize();
    schedule();
  }).observe(canvas);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  }).observe(canvas);
  document.addEventListener('visibilitychange', schedule);

  // Pérdida de contexto: queda la foto fija; al volver, se recargan texturas.
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    lost = true;
    canvas.removeAttribute('data-ready');
  });
  canvas.addEventListener('webglcontextrestored', () => {
    reload().then(
      (bitmaps) => {
        lost = false;
        front = FRONT_CLEAR;
        revealed = true;
        ready = setup(bitmaps);
        if (!ready) return;
        sized = false;
        canvas.setAttribute('data-ready', '');
        schedule();
      },
      () => {},
    );
  });

  // Puntero fino: cepilla gis sobre el retrato y lo mueve hasta 10 px.
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    figure.addEventListener('pointermove', (event) => {
      if (!revealed) return;
      const rect = canvas.getBoundingClientRect();
      stroke(
        ((event.clientX - rect.left) / rect.width) * TRAIL_W,
        ((event.clientY - rect.top) / rect.height) * TRAIL_H,
      );
      trailUntil = performance.now() + 900;
      schedule();
    });
    figure.addEventListener('pointerleave', () => {
      last = null;
    });
    if (parallax) {
      let pending = false;
      let px = 0;
      let py = 0;
      hero.addEventListener('pointermove', (event) => {
        const rect = hero.getBoundingClientRect();
        px = ((event.clientX - rect.left) / rect.width - 0.5) * -20;
        py = ((event.clientY - rect.top) / rect.height - 0.5) * -20;
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => {
          pending = false;
          parallax.style.translate = `${px.toFixed(1)}px ${py.toFixed(1)}px`;
        });
      });
      hero.addEventListener('pointerleave', () => {
        parallax.style.translate = '';
      });
    }
  } else {
    // Táctil: un barrido suave cada 6 s, solo si el Hero se ve.
    setInterval(() => {
      if (!revealed || !visible || document.hidden || lost) return;
      last = null;
      sweepAt = performance.now();
      schedule();
    }, SWEEP_EVERY);
  }

  return {
    start() {
      revealAt = performance.now() + REVEAL_DELAY;
      schedule();
    },
  };
}
