// Generador pseudoaleatorio con semilla (mulberry32). El estado es un entero de 32 bits que vive
// dentro del GameState, así la misma semilla reproduce la misma partida entera.

export interface Draw<T> {
  value: T;
  rng: number;
}

/** Número en [0, 1) y el siguiente estado del generador. */
export function nextFloat(rng: number): Draw<number> {
  const next = (rng + 0x6d2b79f5) | 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, rng: next };
}

/** Elemento al azar de una lista no vacía. */
export function pick<T>(rng: number, items: readonly T[]): Draw<T> {
  if (items.length === 0) throw new Error('pick() con una lista vacía');
  const { value, rng: next } = nextFloat(rng);
  return { value: items[Math.floor(value * items.length)] as T, rng: next };
}

/** Convierte cualquier semilla numérica en un estado inicial de 32 bits. */
export function seedToRng(seed: number): number {
  return Math.trunc(seed) | 0;
}
