// Etapas de cada skill dibujadas en gis (DESIGN.md · Ruta de skills): poses
// fijas de perfil, con las proporciones y los trazos de los atletas de gis.
// Él mira a la derecha. En las posiciones horizontales que se sostienen con
// los brazos rectos (levers y plancha), el ángulo del brazo no se elige a ojo:
// se calcula para que el centro de masa quede justo bajo la barra o sobre las
// manos, como en el equilibrio real. Por eso en el tuck los brazos van casi
// verticales y en la posición completa se inclinan mucho más.

import {
  add,
  arm,
  body,
  circle,
  deg,
  elbowAround,
  line,
  MASS,
  type Point,
  type Shape,
} from './athlete-poses';

export type SkillId =
  'handstand' | 'muscleup' | 'frontlever' | 'planche' | 'backlever' | 'pistol';

export type Stage = { fixed: Shape[]; body: Shape[] };

/** Las etapas de un skill comparten `viewBox`: la barra y el piso se alinean. */
export type SkillLadder = { viewBox: string; stages: Stage[] };

type Leg = { knee: Point; ankle: Point; toe: Point };
type Joints = {
  shoulder: Point;
  hip: Point;
  head: Point;
  elbow: Point;
  hand: Point;
  /** La pierna de este lado; la otra va detrás o, si no está, encimada. */
  near: Leg;
  far?: Leg;
};

const ARM = body.upperArm + body.forearm;
/** Del hombro al centro de la cabeza. */
const HEAD = body.neck + body.head - 1;

const rad = (degrees: number) => deg(degrees);
const mid = (a: Point, b: Point) => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

/** Pierna desde la cadera: ángulos del muslo y de la espinilla (y del pie). */
function leg(hip: Point, thigh: number, shin: number, foot = shin): Leg {
  const knee = add(hip, body.thigh, rad(thigh));
  const ankle = add(knee, body.shin, rad(shin));
  return { knee, ankle, toe: add(ankle, 6, rad(foot)) };
}

function move(j: Joints, d: Point): Joints {
  const m = (p: Point) => ({ x: p.x + d.x, y: p.y + d.y });
  const l = (g: Leg) => ({ knee: m(g.knee), ankle: m(g.ankle), toe: m(g.toe) });
  return {
    shoulder: m(j.shoulder),
    hip: m(j.hip),
    head: m(j.head),
    elbow: m(j.elbow),
    hand: m(j.hand),
    near: l(j.near),
    ...(j.far && { far: l(j.far) }),
  };
}

/** Centro de masa por segmentos (Dempster). Sin `far`, las piernas van juntas. */
function centerOfMass(j: Joints): Point {
  const legs = j.far ? [j.near, j.far] : [j.near];
  const share = 1 / legs.length;
  const parts: [Point, number][] = [
    [j.head, MASS.head],
    [mid(j.shoulder, j.hip), MASS.trunk],
    [mid(j.shoulder, j.elbow), MASS.upperArm],
    [mid(j.elbow, j.hand), MASS.forearm],
    ...legs.flatMap((g): [Point, number][] => [
      [mid(j.hip, g.knee), MASS.thigh * share],
      [mid(g.knee, g.ankle), MASS.shin * share],
    ]),
  ];
  const total = parts.reduce((sum, [, m]) => sum + m, 0);
  return parts.reduce(
    (acc, [p, m]) => ({
      x: acc.x + (p.x * m) / total,
      y: acc.y + (p.y * m) / total,
    }),
    { x: 0, y: 0 },
  );
}

/**
 * Sostén horizontal con los brazos rectos (levers y plancha), con la cabeza a
 * la izquierda y los pies a la derecha. `legs` son los ángulos de cada pierna
 * respecto a un tronco horizontal; `tilt` sube la cadera (tuck de plancha).
 * Busca el ángulo del brazo que deja el centro de masa en la vertical de las
 * manos y devuelve la pose con las manos en (0, 0).
 */
function hold(
  grip: 'hang' | 'support',
  legs: [number, number][],
  tilt = 0,
): Joints {
  const torso = 90 + tilt;
  const build = (a: number): Joints => {
    const shoulder = { x: 0, y: 0 };
    const hip = add(shoulder, body.torso, rad(torso));
    // Colgado: el brazo sube hacia los pies. Apoyado: baja hacia los pies.
    const dir = rad(grip === 'hang' ? 180 - a : a);
    const [near, far] = legs.map(([thigh, shin]) =>
      leg(hip, thigh + tilt, shin + tilt),
    );
    return {
      shoulder,
      hip,
      head: add(shoulder, HEAD, rad(torso + 180)),
      elbow: add(shoulder, body.upperArm, dir),
      hand: add(shoulder, ARM, dir),
      near,
      ...(far && { far }),
    };
  };
  const off = (a: number) => {
    const j = build(a);
    return centerOfMass(j).x - j.hand.x;
  };
  let [lo, hi] = [0, 85];
  for (let i = 0; i < 30; i++) {
    const a = (lo + hi) / 2;
    if (Math.sign(off(a)) === Math.sign(off(lo))) lo = a;
    else hi = a;
  }
  const j = build((lo + hi) / 2);
  return move(j, { x: -j.hand.x, y: -j.hand.y });
}

// Piernas respecto a un tronco horizontal. «Arriba» = del lado del pecho en el
// front lever; en el back lever y la plancha el pecho va abajo (espejo).
const FULL: [number, number] = [90, 90];
const TUCK_UP: [number, number] = [230, 68];
const ADV_UP: [number, number] = [180, 90];
const TUCK_DOWN: [number, number] = [-50, 112];
const ADV_DOWN: [number, number] = [0, 90];
// En la plancha los hombros van bajos: con el muslo vertical, la rodilla
// tocaría el piso. El muslo se va atrás y los talones suben.
const ADV_PLANCHE: [number, number] = [40, 120];

/** Colgado de la barra con agarre normal; la barra está en y = 0. */
function onBar(
  shoulder: Point,
  lean: number,
  thigh: number,
  shin = thigh,
): Joints {
  const hand = { x: 0, y: 0 };
  const hip = add(shoulder, body.torso, rad(lean));
  return {
    shoulder,
    hip,
    head: add(shoulder, HEAD, rad(lean + 180)),
    elbow: elbowAround(hand, shoulder, body.forearm, body.upperArm, -1),
    hand,
    near: leg(hip, thigh, shin),
  };
}

/** Sobre las manos (en el piso, y = 0), el pecho hacia la derecha. */
function inverted(
  lean: number,
  thigh: number,
  far?: number,
  shin = thigh,
): Joints {
  const hand = { x: 0, y: 0 };
  const up = 180 - lean;
  const shoulder = add(hand, ARM, rad(up));
  const hip = add(shoulder, body.torso, rad(up));
  return {
    shoulder,
    hip,
    // La cabeza, entre los brazos, asoma un poco hacia el pecho.
    head: add(shoulder, HEAD - 1, rad(14)),
    elbow: add(hand, body.forearm, rad(up)),
    hand,
    near: leg(hip, thigh, shin),
    ...(far !== undefined && { far: leg(hip, far, far) }),
  };
}

/**
 * Pistol squat de perfil sobre la pierna de apoyo (tobillo en 0, 0). `depth`
 * va de parado (0) al fondo (1): espinilla, muslo y tronco se inclinan juntos
 * para no perder el equilibrio, como en el atleta de /gracias.
 */
function squat(depth: number, free: boolean, reach = 0): Joints {
  const lerp = (a: number, b: number) => a + (b - a) * depth;
  const ankle = { x: 0, y: 0 };
  const knee = add(ankle, body.shin, rad(180 - lerp(4, 40)));
  const hip = add(knee, body.thigh, rad(180 + lerp(4, 98)));
  const lean = 180 - lerp(4, 46);
  const shoulder = add(hip, body.torso, rad(lean));
  const arms = lerp(70, 88) + reach;
  const elbow = add(shoulder, body.upperArm, rad(arms));
  const stand: Leg = { knee, ankle, toe: add(ankle, 10, rad(90)) };
  // La pierna libre siempre va estirada al frente, sin tocar el piso.
  const freeKnee = add(hip, body.thigh, rad(84));
  const freeAnkle = add(freeKnee, body.shin, rad(86));
  return {
    shoulder,
    hip,
    head: add(shoulder, HEAD, rad(lean)),
    elbow,
    hand: add(elbow, body.forearm, rad(arms + 5)),
    // La pierna libre va al frente; sin ella, las dos se apoyan juntas.
    near: free
      ? { knee: freeKnee, ankle: freeAnkle, toe: add(freeAnkle, 6, rad(140)) }
      : stand,
    ...(free && { far: stand }),
  };
}

function draw(j: Joints): Shape[] {
  const limb = (g: Leg) => [
    line(j.hip, g.knee, 11.5),
    line(g.knee, g.ankle, 8),
    line(g.ankle, g.toe, 5),
  ];
  return [
    ...(j.far ? limb(j.far) : []),
    line(j.hip, j.shoulder, 16),
    line(j.shoulder, j.head, 7.5),
    circle(j.head, body.head),
    ...limb(j.near),
    ...arm(j.shoulder, j.elbow, j.hand, 8.5, 7),
    circle(j.hand, 3.6),
  ];
}

// Equipo, en acero. El piso no se dibuja: es el escalón de cada etapa.
const bar = (x = 0) => line({ x: x - 24, y: 0 }, { x: x + 24, y: 0 }, 5);
const box = (x1: number, x2: number, top: number): Shape => ({
  kind: 'path',
  d: `M${x1} ${top} L${x2} ${top} L${x2} 3 L${x1} 3 Z`,
});

const stage = (j: Joints, fixed: Shape[]): Stage => ({ fixed, body: draw(j) });

/** Caja que contiene todas las etapas, con un margen para el grano del gis. */
function frame(stages: Stage[]): string {
  const xs: number[] = [];
  const ys: number[] = [];
  const grow = (x: number, y: number, r: number) => {
    xs.push(x - r, x + r);
    ys.push(y - r, y + r);
  };
  for (const shape of stages.flatMap((s) => [...s.fixed, ...s.body])) {
    if (shape.kind === 'line') {
      grow(shape.x1, shape.y1, shape.w / 2);
      grow(shape.x2, shape.y2, shape.w / 2);
    } else if (shape.kind === 'circle') {
      grow(shape.cx, shape.cy, shape.r + (shape.ring ?? 0) / 2);
    } else {
      const n = shape.d.match(/-?\d+(\.\d+)?/g)!.map(Number);
      for (let i = 0; i < n.length; i += 2) grow(n[i], n[i + 1], 0);
    }
  }
  // Abajo casi sin margen: manos y pies se apoyan en el escalón.
  const [pad, foot] = [4, 1.5];
  const [x, y] = [Math.min(...xs) - pad, Math.min(...ys) - pad];
  const [w, h] = [Math.max(...xs) + pad - x, Math.max(...ys) + foot - y];
  return [x, y, w, h].map((n) => Math.round(n)).join(' ');
}

function ladder(stages: Stage[]): SkillLadder {
  return { viewBox: frame(stages), stages };
}

const handstand = (() => {
  const pike = inverted(0, 90);
  const wall = inverted(4, 176);
  const wallX = wall.hip.x + 13;
  return ladder([
    // Pies en un cajón a la altura de la cadera: el peso pasa a los hombros.
    stage(pike, [
      box(pike.near.ankle.x - 16, pike.near.ankle.x + 10, pike.hip.y + 5),
    ]),
    // Pecho a la pared: el cuerpo se alinea sin tener que equilibrarse.
    stage(wall, [
      line({ x: wallX, y: 4 }, { x: wallX, y: wall.near.toe.y - 14 }, 5),
    ]),
    // Tijera: ya sin pared, las piernas abiertas ayudan a corregir.
    stage(inverted(0, 148, 212), []),
    stage(inverted(0, 180), []),
  ]);
})();

const muscleup = ladder([
  // Dominada al pecho: la barra llega abajo de la clavícula.
  stage(onBar({ x: -12, y: 6 }, 14, 18), [bar()]),
  // Fondo en barra recta: abajo, con el pecho sobre la barra.
  stage(onBar({ x: -4, y: -22 }, -14, 10, 14), [bar()]),
  // Transición: el pecho pasa por encima de la barra, los codos atrás.
  stage(onBar({ x: -12, y: 2 }, -42, 34, 22), [bar()]),
  // Arriba, brazos bloqueados y el cuerpo vertical.
  stage(onBar({ x: -3, y: -51 }, 2, 6), [bar()]),
]);

const frontlever = ladder([
  stage(hold('hang', [TUCK_UP]), [bar()]),
  stage(hold('hang', [ADV_UP]), [bar()]),
  stage(hold('hang', [FULL, ADV_UP]), [bar()]),
  stage(hold('hang', [FULL]), [bar()]),
]);

const backlever = ladder([
  stage(hold('hang', [TUCK_DOWN]), [bar()]),
  stage(hold('hang', [ADV_DOWN]), [bar()]),
  stage(hold('hang', [FULL, ADV_DOWN]), [bar()]),
  stage(hold('hang', [FULL]), [bar()]),
]);

const planche = (() => {
  // Lean: en posición de lagartija, los hombros se adelantan a las manos.
  const hand = { x: 0, y: 0 };
  const shoulder = add(hand, ARM, rad(205));
  const slope =
    (Math.acos((-5 - shoulder.y) / (body.torso + 75)) * 180) / Math.PI;
  const hip = add(shoulder, body.torso, rad(slope));
  const knee = add(hip, body.thigh, rad(slope));
  const ankle = add(knee, body.shin, rad(slope));
  const lean: Joints = {
    shoulder,
    hip,
    head: add(shoulder, HEAD, rad(slope + 180)),
    elbow: add(hand, body.forearm, rad(205)),
    hand,
    near: { knee, ankle, toe: add(ankle, 6, rad(-30)) },
  };
  const tuck = hold('support', [TUCK_DOWN], 14);
  const adv = hold('support', [ADV_PLANCHE], 4);
  const full = hold('support', [FULL], 2);
  return ladder([
    stage(lean, []),
    stage(tuck, []),
    stage(adv, []),
    stage(full, []),
  ]);
})();

const pistol = (() => {
  const deep = squat(1, false);
  const toBox = squat(0.72, true);
  const helped = squat(1, true, -8);
  const full = squat(1, true);
  const post = helped.hand.x + 1;
  return ladder([
    // Sentadilla profunda con las dos piernas.
    stage(deep, []),
    // Pistol hasta un cajón: se baja solo hasta donde se controla.
    stage(toBox, [box(toBox.hip.x - 18, toBox.hip.x + 8, toBox.hip.y + 9)]),
    // Con apoyo: una mano en un poste quita el problema del equilibrio.
    stage(helped, [line({ x: post, y: 4 }, { x: post, y: -150 }, 4)]),
    stage(full, []),
  ]);
})();

export const skillLadders: Record<SkillId, SkillLadder> = {
  handstand,
  muscleup,
  frontlever,
  planche,
  backlever,
  pistol,
};
