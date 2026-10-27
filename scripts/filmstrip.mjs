// Tira de cuadros de cada figura de gis (DESIGN.md · Ruta de skills y Atletas
// de gis): 9 momentos del movimiento lado a lado, en PNG, para revisar la
// técnica a ojo y compartirla con el coach.
//
//   node scripts/filmstrip.mjs [carpeta]   (por defecto: test-results/filmstrips)
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createJiti } from 'jiti';
import { chromium } from '@playwright/test';

const out = resolve(process.argv[2] ?? 'test-results/filmstrips');
const jiti = createJiti(import.meta.url);
const { skillMotions } = await jiti.import('../src/lib/skill-poses.ts');
const { athletes } = await jiti.import('../src/lib/athlete-poses.ts');

const FRAMES = 9;
const [CHALK, STEEL, BG] = ['#e9e6df', '#3a3d42', '#111214'];

/** @param {any} shape @param {string} color */
function svgShape(shape, color) {
  if (shape.kind === 'line') {
    const stroke = shape.gap ? BG : color;
    const dash = shape.dash ? ` stroke-dasharray="${shape.dash}"` : '';
    return `<line x1="${shape.x1}" y1="${shape.y1}" x2="${shape.x2}" y2="${shape.y2}" stroke="${stroke}" stroke-width="${shape.w}" stroke-linecap="round"${dash}/>`;
  }
  if (shape.kind === 'circle') {
    return shape.ring
      ? `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}" fill="none" stroke="${color}" stroke-width="${shape.ring}"/>`
      : `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}" fill="${color}"/>`;
  }
  return `<path d="${shape.d}" fill="${color}" stroke="${color}" stroke-width="4" stroke-linejoin="round"/>`;
}

/** Un cuadro: el equipo en acero y el cuerpo en gis. */
function frame(viewBox, fixed, gear, body, label) {
  const shapes = [
    ...fixed.map((s) => svgShape(s, STEEL)),
    ...gear.map((s) => svgShape(s, STEEL)),
    ...body.map((s) => svgShape(s, CHALK)),
  ].join('');
  return `<figure><svg viewBox="${viewBox}">${shapes}</svg><figcaption>${label}</figcaption></figure>`;
}

const figures = [
  ...Object.entries(skillMotions).map(([id, m]) => ({
    id: `skill-${id}`,
    viewBox: m.viewBox,
    frames: Array.from({ length: FRAMES }, (_, i) => {
      const p = i / (FRAMES - 1);
      return {
        label: `p ${p.toFixed(2)}`,
        fixed: m.fixed,
        gear: [],
        body: m.pose(p),
      };
    }),
  })),
  ...Object.entries(athletes).map(([id, rig]) => ({
    id: `atleta-${id}`,
    viewBox: rig.viewBox,
    frames: Array.from({ length: FRAMES }, (_, i) => {
      const s = i / (FRAMES - 1);
      return {
        label: `s ${s.toFixed(2)}`,
        fixed: rig.fixed,
        gear: rig.gear?.(s) ?? [],
        body: rig.pose(s),
      };
    }),
  })),
];

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1800, height: 400 } });
for (const figure of figures) {
  const cells = figure.frames
    .map((f) => frame(figure.viewBox, f.fixed, f.gear, f.body, f.label))
    .join('');
  await page.setContent(`<!doctype html><style>
    body { margin: 0; padding: 16px; background: ${BG}; color: #9a9da3; font: 14px system-ui; }
    h1 { margin: 0 0 12px; font-size: 16px; color: ${CHALK}; }
    main { display: grid; grid-template-columns: repeat(${FRAMES}, 1fr); gap: 8px; }
    figure { margin: 0; border: 1px solid #26292d; padding: 8px; }
    svg { display: block; width: 100%; height: 300px; }
    figcaption { margin-top: 6px; text-align: center; }
  </style><h1>${figure.id}</h1><main>${cells}</main>`);
  await page.screenshot({ path: `${out}/${figure.id}.png`, fullPage: true });
}
await browser.close();
console.log(`${figures.length} tiras en ${out}`);
