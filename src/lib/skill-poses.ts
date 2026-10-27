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
  arm,
  body,
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
  /** Duración de la ida (la vuelta dura lo mismo), en ms. */
  duration: number;
  /**
   * `hold`: llega a la posición una vez y se queda. `reps`: ida, vuelta y
   * una pausa, en bucle.
   */
  play: 'hold' | 'reps';
  /** Se apoya en el piso (el escalón); colgado de la barra no hay piso. */
  floor: boolean;
};

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
  const j = balance(build, (k) => k.hand.x, [0, 85]);
  return move(j, { x: -j.hand.x, y: -j.hand.y });
}

// Piernas respecto a un tronco horizontal. «Arriba» = del lado del pecho en el
// front lever; en el back lever y la plancha el pecho va abajo (espejo).
const FULL: [number, number] = [90, 90];
const TUCK_UP: [number, number] = [230, 68];
const TUCK_DOWN: [number, number] = [-50, 112];

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
): SkillMotion {
  const pose = (p: number) =>
    draw(figure.her ? scale(joints(p), HER) : joints(p), figure);
  // La caja contiene cada momento del movimiento.
  const frames = Array.from({ length: 21 }, (_, i) => pose(i / 20));
  return {
    viewBox: frame([...fixed, ...frames.flat()]),
    fixed,
    pose,
    duration,
    play,
    floor: !fixed.includes(bar),
  };
}

const handstand = motion(
  [],
  // Desde la tijera junta las piernas y corrige el equilibrio con las
  // muñecas: el cuerpo, recto, se mece cada vez menos hasta quedar quieto.
  (p) => {
    const lean = keys(p, [
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
      keys(p, [
        [0, 1],
        [0.1, 1],
        [0.42, 0],
      ]);
    return inverted(lean, 180 - lean - open, 180 - lean + open);
  },
  2800,
  { her: true, chest: -1 },
  'hold',
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
    return onBar(
      {
        x: at([-1, 4, -4, -19, -13, -9, -2, 5]),
        y: at([50, 49.5, 48, 28, 6, -2, -24, -51.3]),
      },
      // Tronco (+ = la cadera va al frente).
      at([3, -6, 8, 16, 6, -42, -20, -16]),
      // Muslo y espinilla.
      at([6, -12, 16, 20, 26, 34, 18, 16]),
      at([6, -14, 12, 16, 20, 22, 14, 10]),
    );
  },
  2800,
  { her: false, chest: 1 },
  'reps',
);

/**
 * De `from` a la posición completa: las piernas se extienden desde el tuck
 * (las rodillas pasan por el tuck avanzado) y el ángulo del brazo se vuelve a
 * calcular en cada momento, así que se inclina conforme el cuerpo se alarga.
 */
function extend(
  grip: 'hang' | 'support',
  from: [number, number],
  tilt: [number, number] = [0, 0],
) {
  return (p: number) => {
    const t = keys(p, [
      [0, 0],
      [0.15, 0],
      [0.65, 1],
    ]);
    const mix = (a: number, b: number) => a + (b - a) * t;
    return hold(
      grip,
      [[mix(from[0], FULL[0]), mix(from[1], FULL[1])]],
      mix(...tilt),
    );
  };
}

const frontlever = motion(
  [bar],
  extend('hang', TUCK_UP),
  2200,
  { her: true, chest: 1 },
  'hold',
);

const backlever = motion(
  [bar],
  extend('hang', TUCK_DOWN),
  2200,
  { her: false, chest: -1 },
  'hold',
);

// Del tuck a la plancha completa: la cadera baja mientras se extiende.
const planche = motion(
  [],
  extend('support', TUCK_DOWN, [14, 2]),
  2400,
  { her: false, chest: -1 },
  'hold',
);

// De pie sobre una pierna, baja despacio hasta el fondo y se queda.
const pistol = motion(
  [],
  (p) =>
    squat(
      keys(p, [
        [0, 0],
        [0.12, 0],
        [0.75, 1],
      ]),
    ),
  2400,
  { her: true, chest: 1 },
  'reps',
);

export const skillMotions: Record<SkillId, SkillMotion> = {
  handstand,
  muscleup,
  frontlever,
  planche,
  backlever,
  pistol,
};
