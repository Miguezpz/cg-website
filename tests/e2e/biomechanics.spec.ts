import { test, expect } from '@playwright/test';
import { athletes, type Point } from '../../src/lib/athlete-poses';
import {
  centerOfMass,
  skillMotions,
  type Joints,
  type SkillId,
} from '../../src/lib/skill-poses';

// Biomecánica de las figuras de gis (DESIGN.md · Ruta de skills y Atletas de
// gis): cada cuadro del movimiento respeta los límites del cuerpo y la técnica
// del ejercicio. Es matemática pura, sin navegador: corre en un solo proyecto.

test.beforeEach(({}, info) => {
  test.skip(info.project.name !== 'desktop-chromium', 'sin navegador');
});

/** Límites anatómicos y de técnica, en grados (ángulo interior). */
const LIMIT = {
  /** Flexión máxima del codo: el antebrazo choca con el bíceps. */
  elbow: 35,
  /** Flexión máxima de la rodilla: la pantorrilla choca con el muslo. */
  knee: 30,
  /** Brazos bloqueados (levers, plancha, parada de manos, soporte). */
  locked: 175,
  /** Línea del cuerpo recta en una posición completa. */
  straight: 172,
  /** Cambio máximo de un ángulo entre dos cuadros (1 % del movimiento). */
  step: 15,
  /** Distancia del centro de masa a la vertical del apoyo. */
  balance: 1.5,
  /** Variación tolerada de la longitud de un segmento. */
  length: 0.5,
};

const FRAMES = 100;
const sample = <T>(f: (s: number) => T) =>
  Array.from({ length: FRAMES + 1 }, (_, i) => f(i / FRAMES));

const angle = (a: Point, o: Point, b: Point) => {
  const [ux, uy, vx, vy] = [a.x - o.x, a.y - o.y, b.x - o.x, b.y - o.y];
  const cos = (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy));
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
};
const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

type Named = Record<string, Point>;

/** Las articulaciones de un skill con nombre plano (la pierna de atrás: far*). */
function named(j: Joints): Named {
  const far = j.far ?? j.near;
  return {
    shoulder: j.shoulder,
    elbow: j.elbow,
    hand: j.hand,
    hip: j.hip,
    head: j.head,
    knee: j.near.knee,
    ankle: j.near.ankle,
    toe: j.near.toe,
    farKnee: far.knee,
    farAnkle: far.ankle,
    farToe: far.toe,
  };
}

const ANGLES: [string, [string, string, string], number][] = [
  ['codo', ['shoulder', 'elbow', 'hand'], LIMIT.elbow],
  ['rodilla', ['hip', 'knee', 'ankle'], LIMIT.knee],
  ['rodilla de atrás', ['hip', 'farKnee', 'farAnkle'], LIMIT.knee],
  ['rodilla libre', ['hip', 'freeKnee', 'freeAnkle'], LIMIT.knee],
];
const SEGMENTS: [string, string][] = [
  ['shoulder', 'elbow'],
  ['elbow', 'hand'],
  ['shoulder', 'hip'],
  ['hip', 'knee'],
  ['knee', 'ankle'],
  ['hip', 'farKnee'],
  ['farKnee', 'farAnkle'],
  ['hip', 'freeKnee'],
  ['freeKnee', 'freeAnkle'],
];
const has = (j: Named, keys: string[]) => keys.every((k) => k in j);

/** Límites comunes a cualquier figura. */
function common(frames: Named[], profile: boolean) {
  for (const [name, keys, min] of ANGLES) {
    if (!has(frames[0], keys)) continue;
    const values = frames.map((j) => angle(j[keys[0]], j[keys[1]], j[keys[2]]));
    expect(Math.min(...values), `${name} mínimo`).toBeGreaterThanOrEqual(min);
    const jump = Math.max(
      ...values.slice(1).map((v, i) => Math.abs(v - values[i])),
    );
    expect(jump, `${name}: salto entre cuadros`).toBeLessThanOrEqual(
      LIMIT.step,
    );
  }
  // De perfil, los huesos no se estiran ni se encogen (de frente hay escorzo).
  if (!profile) return;
  for (const [a, b] of SEGMENTS) {
    if (!has(frames[0], [a, b])) continue;
    const lengths = frames.map((j) => dist(j[a], j[b]));
    expect(
      Math.max(...lengths) - Math.min(...lengths),
      `${a} → ${b} cambia de largo`,
    ).toBeLessThanOrEqual(LIMIT.length);
  }
}

const at = (j: Named, keys: [string, string, string]) =>
  angle(j[keys[0]], j[keys[1]], j[keys[2]]);
const ELBOW: [string, string, string] = ['shoulder', 'elbow', 'hand'];
const HIP: [string, string, string] = ['shoulder', 'hip', 'knee'];
const KNEE: [string, string, string] = ['hip', 'knee', 'ankle'];

const HOLDS: SkillId[] = ['handstand', 'frontlever', 'backlever', 'planche'];

test.describe('Ruta de skills', () => {
  for (const [id, motion] of Object.entries(skillMotions) as [
    SkillId,
    (typeof skillMotions)[SkillId],
  ][]) {
    test(`${id}: límites del cuerpo en todo el movimiento`, () => {
      const frames = sample((p) => named(motion.joints(p)));
      common(frames, true);
      const onBar = !motion.floor;
      for (const j of frames) {
        if (onBar) expect(dist(j.hand, { x: 0, y: 0 })).toBeLessThan(0.01);
        // En el piso (y = 0) nada lo atraviesa.
        else
          for (const p of Object.values(j))
            expect(p.y).toBeLessThanOrEqual(0.5);
      }
    });
  }

  for (const id of HOLDS) {
    test(`${id}: la posición final es la del ejercicio`, () => {
      const final = skillMotions[id].joints(1);
      const j = named(final);
      expect(at(j, ELBOW), 'brazos bloqueados').toBeGreaterThanOrEqual(
        LIMIT.locked,
      );
      expect(at(j, HIP), 'cadera recta').toBeGreaterThanOrEqual(LIMIT.straight);
      expect(at(j, KNEE), 'rodillas rectas').toBeGreaterThanOrEqual(
        LIMIT.straight,
      );
      expect(
        Math.abs(centerOfMass(final).x - final.hand.x),
        'centro de masa sobre el apoyo',
      ).toBeLessThanOrEqual(LIMIT.balance);
    });
  }

  test('muscle-up: de colgado muerto al soporte bloqueado', () => {
    const start = named(skillMotions.muscleup.joints(0));
    const top = named(skillMotions.muscleup.joints(1));
    expect(at(start, ELBOW), 'colgado muerto').toBeGreaterThanOrEqual(172);
    expect(at(top, ELBOW), 'bloqueo arriba').toBeGreaterThanOrEqual(
      LIMIT.locked,
    );
    expect(at(top, HIP), 'cuerpo casi recto arriba').toBeGreaterThanOrEqual(
      165,
    );
  });

  test('pistol squat: el pie de apoyo no se mueve', () => {
    for (const j of sample((p) => named(skillMotions.pistol.joints(p))))
      expect(dist(j.farAnkle, { x: 0, y: 0 })).toBeLessThan(0.01);
  });
});

test.describe('Atletas de scroll', () => {
  const profile = { pullup: false, jump: false, pistol: true, dips: true };
  for (const [id, rig] of Object.entries(athletes)) {
    test(`${id}: límites del cuerpo en todo el movimiento`, () => {
      common(
        sample((s) => rig.joints(s)),
        profile[id as keyof typeof profile] ?? true,
      );
    });
  }

  test('dominadas: la barbilla pasa la barra', () => {
    expect(athletes.pullup.joints(1).chin.y).toBeLessThan(-1);
  });

  test('muscle-up en anillas: de colgado muerto al soporte bloqueado', () => {
    expect(at(athletes.muscleup.joints(0), ELBOW)).toBeGreaterThanOrEqual(172);
    expect(at(athletes.muscleup.joints(1), ELBOW)).toBeGreaterThanOrEqual(
      LIMIT.locked,
    );
  });

  test('fondos: brazos bloqueados arriba y hombros bajo los codos abajo', () => {
    expect(at(athletes.dips.joints(0), ELBOW)).toBeGreaterThanOrEqual(172);
    const bottom = athletes.dips.joints(1);
    expect(bottom.shoulder.y).toBeGreaterThan(bottom.elbow.y);
  });

  test('pistol squat: el pie de apoyo no se mueve', () => {
    for (const j of sample((s) => athletes.pistol.joints(s)))
      expect(dist(j.ankle, { x: 0, y: 0 })).toBeLessThan(0.01);
  });
});
