#!/usr/bin/env node
/**
 * Prepara las fotos de los personajes de cada baraja (M-11):
 *   1. Descarga el original de Wikimedia Commons (`photo.original`) a `fotos-originales/<baraja>/`.
 *   2. Quita el fondo con rembg (scripts/quitar-fondo.py, entorno `.venv-fotos/`).
 *   3. Recorta en 3:4 con los ojos en el mismo sitio (`photo.crop`), pone el fondo uniforme del
 *      design system, corrige un poco la luz y exporta WebP a 600×800 y 300×400 en
 *      `public/fotos/<baraja>/`.
 *
 * Uso:  pnpm procesar-fotos [id-personaje …]   (sin ids, procesa todos)
 * Los pasos 1 y 2 se saltan si el archivo ya existe; el 3 se repite siempre.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { deckSchema } from '../src/decks/schema.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PYTHON = join(ROOT, '.venv-fotos', 'bin', 'python');
const BACKDROP = '#D6DCE1';
/** Posición de los ojos en la foto final, en fracción del ancho y del alto. */
const EYES = { x: 0.5, y: 0.4 };
const SIZES = [600, 300] as const;
const USER_AGENT = 'quien-es-quien/0.1 (https://github.com/polmarza/quien-es-quien)';

const only = new Set(process.argv.slice(2));

async function download(url: string, to: string) {
  if (existsSync(to)) return;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`No se pudo descargar ${url}: HTTP ${res.status}`);
  writeFileSync(to, Buffer.from(await res.arrayBuffer()));
}

function removeBackground(from: string, to: string) {
  if (existsSync(to)) return;
  if (!existsSync(PYTHON)) {
    throw new Error('Falta el entorno .venv-fotos con rembg (ver docs/architecture.md, "Procesado de fotos")');
  }
  execFileSync(PYTHON, ['-I', join(ROOT, 'scripts', 'quitar-fondo.py'), from, to], { stdio: 'inherit' });
}

/** Viñeteado muy suave sobre el fondo uniforme. */
function backdrop(width: number, height: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs><radialGradient id="v" cx="50%" cy="40%" r="75%">
      <stop offset="60%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.12"/>
    </radialGradient></defs>
    <rect width="100%" height="100%" fill="${BACKDROP}"/>
    <rect width="100%" height="100%" fill="url(#v)"/>
  </svg>`;
  return Buffer.from(svg);
}

async function processOne(cutout: string, crop: { eyeX: number; eyeY: number; scale: number }, outDir: string, file: string) {
  const image = sharp(cutout);
  const { width = 0, height = 0 } = await image.metadata();
  // `scale` es el alto del recorte como fracción del alto del original.
  const cropH = Math.round(height * crop.scale);
  const cropW = Math.round(cropH * 0.75);
  const left = Math.round(width * crop.eyeX - cropW * EYES.x);
  const top = Math.round(height * crop.eyeY - cropH * EYES.y);

  // El recorte puede salirse del original (por ejemplo, por debajo de los hombros): se rellena
  // con transparencia y luego queda el fondo uniforme.
  const extend = {
    left: Math.max(0, -left),
    top: Math.max(0, -top),
    right: Math.max(0, left + cropW - width),
    bottom: Math.max(0, top + cropH - height),
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  };
  const person = await sharp(cutout)
    .extend(extend)
    .extract({ left: Math.max(0, left), top: Math.max(0, top), width: cropW, height: cropH })
    .resize(SIZES[0], Math.round(SIZES[0] / 0.75))
    .normalise({ lower: 1, upper: 99 })
    .png()
    .toBuffer();

  const composed = await sharp(backdrop(SIZES[0], SIZES[0] / 0.75))
    .composite([{ input: person }])
    .png()
    .toBuffer();

  for (const size of SIZES) {
    mkdirSync(join(outDir, String(size)), { recursive: true });
    await sharp(composed)
      .resize(size, Math.round(size / 0.75))
      .webp({ quality: 82 })
      .toFile(join(outDir, String(size), file));
  }
}

async function main() {
  const decksDir = join(ROOT, 'src', 'decks');
  const decks = readdirSync(decksDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(decksDir, d.name, 'deck.json')))
    .map((d) => deckSchema.parse(JSON.parse(readFileSync(join(decksDir, d.name, 'deck.json'), 'utf8'))));

  for (const deck of decks) {
    const originals = join(ROOT, 'fotos-originales', deck.id);
    const outDir = join(ROOT, 'public', 'fotos', deck.id);
    mkdirSync(originals, { recursive: true });

    for (const c of deck.characters) {
      if (!c.photo || (only.size > 0 && !only.has(c.id))) continue;
      const ext = new URL(c.photo.original).pathname.split('.').pop()?.toLowerCase() ?? 'jpg';
      const original = join(originals, `${c.id}.${ext}`);
      const cutout = join(originals, `${c.id}.sin-fondo.png`);
      await download(c.photo.original, original);
      removeBackground(original, cutout);
      await processOne(cutout, c.photo.crop, outDir, c.photo.file);
      console.log(`  ${deck.id}/${c.id}`);
    }
  }
}

await main();
