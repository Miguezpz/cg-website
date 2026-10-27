// Poses de los atletas de gis (DESIGN.md · Atletas de gis). Solo matemática,
// sin DOM: Astro la usa para dibujar la pose fija (sin JS o con movimiento
// reducido) y el navegador para animarlas: con el scroll o una sola vez.
//
// Cada ejercicio devuelve siempre las mismas figuras en el mismo orden, para
// que el navegador solo actualice sus atributos.

export type Exercise = 'pullup' | 'pistol' | 'jump' | 'dips' | 'muscleup';

export type Shape =
  | {
      kind: 'line';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      w: number;
      dash?: string;
      /** «Corte» del color del fondo que separa un brazo del torso. */
      gap?: boolean;
    }
  | {
      kind: 'circle';
      cx: number;
      cy: number;
      r: number;
      /** Grosor del aro: el círculo va hueco (una anilla). */
      ring?: number;
    }
  | { kind: 'path'; d: string };

export type Rig = {
  viewBox: string;
  /** Valor de `pose` para la pose fija (sin JS o con movimiento reducido). */
  still: number;
  /** Lo que no se mueve (la barra, el piso), en acero. */
  fixed: Shape[];
  /** Equipo que se mueve con el atleta (anilla y correa), en acero. */
  gear?: (s: number) => Shape[];
  /**
   * El cuerpo. Con `scroll`, `s` es el esfuerzo de una repetición (0 = inicio,
   * 1 = punto más alto). Con `once`, el avance del movimiento completo.
   */
  pose: (s: number) => Shape[];
  /**
   * Las articulaciones del mismo instante, con nombre (shoulder, elbow, hand,
   * hip, knee, ankle…). Las usa la prueba de biomecánica.
   */
  joints: (s: number) => Record<string, Point>;
} & (
  | {
      /** Repeticiones mientras el atleta cruza la pantalla. */
      play: 'scroll';
      reps: number;
      /**
       * Qué parte de cada repetición va de 0 a 1 (el resto, de vuelta). La
       * bajada (excéntrica) es más lenta que la subida: 0.4 si 0 → 1 sube.
       */
      tempo?: number;
    }
  | {
      /** Una sola vez al aparecer (páginas sin scroll), en `duration` ms. */
      play: 'once';
      duration: number;
    }
);

export type Point = { x: number; y: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mid = (a: Point, b: Point) => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});
const round = (n: number) => Math.round(n * 10) / 10;
export const line = (
  a: Point,
  b: Point,
  w: number,
  dash?: string,
  gap?: boolean,
): Shape => ({
  kind: 'line',
  x1: round(a.x),
  y1: round(a.y),
  x2: round(b.x),
  y2: round(b.y),
  w,
  ...(dash && { dash }),
  ...(gap && { gap }),
});
/**
 * Brazo de perfil que pasa por encima del torso: primero un corte del color
 * del fondo (como gis borrado) y encima el brazo, para que se lea.
 */
export const arm = (
  shoulder: Point,
  elbowPt: Point,
  wrist: Point,
  upper: number,
  fore: number,
): Shape[] => [
  line(shoulder, elbowPt, upper + 3, undefined, true),
  line(elbowPt, wrist, fore + 3, undefined, true),
  line(shoulder, elbowPt, upper),
  line(elbowPt, wrist, fore),
];
/**
 * Glúteo de perfil: una curva suave que sale de la espalda baja y entra en la
 * parte de atrás del muslo, sin el «balón» de un círculo pegado a la cadera.
 * `facing` es hacia dónde mira la atleta (1 derecha, -1 izquierda).
 */
export function glute(
  shoulder: Point,
  hip: Point,
  knee: Point,
  facing: 1 | -1 = 1,
): Shape {
  const unit = (a: Point, b: Point) => {
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    return { x: (b.x - a.x) / d, y: (b.y - a.y) / d };
  };
  // Bajando por el cuerpo, la espalda queda a la izquierda si mira a la derecha.
  const t = unit(shoulder, hip);
  const k = unit(hip, knee);
  const back = (d: Point) => ({ x: -d.y * facing, y: d.x * facing });
  const at = (from: Point, d: Point, along: number, n: Point, out: number) => ({
    x: from.x + d.x * along + n.x * out,
    y: from.y + d.y * along + n.y * out,
  });
  const nt = back(t);
  const nk = back(k);
  // Proporciones de ella: el glúteo empieza a 1/4 del tronco sobre la cadera,
  // termina a 1/3 del muslo y sobresale unas 3 unidades del tronco (14 de
  // ancho). El contorno del <path> suma 2 de grosor por fuera, así que los
  // bordes quedan al ras del tronco y del muslo (11).
  const torso = Math.hypot(hip.x - shoulder.x, hip.y - shoulder.y);
  const thigh = Math.hypot(knee.x - hip.x, knee.y - hip.y);
  const [top, bottom] = [torso * 0.25, thigh * 0.35];
  const start = at(hip, t, -top, nt, 5);
  const c1 = at(hip, t, -torso * 0.06, nt, 11.5);
  const c2 = at(hip, k, thigh * 0.14, nk, 11);
  const end = at(hip, k, bottom, nk, 3.5);
  const p = (q: Point) => `${round(q.x)} ${round(q.y)}`;
  return {
    kind: 'path',
    d: [
      `M${p(start)}`,
      `C${p(c1)} ${p(c2)} ${p(end)}`,
      `L${p(at(hip, k, bottom, nk, 0))}`,
      `L${p(hip)}`,
      `L${p(at(hip, t, -top, nt, 0))}Z`,
    ].join(''),
  };
}
export const add = (p: Point, length: number, angle: number): Point => ({
  // Ángulo desde la vertical hacia abajo; positivo = hacia la derecha.
  x: p.x + length * Math.sin(angle),
  y: p.y + length * Math.cos(angle),
});
export const deg = (d: number) => (d * Math.PI) / 180;
const smooth = (t: number) => t * t * (3 - 2 * t);
/** 0 → 1 entre `from` y `to` (suave), fijo fuera de ese tramo. */
const span = (p: number, from: number, to: number) =>
  smooth(Math.min(1, Math.max(0, (p - from) / (to - from))));
export const circle = (c: Point, r: number, ring?: number): Shape => ({
  kind: 'circle',
  cx: round(c.x),
  cy: round(c.y),
  r,
  ...(ring && { ring }),
});

/** Valor en `s` a partir de fotogramas clave [s, valor], con tramos suaves. */
export function keys(s: number, frames: [number, number][]): number {
  if (s <= frames[0][0]) return frames[0][1];
  for (let i = 1; i < frames.length; i++) {
    const [s1, v1] = frames[i];
    const [s0, v0] = frames[i - 1];
    if (s <= s1) return lerp(v0, v1, smooth((s - s0) / (s1 - s0)));
  }
  return frames[frames.length - 1][1];
}

/** El valor entre `lo` y `hi` donde `f` cambia de signo (por bisección). */
export function solve(
  f: (a: number) => number,
  lo: number,
  hi: number,
): number {
  for (let i = 0; i < 30; i++) {
    const a = (lo + hi) / 2;
    if (Math.sign(f(a)) === Math.sign(f(lo))) lo = a;
    else hi = a;
  }
  return (lo + hi) / 2;
}

/**
 * Codo de un brazo de dos segmentos (cinemática inversa): parte de la mano,
 * llega al hombro y dobla hacia el lado de `outward` (-1 izquierda, 1 derecha).
 */
function elbow(
  hand: Point,
  shoulder: Point,
  forearm: number,
  upperArm: number,
  outward: number,
): Point {
  const dx = shoulder.x - hand.x;
  const dy = shoulder.y - hand.y;
  const d = Math.min(Math.hypot(dx, dy), forearm + upperArm - 0.01);
  const base = Math.atan2(dy, dx);
  const bend = Math.acos(
    Math.min(1, (forearm ** 2 + d ** 2 - upperArm ** 2) / (2 * forearm * d)),
  );
  const options = [base + bend, base - bend].map((a) => ({
    x: hand.x + forearm * Math.cos(a),
    y: hand.y + forearm * Math.sin(a),
  }));
  return options[0].x * outward > options[1].x * outward
    ? options[0]
    : options[1];
}

/**
 * Codo que siempre dobla hacia el mismo lado de la línea muñeca → hombro
 * (`side` = signo del producto cruz). Cuando el hombro rodea la anilla (abajo
 * en el jalón, al lado en la transición, encima en el empuje), el codo gira con
 * él en vez de saltar al otro lado: abajo al jalar, abajo y atrás al empujar.
 */
export function elbowAround(
  hand: Point,
  shoulder: Point,
  forearm: number,
  upperArm: number,
  side: 1 | -1,
): Point {
  const a = elbow(hand, shoulder, forearm, upperArm, 1);
  const b = elbow(hand, shoulder, forearm, upperArm, -1);
  const cross = (e: Point) =>
    (shoulder.x - hand.x) * (e.y - hand.y) -
    (shoulder.y - hand.y) * (e.x - hand.x);
  return Math.sign(cross(a)) === side ? a : b;
}

// Proporciones atléticas, en unidades del viewBox (≈ 1 px a tamaño real).
export const body = {
  head: 8.5,
  neck: 6,
  shoulder: 15,
  waist: 10,
  hip: 9.5,
  torso: 50,
  upperArm: 27,
  forearm: 25,
  thigh: 38,
  shin: 37,
};

/** Dominadas: las articulaciones de frente para un esfuerzo `s`. */
function pullupJoints(s: number) {
  // Del colgado con brazos casi rectos a la barbilla sobre la barra: arriba,
  // los hombros quedan a ~4 de la barra y la barbilla la pasa.
  const sy = lerp(49, 3.8, s);
  const hands = [-31, 31].map((x) => ({ x, y: 0 }));
  const shoulders = [-1, 1].map((side) => ({
    x: side * body.shoulder,
    y: sy,
  }));
  const elbows = [-1, 1].map((side, i) =>
    elbow(hands[i], shoulders[i], body.forearm, body.upperArm, side),
  );
  const hipY = sy + body.torso - 2;
  // Al subir, las piernas se juntan y las rodillas se adelantan un poco: de
  // frente, la espinilla se ve más corta (escorzo).
  const spread = lerp(7, 6, s);
  const knees = [-1, 1].map((side) => ({
    x: side * spread,
    y: hipY + body.thigh - 2 * s,
  }));
  const ankles = [-1, 1].map((side, i) => ({
    x: side * (spread - 2),
    y: knees[i].y + lerp(body.shin, body.shin - 7, s),
  }));
  const neckTop = { x: 0, y: sy - body.neck };
  const head = { x: 0, y: neckTop.y - body.head + 1 };
  return { sy, hands, shoulders, elbows, hipY, knees, ankles, neckTop, head };
}

/** Dominadas de frente, colgado de una barra corta. */
const pullup: Rig = {
  viewBox: '-50 -21 100 205',
  play: 'scroll',
  reps: 3,
  // Sube (concéntrica) más rápido de lo que baja.
  tempo: 0.4,
  still: 1,
  fixed: [line({ x: -46, y: 0 }, { x: 46, y: 0 }, 5)],
  joints(s) {
    const j = pullupJoints(s);
    return {
      shoulder: j.shoulders[1],
      elbow: j.elbows[1],
      hand: j.hands[1],
      head: j.head,
      chin: { x: 0, y: j.head.y + body.head },
    };
  },
  pose(s) {
    const { sy, hands, shoulders, elbows, hipY, knees, ankles, neckTop, head } =
      pullupJoints(s);
    const t = (n: number) => round(n);
    const sh = body.shoulder;
    // Espalda en V: hombros anchos que bajan en curva hasta la cintura.
    const torso = [
      `M${t(-sh)} ${t(sy)}`,
      `Q0 ${t(sy - 4)} ${t(sh)} ${t(sy)}`,
      `Q${t(sh - 0.5)} ${t(sy + 17)} ${t(body.waist)} ${t(sy + 34)}`,
      `L${t(body.hip)} ${t(hipY)}`,
      `L${t(-body.hip)} ${t(hipY)}`,
      `L${t(-body.waist)} ${t(sy + 34)}`,
      `Q${t(-sh + 0.5)} ${t(sy + 17)} ${t(-sh)} ${t(sy)} Z`,
    ].join(' ');

    return [
      { kind: 'path', d: torso },
      line({ x: 0, y: sy }, neckTop, 7.5),
      circle(head, body.head),
      ...[0, 1].flatMap((i) => [
        circle({ x: shoulders[i].x * 0.92, y: sy + 2 }, 6.5),
        line(shoulders[i], elbows[i], 8.5),
        line(elbows[i], hands[i], 7),
        circle(hands[i], 3.8),
      ]),
      ...[0, 1].flatMap((i) => [
        line({ x: (i ? 1 : -1) * 5.5, y: hipY }, knees[i], 10.5),
        line(knees[i], ankles[i], 7.5),
        line(ankles[i], { x: ankles[i].x, y: ankles[i].y + 5 }, 5.5),
      ]),
    ];
  },
};

// Ella: más baja, hombros más estrechos y cadera más ancha.
const her = {
  head: 8,
  neck: 5.5,
  torso: 46,
  upperArm: 25,
  forearm: 23,
  thigh: 37,
  shin: 35,
};

/** Pistol squat: las articulaciones de perfil para un esfuerzo `s`. */
function pistolJoints(s: number) {
  const ankle = { x: 0, y: 0 };
  // La espinilla y el muslo bajan juntos: la rodilla pasa la punta del pie
  // y la cadera baja detrás del talón.
  const knee = add(ankle, her.shin, deg(180 - lerp(4, 40, s)));
  const hip = add(knee, her.thigh, deg(180 + lerp(4, 98, s)));
  // La pierna libre sube al frente, recta en el fondo.
  const freeKnee = add(hip, her.thigh, deg(lerp(35, 84, s)));
  const freeAnkle = add(freeKnee, her.shin, deg(lerp(15, 86, s)));
  // Brazos al frente para equilibrar; bajan un poco al subir.
  const arm = deg(lerp(70, 88, s));
  const upper = (lean: number) => {
    const shoulder = add(hip, her.torso, lean);
    const elbowPt = add(shoulder, her.upperArm, arm);
    return {
      shoulder,
      head: add(shoulder, her.neck + her.head - 1, lean),
      elbowPt,
      hand: add(elbowPt, her.forearm, arm + deg(5)),
    };
  };
  // La inclinación del tronco se calcula para que el centro de masa quede
  // sobre el centro del pie de apoyo (de -3 a 10).
  const balanced = (forward: number) => {
    const u = upper(deg(180 - forward));
    const parts: [Point, number][] = [
      [u.head, MASS.head],
      [mid(hip, u.shoulder), MASS.trunk],
      [along(u.shoulder, u.elbowPt, CENTER.upperArm), MASS.upperArm],
      [along(u.elbowPt, u.hand, CENTER.forearm), MASS.forearm],
      [along(hip, knee, CENTER.thigh), MASS.thigh / 2],
      [along(knee, ankle, CENTER.shin), MASS.shin / 2],
      [along(hip, freeKnee, CENTER.thigh), MASS.thigh / 2],
      [along(freeKnee, freeAnkle, CENTER.shin), MASS.shin / 2],
    ];
    return parts.reduce((x, [p, m]) => x + p.x * m, 0) - 3.5;
  };
  const { shoulder, head, elbowPt, hand } = upper(
    deg(180 - solve(balanced, -30, 80)),
  );
  return {
    ankle,
    knee,
    hip,
    freeKnee,
    freeAnkle,
    shoulder,
    head,
    elbowPt,
    hand,
  };
}

/** Pistol squat de perfil (mira a la derecha), sobre una pierna. */
const pistol: Rig = {
  viewBox: '-32 -146 108 154',
  play: 'scroll',
  reps: 2,
  // 0 → 1 es la bajada: la parte lenta.
  tempo: 0.6,
  still: 0.85,
  fixed: [line({ x: -28, y: 4.5 }, { x: 72, y: 4.5 }, 3)],
  joints(s) {
    const { elbowPt, ...j } = pistolJoints(s);
    return { ...j, elbow: elbowPt };
  },
  pose(s) {
    const {
      ankle,
      knee,
      hip,
      freeKnee,
      freeAnkle,
      shoulder,
      head,
      elbowPt,
      hand,
    } = pistolJoints(s);
    const tail = { x: head.x - 6, y: head.y - 3 };

    return [
      glute(shoulder, hip, knee),
      line(hip, shoulder, 15),
      line(shoulder, head, 6.5),
      circle(head, her.head),
      line(tail, { x: tail.x - 5, y: tail.y + 4 }, 5),
      line(
        { x: tail.x - 5, y: tail.y + 4 },
        { x: tail.x - 7, y: tail.y + 12 },
        3.5,
      ),
      line(shoulder, elbowPt, 7.5),
      line(elbowPt, hand, 6),
      line(hip, knee, 11),
      line(knee, ankle, 8),
      line({ x: -3, y: 0 }, { x: 10, y: 0 }, 5.5),
      line(hip, freeKnee, 10.5),
      line(freeKnee, freeAnkle, 7.5),
      line(freeAnkle, { x: freeAnkle.x + 4, y: freeAnkle.y - 5 }, 5),
    ];
  },
};

/** Salto: las articulaciones de frente para un avance `p`. */
function jumpJoints(p: number) {
  const air =
    p > 0.28 && p < 0.72 ? Math.sin(((p - 0.28) / 0.44) * Math.PI) : 0;
  const crouch = Math.max(
    span(p, 0.08, 0.26) * (1 - span(p, 0.26, 0.32)),
    span(p, 0.7, 0.78) * (1 - span(p, 0.84, 1)),
  );
  const reach = span(p, 0.2, 0.42) * (1 - span(p, 0.62, 0.9));
  const lift = air * 30;
  const legs = body.thigh + body.shin;
  const hipY = -lift - legs * (1 - 0.3 * crouch) - 4;
  const sy = hipY - body.torso + 2;
  const ankles = [-1, 1].map((side) => ({ x: side * 7, y: -lift - 4 }));
  const knees = [-1, 1].map((side, i) => ({
    x: side * (7 + 7 * crouch),
    y: (hipY + ankles[i].y) / 2 - 2 * crouch,
  }));
  const shoulders = [-1, 1].map((side) => ({
    x: side * body.shoulder,
    y: sy,
  }));
  // Brazos: de colgar a estirarse hacia arriba buscando la barra.
  const angle = deg(lerp(12, 168, reach));
  const elbows = [-1, 1].map((side, i) =>
    add(shoulders[i], body.upperArm, side * angle),
  );
  const hands = [-1, 1].map((side, i) =>
    add(elbows[i], body.forearm, side * (angle + deg(4))),
  );
  return { hipY, sy, ankles, knees, shoulders, elbows, hands };
}

/** 404: salta hacia una barra que no está (punteada) y vuelve al piso. */
const jump: Rig = {
  viewBox: '-75 -226 150 234',
  play: 'once',
  duration: 1800,
  still: 0.5,
  fixed: [
    line({ x: -40, y: -214 }, { x: 40, y: -214 }, 5, '2 9'),
    line({ x: -46, y: 4.5 }, { x: 46, y: 4.5 }, 3),
  ],
  joints(p) {
    const j = jumpJoints(p);
    return {
      shoulder: j.shoulders[1],
      elbow: j.elbows[1],
      hand: j.hands[1],
      hip: { x: 5.5, y: j.hipY },
      knee: j.knees[1],
      ankle: j.ankles[1],
    };
  },
  pose(p) {
    const { hipY, sy, ankles, knees, shoulders, elbows, hands } = jumpJoints(p);
    const neckTop = { x: 0, y: sy - body.neck };
    const t = (n: number) => round(n);
    const sh = body.shoulder;
    const torso = [
      `M${t(-sh)} ${t(sy)}`,
      `Q0 ${t(sy - 4)} ${t(sh)} ${t(sy)}`,
      `Q${t(sh - 0.5)} ${t(sy + 17)} ${t(body.waist)} ${t(sy + 34)}`,
      `L${t(body.hip)} ${t(hipY)}`,
      `L${t(-body.hip)} ${t(hipY)}`,
      `L${t(-body.waist)} ${t(sy + 34)}`,
      `Q${t(-sh + 0.5)} ${t(sy + 17)} ${t(-sh)} ${t(sy)} Z`,
    ].join(' ');

    return [
      { kind: 'path', d: torso },
      line({ x: 0, y: sy }, neckTop, 7.5),
      circle({ x: 0, y: neckTop.y - body.head + 1 }, body.head),
      ...[0, 1].flatMap((i) => [
        circle({ x: shoulders[i].x * 0.92, y: sy + 2 }, 6.5),
        line(shoulders[i], elbows[i], 8.5),
        line(elbows[i], hands[i], 7),
        circle(hands[i], 3.8),
      ]),
      ...[0, 1].flatMap((i) => [
        line({ x: (i ? 1 : -1) * 5.5, y: hipY }, knees[i], 10.5),
        line(knees[i], ankles[i], 7.5),
        line(
          ankles[i],
          { x: ankles[i].x + (i ? 4 : -4), y: ankles[i].y + 4 },
          5.5,
        ),
      ]),
    ];
  },
};

/** Fondos: las articulaciones de perfil para un esfuerzo `s`. */
function dipsJoints(s: number) {
  // 1. Soporte: brazos bloqueados, hombros abajo, lejos de las orejas
  //    (depresión escapular), y el cuerpo apenas inclinado al frente.
  // 2. Bajada: los codos se doblan hacia atrás, el tronco se inclina cada vez
  //    más y las piernas van un poco atrás, hasta que los hombros pasan por
  //    debajo de los codos.
  // 3. Empuje: el mismo camino de vuelta; el tronco se endereza al subir.
  // Lo único que no se elige a ojo es qué tan adelante van los hombros: se
  // calcula para que el centro de masa quede sobre las manos. Si bajara
  // vertical, el centro de masa quedaría detrás de las manos y caería atrás.
  const hand = { x: 0, y: 0 };
  const depth = lerp(-47.85, -17, s);
  const lean = deg(-lerp(6, 44, s));
  const legs = deg(-lerp(2, 14, s));
  const neck = her.neck + her.head - 1 + lerp(2, 0, s);
  const build = (x: number) => {
    const shoulder = { x, y: depth };
    const hip = add(shoulder, her.torso, lean);
    const knee = add(hip, her.thigh, legs);
    return {
      shoulder,
      elbowPt: elbow(hand, shoulder, her.forearm, her.upperArm, -1),
      hip,
      head: add(shoulder, neck, lean + Math.PI),
      knee,
      ankle: add(knee, her.shin, legs),
    };
  };
  const balanced = (x: number) => {
    const b = build(x);
    const parts: [Point, number][] = [
      [b.head, MASS.head],
      [mid(b.hip, b.shoulder), MASS.trunk],
      [along(b.shoulder, b.elbowPt, CENTER.upperArm), MASS.upperArm],
      [along(b.elbowPt, hand, CENTER.forearm), MASS.forearm],
      [along(b.hip, b.knee, CENTER.thigh), MASS.thigh],
      [along(b.knee, b.ankle, CENTER.shin), MASS.shin],
    ];
    return parts.reduce((sum, [p, m]) => sum + p.x * m, 0) - hand.x;
  };
  return { ...build(solve(balanced, -10, 40)), legs };
}

/**
 * Fondos en paralelas de perfil (ella), con la técnica correcta: piernas
 * estiradas hacia abajo y al frente en diagonal, puntas estiradas.
 */
const dips: Rig = {
  viewBox: '-54 -74 108 196',
  play: 'scroll',
  reps: 3,
  // 0 → 1 es la bajada: la parte lenta.
  tempo: 0.6,
  still: 0.85,
  fixed: [
    line({ x: -40, y: 0 }, { x: -40, y: 116 }, 4),
    line({ x: 40, y: 0 }, { x: 40, y: 116 }, 4),
    line({ x: -48, y: 0 }, { x: 48, y: 0 }, 5),
    line({ x: -50, y: 118.5 }, { x: 50, y: 118.5 }, 3),
  ],
  joints(s) {
    const { shoulder, elbowPt, hip, head, knee, ankle } = dipsJoints(s);
    const hand = { x: 0, y: 0 };
    return { shoulder, elbow: elbowPt, hand, hip, head, knee, ankle };
  },
  pose(s) {
    const { shoulder, elbowPt, hip, head, knee, ankle, legs } = dipsJoints(s);
    const hand = { x: 0, y: 0 };
    const tail = { x: head.x - 6, y: head.y - 3 };

    return [
      glute(shoulder, hip, knee),
      line(hip, shoulder, 14),
      line(shoulder, head, 6.5),
      circle(head, her.head),
      line(tail, { x: tail.x - 5, y: tail.y + 4 }, 5),
      line(
        { x: tail.x - 5, y: tail.y + 4 },
        { x: tail.x - 7, y: tail.y + 12 },
        3.5,
      ),
      line(hip, knee, 11),
      line(knee, ankle, 7.5),
      line(ankle, add(ankle, 5, legs + deg(8)), 4.5),
      ...arm(shoulder, elbowPt, hand, 7.5, 6),
      circle(hand, 3.5),
    ];
  },
};

/*
 * Muscle-up estricto en anillas, de perfil (él). Biomecánica (CrossFit, The
 * Barbell Physio, Rocha et al.):
 * - Agarre falso: la anilla va en la muñeca, no en los dedos, así que el
 *   antebrazo útil es más corto y la mano se dobla por encima de la anilla.
 * - Jalón (lento): la anilla baja hasta el pecho, por debajo de la axila, con
 *   los codos pegados a las costillas y el cuerpo inclinado ~28° atrás, en
 *   hueco (una línea de los hombros a los pies).
 * - Transición (rápida): el torso se inclina al frente lo justo para pasar
 *   sobre las anillas, que se quedan pegadas al pecho. Los codos no suben:
 *   siguen bajando y jalando las anillas hacia abajo mientras el cuerpo sube.
 * - Empuje continuo hasta bloquear los brazos, con el cuerpo vertical. Los
 *   hombros siempre van detrás o encima de la anilla, nunca delante, así que
 *   los codos apuntan abajo y atrás en todo el ascenso.
 * - Las anillas cuelgan de correas: en equilibrio, el centro de masa queda en
 *   la línea del anclaje a la anilla, así que la correa se inclina.
 */
const STRAP = 86;
const FALSE_GRIP_FOREARM = 21;

// Masa relativa de cada segmento (antropometría de Dempster, ambos lados).
// El antebrazo incluye la mano y la pierna, el pie.
export const MASS = {
  head: 0.08,
  trunk: 0.5,
  upperArm: 0.056,
  forearm: 0.044,
  thigh: 0.2,
  shin: 0.12,
};

/**
 * Dónde está el centro de masa de cada segmento, como fracción desde la
 * articulación más cercana al tronco (Dempster). La mano y el pie lo llevan
 * hacia la punta: no está a la mitad.
 */
export const CENTER = {
  upperArm: 0.436,
  forearm: 0.682,
  thigh: 0.433,
  shin: 0.606,
};

/** El punto a una fracción `t` del camino de `a` a `b`. */
export const along = (a: Point, b: Point, t: number): Point => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

function muscleupFrame(s: number): {
  body: Shape[];
  gear: Shape[];
  joints: Record<string, Point>;
} {
  // Esfuerzo → tiempo real: el jalón ocupa casi la mitad y la transición es
  // un tramo corto.
  const shoulderRel = {
    x: keys(s, [
      [0, -2],
      [0.4, -18],
      [0.52, -10],
      [0.64, -6],
      [0.82, -3],
      [1, -1],
    ]),
    // Colgado muerto y bloqueo a 48 de la muñeca (el brazo recto, con el
    // antebrazo corto del agarre falso); en medio, nunca a menos de ~16.
    y: keys(s, [
      [0, 47.9],
      [0.4, -5],
      [0.52, -15],
      [0.64, -24],
      [0.82, -36],
      [1, -47.98],
    ]),
  };
  // Ángulo del tronco y de las piernas respecto a la vertical (+ = la parte de
  // abajo va al frente): atrás en el jalón, al frente en la transición y
  // vertical al bloquear.
  const lean = deg(
    keys(s, [
      [0, 4],
      [0.4, 28],
      [0.52, -18],
      [0.64, -20],
      [0.82, -12],
      [1, -5],
    ]),
  );
  const legs = deg(
    keys(s, [
      [0, 8],
      [0.4, 33],
      [0.52, 18],
      [0.64, 12],
      [0.82, 6],
      [1, 0],
    ]),
  );

  // Pose relativa a la muñeca (que va en la anilla).
  const wrist = { x: 0, y: 0 };
  const shoulder = shoulderRel;
  const elbowPt = elbowAround(
    wrist,
    shoulder,
    FALSE_GRIP_FOREARM,
    body.upperArm,
    -1,
  );
  const hip = add(shoulder, body.torso, lean);
  const head = add(shoulder, body.neck + body.head - 1, lean + Math.PI);
  const knee = add(hip, body.thigh, legs);
  const ankle = add(knee, body.shin, legs);
  const parts: [Point, number][] = [
    [head, MASS.head],
    [mid(shoulder, hip), MASS.trunk],
    [along(shoulder, elbowPt, CENTER.upperArm), MASS.upperArm],
    [along(elbowPt, wrist, CENTER.forearm), MASS.forearm],
    [along(hip, knee, CENTER.thigh), MASS.thigh],
    [along(knee, ankle, CENTER.shin), MASS.shin],
  ];
  const com = parts.reduce(
    (acc, [p, m]) => ({ x: acc.x + p.x * m, y: acc.y + p.y * m }),
    { x: 0, y: 0 },
  );
  // La correa apunta hacia el centro de masa (equilibrio de un péndulo).
  const strap = Math.max(
    -0.26,
    Math.min(0.26, Math.atan2(com.x, Math.max(com.y, 4))),
  );
  const anchor = { x: 0, y: -STRAP };
  const ring = add(anchor, STRAP, strap);
  const at = (p: Point) => ({ x: p.x + ring.x, y: p.y + ring.y });

  // Agarre falso: la mano se dobla por encima y al frente de la anilla.
  const hand = at({ x: 3, y: -4 });
  return {
    joints: {
      shoulder: at(shoulder),
      elbow: at(elbowPt),
      hand: at(wrist),
      hip: at(hip),
      knee: at(knee),
      ankle: at(ankle),
      head: at(head),
    },
    gear: [
      line(anchor, add(anchor, STRAP - 6.5, strap), 2.5),
      circle(ring, 6.5, 2.5),
    ],
    body: [
      line(at(hip), at(shoulder), 16),
      line(at(shoulder), at(head), 7.5),
      circle(at(head), body.head),
      line(at(hip), at(knee), 11.5),
      line(at(knee), at(ankle), 8),
      line(at(ankle), add(at(ankle), 6, legs + deg(30)), 5),
      ...arm(at(shoulder), at(elbowPt), at(wrist), 8.5, 7),
      circle(hand, 3.6),
    ],
  };
}

/** Muscle-up en anillas de perfil (él): jalón, transición y empuje. */
const muscleup: Rig = {
  viewBox: '-58 -92 138 276',
  play: 'scroll',
  reps: 2,
  // Sube más rápido de lo que baja.
  tempo: 0.45,
  still: 0.6,
  fixed: [],
  gear: (s) => muscleupFrame(s).gear,
  pose: (s) => muscleupFrame(s).body,
  joints: (s) => muscleupFrame(s).joints,
};

export const athletes: Record<Exercise, Rig> = {
  pullup,
  pistol,
  jump,
  dips,
  muscleup,
};
