// Poses de los atletas de gis (DESIGN.md · Atletas de gis). Solo matemática,
// sin DOM: Astro la usa para dibujar la pose fija (sin JS o con movimiento
// reducido) y el navegador para animar cada repetición con el scroll.
//
// Cada ejercicio devuelve siempre las mismas figuras en el mismo orden, para
// que el navegador solo actualice sus atributos.

export type Exercise = 'pullup';

export type Shape =
  | { kind: 'line'; x1: number; y1: number; x2: number; y2: number; w: number }
  | { kind: 'circle'; cx: number; cy: number; r: number }
  | { kind: 'path'; d: string };

export interface Rig {
  viewBox: string;
  /** Repeticiones mientras el atleta cruza la pantalla. */
  reps: number;
  /** Esfuerzo de la pose fija (0 = inicio, 1 = punto más alto). */
  still: number;
  /** Lo que no se mueve (la barra), en acero. */
  fixed: Shape[];
  /** El cuerpo para un esfuerzo `s` entre 0 y 1. */
  pose: (s: number) => Shape[];
}

type Point = { x: number; y: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const round = (n: number) => Math.round(n * 10) / 10;
const line = (a: Point, b: Point, w: number): Shape => ({
  kind: 'line',
  x1: round(a.x),
  y1: round(a.y),
  x2: round(b.x),
  y2: round(b.y),
  w,
});
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

export const athletes: Record<Exercise, Rig> = { pullup };
