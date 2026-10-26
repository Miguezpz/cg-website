// Poses de los atletas de gis (DESIGN.md · Atletas de gis). Solo matemática,
// sin DOM: Astro la usa para dibujar la pose fija (sin JS o con movimiento
// reducido) y el navegador para animarlas: con el scroll o una sola vez.
//
// Cada ejercicio devuelve siempre las mismas figuras en el mismo orden, para
// que el navegador solo actualice sus atributos.

export type Exercise = 'pullup' | 'pistol' | 'jump';

export type Shape =
  | {
      kind: 'line';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      w: number;
      dash?: string;
    }
  | { kind: 'circle'; cx: number; cy: number; r: number }
  | { kind: 'path'; d: string };

export type Rig = {
  viewBox: string;
  /** Valor de `pose` para la pose fija (sin JS o con movimiento reducido). */
  still: number;
  /** Lo que no se mueve (la barra, el piso), en acero. */
  fixed: Shape[];
  /**
   * El cuerpo. Con `scroll`, `s` es el esfuerzo de una repetición (0 = inicio,
   * 1 = punto más alto). Con `once`, el avance del movimiento completo.
   */
  pose: (s: number) => Shape[];
} & (
  | {
      /** Repeticiones mientras el atleta cruza la pantalla. */
      play: 'scroll';
      reps: number;
    }
  | {
      /** Una sola vez al aparecer (páginas sin scroll), en `duration` ms. */
      play: 'once';
      duration: number;
    }
);

type Point = { x: number; y: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const round = (n: number) => Math.round(n * 10) / 10;
const line = (a: Point, b: Point, w: number, dash?: string): Shape => ({
  kind: 'line',
  x1: round(a.x),
  y1: round(a.y),
  x2: round(b.x),
  y2: round(b.y),
  w,
  ...(dash && { dash }),
});
const add = (p: Point, length: number, angle: number): Point => ({
  // Ángulo desde la vertical hacia abajo; positivo = hacia la derecha.
  x: p.x + length * Math.sin(angle),
  y: p.y + length * Math.cos(angle),
});
const deg = (d: number) => (d * Math.PI) / 180;
const smooth = (t: number) => t * t * (3 - 2 * t);
/** 0 → 1 entre `from` y `to` (suave), fijo fuera de ese tramo. */
const span = (p: number, from: number, to: number) =>
  smooth(Math.min(1, Math.max(0, (p - from) / (to - from))));
const circle = (c: Point, r: number): Shape => ({
  kind: 'circle',
  cx: round(c.x),
  cy: round(c.y),
  r,
});

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

// Proporciones atléticas, en unidades del viewBox (≈ 1 px a tamaño real).
const body = {
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

/** Dominadas de frente, colgado de una barra corta. */
const pullup: Rig = {
  viewBox: '-50 -18 100 202',
  play: 'scroll',
  reps: 3,
  still: 1,
  fixed: [line({ x: -46, y: 0 }, { x: 46, y: 0 }, 5)],
  pose(s) {
    // Del colgado con brazos casi rectos a la barbilla sobre la barra.
    const sy = lerp(49, 8, s);
    const hands = [-30, 30].map((x) => ({ x, y: 0 }));
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

/** Pistol squat de perfil (mira a la derecha), sobre una pierna. */
const pistol: Rig = {
  viewBox: '-32 -146 108 154',
  play: 'scroll',
  reps: 2,
  still: 0.85,
  fixed: [line({ x: -28, y: 4.5 }, { x: 72, y: 4.5 }, 3)],
  pose(s) {
    const ankle = { x: 0, y: 0 };
    // Espinilla, muslo y tronco se inclinan juntos para no perder el
    // equilibrio: la cadera baja detrás del talón y el pecho va al frente.
    const knee = add(ankle, her.shin, deg(180 - lerp(4, 40, s)));
    const hip = add(knee, her.thigh, deg(180 + lerp(4, 98, s)));
    const lean = deg(180 - lerp(4, 48, s));
    const shoulder = add(hip, her.torso, lean);
    const head = add(shoulder, her.neck + her.head - 1, lean);
    // Brazos al frente para equilibrar; bajan un poco al subir.
    const arm = deg(lerp(70, 88, s));
    const elbowPt = add(shoulder, her.upperArm, arm);
    const hand = add(elbowPt, her.forearm, arm + deg(5));
    // La pierna libre sube al frente, recta en el fondo.
    const freeKnee = add(hip, her.thigh, deg(lerp(35, 84, s)));
    const freeAnkle = add(freeKnee, her.shin, deg(lerp(15, 86, s)));
    const tail = { x: head.x - 6, y: head.y - 3 };

    return [
      circle(add(hip, 3, deg(-90)), 8),
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

/** 404: salta hacia una barra que no está (punteada) y vuelve al piso. */
const jump: Rig = {
  viewBox: '-50 -226 100 234',
  play: 'once',
  duration: 1800,
  still: 0.5,
  fixed: [
    line({ x: -40, y: -214 }, { x: 40, y: -214 }, 5, '2 9'),
    line({ x: -46, y: 4.5 }, { x: 46, y: 4.5 }, 3),
  ],
  pose(p) {
    // Se agacha, salta con los brazos arriba, no hay barra, cae y se levanta.
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

export const athletes: Record<Exercise, Rig> = { pullup, pistol, jump };
