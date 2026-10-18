#!/usr/bin/env node
/**
 * Valida todas las barajas de `src/decks/<id>/deck.json` (M-10): esquema, equilibrio de cada
 * pregunta, repartos principales y personajes indistinguibles.
 *
 * Uso:  pnpm validar-baraja
 * Sale con código 1 si alguna baraja tiene errores. Los avisos no rompen la ejecución.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateDeck } from '../src/decks/validate.ts';

const DECKS = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'src', 'decks');

const ids = readdirSync(DECKS, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(DECKS, d.name, 'deck.json')))
  .map((d) => d.name)
  .sort();

if (ids.length === 0) {
  console.log('No hay barajas en src/decks/: nada que validar.');
  process.exit(0);
}

let failed = false;
for (const id of ids) {
  const report = validateDeck(JSON.parse(readFileSync(join(DECKS, id, 'deck.json'), 'utf8')));
  console.log(`\nBaraja ${id}`);
  for (const [question, n] of Object.entries(report.counts)) console.log(`  ${String(n).padStart(2)} sí  ${question}`);
  for (const w of report.warnings) console.log(`  AVISO  ${w}`);
  for (const e of report.errors) console.log(`  ERROR  ${e}`);
  if (report.errors.length > 0) failed = true;
  console.log(report.errors.length === 0 ? '  Sin errores.' : `  ${report.errors.length} error(es).`);
}

process.exit(failed ? 1 : 0);
