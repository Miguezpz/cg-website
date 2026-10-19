// Falla si queda contenido provisional marcado con [[PENDIENTE]] (spec §8, T4.6).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MARKER = '[[PENDIENTE]]';
const ROOTS = ['src', 'public'];
const TEXT_FILE = /\.(astro|ts|js|mjs|css|json|md|txt|html|svg|xml)$/;

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const hits = ROOTS.flatMap(walk)
  .filter((file) => TEXT_FILE.test(file))
  .flatMap((file) =>
    readFileSync(file, 'utf8')
      .split('\n')
      .flatMap((line, i) =>
        line.includes(MARKER) ? [`${file}:${i + 1}`] : [],
      ),
  );

if (hits.length > 0) {
  console.error(`✖ ${hits.length} ${MARKER} pendiente(s):\n${hits.join('\n')}`);
  process.exit(1);
}
console.log(`✔ Sin ${MARKER}.`);
