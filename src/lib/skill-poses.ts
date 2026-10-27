// Cada skill dibujado en gis (DESIGN.md · Ruta de skills): de perfil, con las
// proporciones y los trazos de los atletas de gis. Él mira a la derecha. En
// las posiciones horizontales que se sostienen con los brazos rectos (levers y
// plancha), el ángulo del brazo no se elige a ojo: se calcula en cada cuadro
// para que el centro de masa quede justo bajo la barra o sobre las manos, como
// en el equilibrio real. Por eso en el tuck los brazos van casi verticales y en
// la posición completa se inclinan mucho más. En la pistol squat se calcula
// igual la inclinación del tronco, para que el centro de masa quede sobre el
// pie de apoyo.
//
// Los skills de posición (parada de manos, levers y plancha) llegan a ella
// una vez y se quedan; los de repeticiones (muscle-up y pistol squat) se
// repiten en bucle. La pose final es la que se dibuja fija (sin JS o con
// movimiento reducido). Unos los hace él y otros ella.

import {
  add,
  along,
  arm,
  body,
  CENTER,
  circle,
  deg,
  elbowAround,
  glute,
  keys,
  line,
  MASS,
  solve,
  type Point,
  type Shape,
} from './athlete-poses';

export type SkillId =
  'handstand' | 'muscleup' | 'frontlever' | 'planche' | 'backlever' | 'pistol';

export type SkillMotion = {
  viewBox: string;
  /** Lo que no se mueve (la barra), en acero. */
  fixed: Shape[];
  /**
   * El cuerpo para un avance `p` (0 → 1), siempre con las mismas figuras.
   * `pose(1)` es la pose fija.
   */
  pose: (p: number) => Shape[];
  /**
   * Las articulaciones del mismo instante, ya a la escala de quien lo hace.
   * Las usa la prueba de biomecánica (tests/e2e/biomechanics.spec.ts).
   */
  joints: (p: number) => Joints;
  /** Duración de la ida, en ms. */
  duration: number;
  /**
   * `hold`: llega a la posición una vez y la sostiene con micro-ajustes.
   * `reps`: ida, pausa, vuelta y pausa, en bucle.
   */
  play: 'hold' | 'reps';
  /**
   * La vuelta, de la pose fija (0) a la inicial (1). No es la ida al revés
   * cuando la técnica cambia: el muscle-up baja en negativa, sin el kip.
   */
  back: (p: number) => Shape[];
  backJoints: (p: number) => Joints;
  /** Ritmo de las repeticiones, en ms: pausa al final, vuelta y pausa al inicio. */
  tempo: Tempo;
  /**
   * Al sostener la posición, `t` ms después de llegar: pequeñas correcciones
   * del equilibrio, como en un cuerpo real. `settle(0)` es la pose fija.
   */
  settle?: (t: number) => Shape[];
  settleJoints?: (t: number) => Joints;
  /** Se apoya en el piso (el escalón); colgado de la barra no hay piso. */
  floor: boolean;
};

export type Tempo = { end: number; back: number; start: number };

export type Leg = { knee: Point; ankle: Point; toe: Point };
export type Joints = {
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
/** Pistol squat en el fondo: inclinación de la espinilla y flexión de la rodilla. */
const [ANKLE, KNEE] = [34, 110];
/** Pie de apoyo, del tobillo a la punta. */
const FOOT = 10;
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

/** La misma pose con cada articulación transformada por `m`. */
function transform(j: Joints, m: (p: Point) => Point): Joints {
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

const move = (j: Joints, d: Point) =>
  transform(j, (p) => ({ x: p.x + d.x, y: p.y + d.y }));

/**
 * Centro de masa por segmentos (Dempster, con el centro de cada uno donde
 * corresponde). Sin `far`, las piernas van juntas.
 */
export function centerOfMass(j: Joints): Point {
  const legs = j.far ? [j.near, j.far] : [j.near];
  const share = 1 / legs.length;
  const parts: [Point, number][] = [
    [j.head, MASS.head],
    [mid(j.shoulder, j.hip), MASS.trunk],
    [along(j.shoulder, j.elbow, CENTER.upperArm), MASS.upperArm],
    [along(j.elbow, j.hand, CENTER.forearm), MASS.forearm],
    ...legs.flatMap((g): [Point, number][] => [
      [along(j.hip, g.knee, CENTER.thigh), MASS.thigh * share],
      [along(g.knee, g.ankle, CENTER.shin), MASS.shin * share],
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
 * La pose de `build(a)` cuyo centro de masa cae en la vertical de `x(j)`, el
 * apoyo: busca el ángulo `a` entre `lo` y `hi`.
 */
function balance(
  build: (a: number) => Joints,
  x: (j: Joints) => number,
  [lo, hi]: [number, number],
): Joints {
  const off = (a: number) => {
    const j = build(a);
    return centerOfMass(j).x - x(j);
  };
  return build(solve(off, lo, hi));
}

/**
 * Cuerpo colgado de la barra o apoyado en las manos, con los brazos rectos, y
 * las manos en (0, 0). `tilt` gira todo el cuerpo desde la horizontal (cabeza a
 * la izquierda y pies a la derecha): -90 es colgado, cabeza arriba. `legs` son
 * los ángulos de cada pierna respecto a un tronco horizontal. `a` es el ángulo
 * del brazo: colgado, sube desde el hombro hacia los pies; apoyado, baja.
 */
function lever(
  grip: 'hang' | 'support',
  legs: [number, number][],
  tilt: number,
  a: number,
): Joints {
  const torso = 90 + tilt;
  const shoulder = { x: 0, y: 0 };
  const hip = add(shoulder, body.torso, rad(torso));
  const dir = rad(grip === 'hang' ? 180 - a : a);
  const [near, far] = legs.map(([thigh, shin]) =>
    leg(hip, thigh + tilt, shin + tilt),
  );
  const j: Joints = {
    shoulder,
    hip,
    head: add(shoulder, HEAD, rad(torso + 180)),
    elbow: add(shoulder, body.upperArm, dir),
    hand: add(shoulder, ARM, dir),
    near,
    ...(far && { far }),
  };
  return move(j, { x: -j.hand.x, y: -j.hand.y });
}

/**
 * Sostén con los brazos rectos (levers y plancha): busca el ángulo del brazo
 * que deja el centro de masa en la vertical de las manos, como en el
 * equilibrio real. `reach` es el rango donde buscarlo.
 */
function hold(
  grip: 'hang' | 'support',
  legs: [number, number][],
  tilt = 0,
  reach: [number, number] = [0, 85],
): Joints {
  return balance(
    (a) => lever(grip, legs, tilt, a),
    (k) => k.hand.x,
    reach,
  );
}

// Piernas respecto a un tronco horizontal. «Arriba» = del lado del pecho en el
// front lever; en el back lever y la plancha el pecho va abajo (espejo).
const FULL: [number, number] = [90, 90];
// En el tuck la rodilla dobla unos 140° (40° entre muslo y espinilla): más no
// se puede, la pantorrilla choca con el muslo.
const TUCK_UP: [number, number] = [230, 90];
const TUCK_DOWN: [number, number] = [-50, 90];

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
 * va de parado (0) al fondo (1): la rodilla pasa la punta del pie y el glúteo
 * baja casi al talón. La inclinación del tronco no se elige a ojo: se calcula
 * para que el centro de masa quede sobre el pie de apoyo (la pierna libre y
 * los brazos al frente hacen de contrapeso), así que de pie la cadera va un
 * poco atrás y en el fondo el pecho se inclina al frente.
 */
function squat(depth: number): Joints {
  const lerp = (a: number, b: number) => a + (b - a) * depth;
  const ankle = { x: 0, y: 0 };
  const knee = add(ankle, body.shin, rad(180 - lerp(2, ANKLE)));
  const hip = add(knee, body.thigh, rad(180 + lerp(2, KNEE)));
  const stand: Leg = { knee, ankle, toe: add(ankle, FOOT, rad(90)) };
  // La pierna libre siempre va estirada al frente, sin tocar el piso: en el
  // fondo, casi paralela al piso (un poco arriba, para no tocarlo).
  const freeKnee = add(hip, body.thigh, rad(lerp(80, 98)));
  const freeAnkle = add(freeKnee, body.shin, rad(lerp(82, 100)));
  const arms = lerp(70, 88);
  return balance(
    (forward) => {
      const lean = 180 - forward;
      const shoulder = add(hip, body.torso, rad(lean));
      const elbow = add(shoulder, body.upperArm, rad(arms));
      return {
        shoulder,
        hip,
        head: add(shoulder, HEAD, rad(lean)),
        elbow,
        hand: add(elbow, body.forearm, rad(arms + 5)),
        near: {
          knee: freeKnee,
          ankle: freeAnkle,
          toe: add(freeAnkle, 6, rad(140)),
        },
        far: stand,
      };
    },
    // Sobre el centro del pie, entre el talón y la punta.
    () => FOOT / 2 - 1,
    [-30, 80],
  );
}

/**
 * Quién hace el skill. `chest` dice hacia dónde va el pecho: 1 si queda a la
 * izquierda de la línea cadera → hombro vista hacia la cabeza (de pie mirando
 * a la derecha, front lever), -1 si queda al otro lado (parada de manos con el
 * pecho a la derecha, back lever, plancha).
 */
type Figure = { her: boolean; chest: 1 | -1 };

/** Ella: las proporciones de los atletas de gis (el tronco mide 46, no 50). */
const HER = 46 / 50;

/**
 * Escala la pose desde el origen (la barra, las manos o el pie de apoyo): el
 * apoyo no se mueve y el centro de masa sigue en su vertical.
 */
const scale = (j: Joints, k: number) =>
  transform(j, (p) => ({ x: p.x * k, y: p.y * k }));

const unit = (a: Point, b: Point) => {
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  return { x: (b.x - a.x) / d, y: (b.y - a.y) / d };
};

/**
 * La pierna de atrás siempre se dibuja (encimada si no está). Ella lleva
 * glúteo y una cola de caballo que cuelga con la gravedad, también de cabeza.
 */
function draw(j: Joints, { her, chest }: Figure): Shape[] {
  const far = j.far ?? j.near;
  const limb = (g: Leg) => [
    line(j.hip, g.knee, her ? 11 : 11.5),
    line(g.knee, g.ankle, her ? 7.5 : 8),
    line(g.ankle, g.toe, her ? 4.5 : 5),
  ];
  if (!her) {
    return [
      ...limb(far),
      line(j.hip, j.shoulder, 16),
      line(j.shoulder, j.head, 7.5),
      circle(j.head, body.head),
      ...limb(j.near),
      ...arm(j.shoulder, j.elbow, j.hand, 8.5, 7),
      circle(j.hand, 3.6),
    ];
  }
  // La espalda: del lado contrario al pecho.
  const t = unit(j.hip, j.shoulder);
  const back = { x: t.y * chest, y: -t.x * chest };
  const up = unit(j.shoulder, j.head);
  const at = (p: Point, b: number, u: number, g: number) => ({
    x: p.x + back.x * b + up.x * u,
    y: p.y + back.y * b + up.y * u + g,
  });
  const tail = at(j.head, 6, 3, 0);
  const tip = at(tail, 5, 0, 4);
  return [
    ...limb(far),
    glute(j.shoulder, j.hip, far.knee, chest),
    line(j.hip, j.shoulder, 14),
    line(j.shoulder, j.head, 6.5),
    circle(j.head, body.head * HER),
    line(tail, tip, 5),
    line(tip, at(tip, 2, 0, 8), 3.5),
    ...limb(j.near),
    ...arm(j.shoulder, j.elbow, j.hand, 7.5, 6),
    circle(j.hand, 3.5),
  ];
}

// Equipo, en acero. El piso no se dibuja: es el escalón bajo la figura.
const bar = line({ x: -24, y: 0 }, { x: 24, y: 0 }, 5);

/** Caja que contiene las figuras, con un margen para el grano del gis. */
function frame(shapes: Shape[]): string {
  const xs: number[] = [];
  const ys: number[] = [];
  const grow = (x: number, y: number, r: number) => {
    xs.push(x - r, x + r);
    ys.push(y - r, y + r);
  };
  for (const shape of shapes) {
    if (shape.kind === 'line') {
      grow(shape.x1, shape.y1, shape.w / 2);
      grow(shape.x2, shape.y2, shape.w / 2);
    } else if (shape.kind === 'circle') {
      grow(shape.cx, shape.cy, shape.r + (shape.ring ?? 0) / 2);
    } else {
      // El contorno del cuerpo (stroke-width 4) suma 2 por fuera.
      const n = shape.d.match(/-?\d+(\.\d+)?/g)!.map(Number);
      for (let i = 0; i < n.length; i += 2) grow(n[i], n[i + 1], 2);
    }
  }
  // Abajo casi sin margen: manos y pies se apoyan en el escalón.
  const [pad, foot] = [4, 1.5];
  const [x, y] = [Math.min(...xs) - pad, Math.min(...ys) - pad];
  const [w, h] = [Math.max(...xs) + pad - x, Math.max(...ys) + foot - y];
  return [x, y, w, h].map((n) => Math.round(n)).join(' ');
}

/**
 * Un skill: su equipo fijo, su movimiento (pose para un avance 0 → 1, que
 * termina quieta en la posición), la duración de la ida, quién lo hace y si
 * se sostiene o se repite.
 */
function motion(
  fixed: Shape[],
  joints: (p: number) => Joints,
  duration: number,
  figure: Figure,
  play: SkillMotion['play'],
  {
    back = (p) => joints(1 - p),
    tempo = { end: 0, back: duration, start: 600 },
    settle,
  }: {
    back?: (p: number) => Joints;
    tempo?: Tempo;
    settle?: (t: number) => Joints;
  } = {},
): SkillMotion {
  const sized = (j: Joints) => (figure.her ? scale(j, HER) : j);
  const scaled = (p: number) => sized(joints(p));
  const backJoints = (p: number) => sized(back(p));
  const pose = (p: number) => draw(scaled(p), figure);
  // La caja contiene cada momento del movimiento, también la vuelta.
  const frames = Array.from({ length: 21 }, (_, i) => [
    ...pose(i / 20),
    ...draw(backJoints(i / 20), figure),
  ]);
  const settleJoints = settle && ((t: number) => sized(settle(t)));
  return {
    viewBox: frame([...fixed, ...frames.flat()]),
    fixed,
    pose,
    joints: scaled,
    duration,
    play,
    back: (p) => draw(backJoints(p), figure),
    backJoints,
    tempo,
    ...(settleJoints && {
      settle: (t: number) => draw(settleJoints(t), figure),
      settleJoints,
    }),
    floor: !fixed.includes(bar),
  };
}

/**
 * Oscilación suave para los micro-ajustes: dos ondas de periodos que no se
 * repiten juntos (así no se ve mecánica). Vale 0 en `t = 0`.
 */
const sway = (t: number, amplitude: number, period: number) =>
  amplitude *
  (0.7 * Math.sin((2 * Math.PI * t) / period) +
    0.3 * Math.sin((2 * Math.PI * t) / (period * 0.41)));

/** 0 → 1 entre `from` y `to` (suave), fijo fuera de ese tramo. */
const stage = (p: number, from: number, to: number) =>
  keys(p, [
    [from, 0],
    [to, 1],
  ]);

const mixLeg = (
  a: [number, number],
  b: [number, number],
  t: number,
): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/**
 * Ángulos absolutos de cada segmento (desde la vertical hacia abajo, + a la
 * derecha), para poses que no se apoyan en un solo punto: la entrada a la
 * parada de manos pasa del pie a las manos.
 */
type Angles = {
  trunk: number;
  arm: number;
  near: [number, number, number];
  far: [number, number, number];
};

/** El cuerpo con la cadera en `hip`: tronco, brazos rectos y piernas. */
function chain(a: Angles, hip: Point = { x: 0, y: 0 }): Joints {
  const shoulder = add(hip, body.torso, rad(a.trunk));
  const limb = ([thigh, shin, foot]: [number, number, number]): Leg => {
    const knee = add(hip, body.thigh, rad(thigh));
    const ankle = add(knee, body.shin, rad(shin));
    return { knee, ankle, toe: add(ankle, 6, rad(foot)) };
  };
  return {
    shoulder,
    hip,
    // La cabeza asoma un poco hacia el pecho, como en `inverted`.
    head: add(shoulder, HEAD - 1, rad(a.trunk + 14)),
    elbow: add(shoulder, body.upperArm, rad(a.arm)),
    hand: add(shoulder, ARM, rad(a.arm)),
    near: limb(a.near),
    far: limb(a.far),
  };
}

/** Entrada a la parada de manos: cuándo las manos tocan el piso. */
const TOUCH = 0.55;

/**
 * Patada a la parada de manos (ella mira a la izquierda, hacia las manos):
 * zancada con los brazos arriba, se inclina y apoya las manos, patea con la
 * pierna de atrás y la de adelante empuja y la sigue, hasta la tijera sobre
 * las manos. Todo el cuerpo gira en el mismo sentido. Antes de `TOUCH` el pie
 * de adelante está fijo en el piso; después, las manos.
 */
function kickAngles(t: number, shin = 26): Angles {
  const s = [0, 0.3, TOUCH, 0.8, 1];
  const at = (values: number[]) =>
    flow(
      t,
      s.map((k, i): [number, number] => [k, values[i]]),
    );
  return {
    trunk: at([190, 240, 300, 345, 360]),
    arm: at([190, 250, 340, 357, 360]),
    // Pierna de adelante (empuja): de la zancada a la tijera, al frente.
    near: [
      at([-35, -40, -10, 60, 148]),
      at([0, -10, shin, 90, 148]),
      at([-60, -60, -60, 90, 148]),
    ],
    // Pierna de atrás (patea): sube por detrás y pasa la vertical.
    far: [
      at([30, 50, 100, 160, 212]),
      at([30, 55, 105, 165, 212]),
      at([-30, 0, 105, 165, 212]),
    ],
  };
}

const handOrigin = (j: Joints) => move(j, { x: -j.hand.x, y: -j.hand.y });

// Al tocar, el tobillo de adelante queda 3 sobre el piso (el pie, plano):
// la espinilla se calcula para que el pie y las manos lleguen juntos.
const TOUCH_SHIN = solve(
  (shin) => {
    const j = handOrigin(chain(kickAngles(TOUCH, shin)));
    return j.near.ankle.y + 3;
  },
  0,
  60,
);
const PLANTED = (() => {
  const j = handOrigin(chain(kickAngles(TOUCH, TOUCH_SHIN)));
  return j.near.ankle;
})();

function kickUp(t: number): Joints {
  const j = chain(kickAngles(t, TOUCH_SHIN));
  if (t >= TOUCH) return handOrigin(j);
  return move(j, {
    x: PLANTED.x - j.near.ankle.x,
    y: PLANTED.y - j.near.ankle.y,
  });
}

const handstand = motion(
  [],
  // Patada desde la zancada hasta la tijera sobre las manos. Luego junta las
  // piernas y corrige el equilibrio con las muñecas: el cuerpo, recto, se
  // mece cada vez menos hasta quedar quieto.
  (p) => {
    const ENTRY = 0.42;
    if (p < ENTRY) return kickUp(p / ENTRY);
    const q = (p - ENTRY) / (1 - ENTRY);
    const lean = keys(q, [
      [0, 0],
      [0.45, 0],
      [0.56, 2.2],
      [0.68, -1.6],
      [0.8, 0.8],
      [0.9, -0.3],
      [1, 0],
    ]);
    const open =
      32 *
      keys(q, [
        [0, 1],
        [0.1, 1],
        [0.42, 0],
      ]);
    return inverted(lean, 180 - lean - open, 180 - lean + open);
  },
  4800,
  { her: true, chest: -1 },
  'hold',
  {
    // Ya quieta, corrige con las muñecas: se mece menos de 1° sobre las manos.
    settle: (t) => {
      const lean = sway(t, 0.6, 1400);
      return inverted(lean, 180 - lean, 180 - lean);
    },
  },
);

/**
 * Valor en `s` a partir de fotogramas clave [s, valor], con una curva que pasa
 * por todos sin frenar en cada uno (Hermite monótona, PCHIP): la velocidad es
 * continua y la curva no rebasa los valores clave. Solo se detiene al principio,
 * al final y donde el valor cambia de sentido, como un movimiento real.
 */
function flow(s: number, frames: [number, number][]): number {
  const n = frames.length;
  if (s <= frames[0][0]) return frames[0][1];
  if (s >= frames[n - 1][0]) return frames[n - 1][1];
  const width = (i: number) => frames[i + 1][0] - frames[i][0];
  const slope = (i: number) => (frames[i + 1][1] - frames[i][1]) / width(i);
  const tangent = (i: number) => {
    if (i === 0 || i === n - 1) return 0;
    const [a, b] = [slope(i - 1), slope(i)];
    if (a * b <= 0) return 0;
    const [h0, h1] = [width(i - 1), width(i)];
    return (3 * (h0 + h1)) / ((2 * h1 + h0) / a + (h1 + 2 * h0) / b);
  };
  let i = 0;
  while (s > frames[i + 1][0]) i++;
  const h = width(i);
  const t = (s - frames[i][0]) / h;
  const [t2, t3] = [t * t, t * t * t];
  return (
    (2 * t3 - 3 * t2 + 1) * frames[i][1] +
    (t3 - 2 * t2 + t) * h * tangent(i) +
    (3 * t2 - 2 * t3) * frames[i + 1][1] +
    (t3 - t2) * h * tangent(i + 1)
  );
}

const muscleup = motion(
  [bar],
  // Una repetición, en un solo movimiento continuo: los fotogramas clave se
  // unen con una curva de velocidad continua (sin detenerse en cada uno).
  // 1. Colgado en hollow body con un ligero balanceo: arco (piernas atrás) y
  //    patada en hollow (piernas al frente) que arranca el jalón.
  // 2. Jalón explosivo: el pecho sube en diagonal alejándose de la barra y
  //    los brazos pasan por 90°; el codo baja hacia las costillas.
  // 3. Transición brusca: el tronco rota al frente por encima de la barra.
  // 4. Fondo: empuje hasta los brazos rectos, con la cadera contra la barra y
  //    los hombros un poco al frente, el centro de masa sobre las manos.
  // El centro de masa traza una «C» alrededor de la barra: atrás al jalar,
  // encima al transicionar.
  (p) => {
    const t = [0, 0.1, 0.2, 0.3, 0.38, 0.47, 0.6, 0.82];
    const at = (values: number[]) =>
      flow(
        p,
        t.map((s, i): [number, number] => [s, values[i]]),
      );
    // El hombro nunca se acerca a menos de ~17 de la barra: el codo no dobla
    // más de unos 140° (35° entre brazo y antebrazo). Abajo y arriba, a ~52
    // (el largo del brazo): colgado muerto y bloqueo con los brazos rectos.
    return onBar(
      {
        x: at([-1, 4, -4, -19, -18, -14, -2, 3.5]),
        y: at([51.9, 51.7, 48, 28, 8, -12, -24, -51.85]),
      },
      // Tronco (+ = la cadera va al frente).
      at([3, -6, 8, 16, 6, -42, -20, -16]),
      // Muslo y espinilla: arriba, casi en línea con el tronco (hueco leve).
      at([6, -12, 16, 20, 26, 34, 8, -2]),
      at([6, -14, 12, 16, 20, 22, 4, -4]),
    );
  },
  2800,
  { her: false, chest: 1 },
  'reps',
  {
    // La negativa: del soporte baja despacio por el fondo, vuelve a pasar
    // bajo la barra inclinando el tronco al frente y baja el jalón hasta el
    // colgado. Sin balanceo ni patada: el kip solo sirve para subir.
    back: (p) => {
      const t = [0, 0.3, 0.5, 0.62, 0.8, 1];
      const at = (values: number[]) =>
        flow(
          p,
          t.map((s, i): [number, number] => [s, values[i]]),
        );
      return onBar(
        {
          x: at([3.5, -2, -14, -18, -12, -1]),
          y: at([-51.85, -24, -12, 8, 32, 51.9]),
        },
        at([-16, -20, -30, 0, 6, 3]),
        at([-2, 8, 20, 18, 10, 6]),
        at([-4, 4, 14, 14, 8, 6]),
      );
    },
    tempo: { end: 500, back: 2000, start: 500 },
  },
);

/**
 * Del colgado muerto a un lever: sube las rodillas al pecho (tuck), gira con
 * los brazos rectos `turn` grados y extiende las piernas. En cada momento el
 * ángulo del brazo se calcula para que el centro de masa quede bajo la barra:
 * el giro es lento y controlado, como en la realidad.
 */
function fromHang(tuck: [number, number], turn: number) {
  return (p: number) => {
    const [up, rotate, open] = [
      stage(p, 0.08, 0.3),
      stage(p, 0.26, 0.64),
      stage(p, 0.68, 0.94),
    ];
    const legs = open > 0 ? mixLeg(tuck, FULL, open) : mixLeg(FULL, tuck, up);
    return hold('hang', [legs], -90 + turn * rotate, [-60, 85]);
  };
}

/**
 * Micro-ajustes de un sostén con los brazos rectos: el cuerpo se inclina y la
 * cadera se dobla menos de 1°, y el brazo se vuelve a calcular para seguir en
 * equilibrio.
 */
function settleHold(
  grip: 'hang' | 'support',
  tilt: number,
  reach?: [number, number],
) {
  return (t: number) => {
    const hip = sway(t, 0.8, 1100);
    return hold(
      grip,
      [[FULL[0] + hip, FULL[1] + hip]],
      tilt + sway(t, 0.5, 1500),
      reach,
    );
  };
}

// Front lever: del colgado gira 90° hasta quedar horizontal, pecho arriba.
const frontlever = motion(
  [bar],
  fromHang(TUCK_UP, 90),
  3400,
  { her: true, chest: 1 },
  'hold',
  { settle: settleHold('hang', 0, [-60, 85]) },
);

// Back lever: del colgado gira hacia atrás 270°: pasa por el colgado
// invertido (cadera arriba) y baja hasta quedar horizontal, pecho abajo.
const backlever = motion(
  [bar],
  fromHang(TUCK_DOWN, -270),
  4400,
  { her: false, chest: -1 },
  'hold',
  { settle: settleHold('hang', -360, [-60, 85]) },
);

/**
 * Plancha inclinada (planche lean): cuerpo recto, con las puntas de los pies
 * en el piso y los hombros `a` grados por delante de las manos.
 */
function plankTilt(a: number): number {
  const shoulderY = ARM * Math.cos(rad(a));
  const reach = body.torso + body.thigh + body.shin + 6;
  return (Math.acos(shoulderY / reach) * 180) / Math.PI - 90;
}

/** Ángulo del brazo del tuck de plancha en equilibrio sobre las manos. */
const PLANCHE_TUCK_TILT = 14;
const PLANCHE_TUCK_ARM = solve(
  (a) => centerOfMass(lever('support', [TUCK_DOWN], PLANCHE_TUCK_TILT, a)).x,
  0,
  85,
);

/**
 * De la plancha inclinada a la plancha: se inclina con el cuerpo recto y las
 * puntas en el piso, despega los pies llevando las rodillas al pecho (tuck,
 * en equilibrio sobre las manos) y extiende las piernas mientras la cadera
 * baja.
 */
const planche = motion(
  [],
  (p) => {
    // La cadera sube antes de que las rodillas lleguen al pecho: así los pies
    // se despegan hacia arriba, sin rozar el piso.
    const [lean, hips, lift, open] = [
      stage(p, 0.04, 0.3),
      stage(p, 0.32, 0.52),
      stage(p, 0.38, 0.58),
      stage(p, 0.62, 0.94),
    ];
    if (open > 0) {
      return hold(
        'support',
        [mixLeg(TUCK_DOWN, FULL, open)],
        PLANCHE_TUCK_TILT + (2 - PLANCHE_TUCK_TILT) * open,
      );
    }
    // Se inclina hasta el ángulo del tuck con los pies en el piso; al llevar
    // las rodillas al pecho, el centro de masa llega sobre las manos y los
    // pies se despegan solos.
    const a = PLANCHE_TUCK_ARM * lean;
    const tilt = plankTilt(a) + (PLANCHE_TUCK_TILT - plankTilt(a)) * hips;
    return lever('support', [mixLeg(FULL, TUCK_DOWN, lift)], tilt, a);
  },
  3800,
  { her: false, chest: -1 },
  'hold',
  { settle: settleHold('support', 2) },
);

// De pie sobre una pierna, baja despacio hasta el fondo, se detiene y sube más
// rápido: la bajada (excéntrica) es la parte controlada.
const pistol = motion(
  [],
  (p) =>
    squat(
      keys(p, [
        [0, 0],
        [1, 1],
      ]),
    ),
  1600,
  { her: true, chest: 1 },
  'reps',
  { tempo: { end: 400, back: 1100, start: 600 } },
);

export const skillMotions: Record<SkillId, SkillMotion> = {
  handstand,
  muscleup,
  frontlever,
  planche,
  backlever,
  pistol,
};
