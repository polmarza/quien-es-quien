# Fotos de los personajes y página de créditos

**Fecha:** 2026-10-19 00:39
**Tipo:** Feature
**Requisitos:** M-11

## Qué se hizo
- 24 fotos de Wikimedia Commons con licencia libre (CC0, CC BY, CC BY-SA, dominio público o
  "Attribution"), procesadas con el mismo aspecto: busto 3:4, ojos a la misma altura, fondo
  uniforme `#D6DCE1` y luz corregida. Se exportan en WebP a 600×800 y 300×400 en `public/fotos/`.
- `pnpm procesar-fotos`: descarga los originales, quita el fondo con `rembg` (dejando solo la
  silueta principal), recorta con `photo.crop` y exporta. `scripts/detectar-ojos.py` propone el
  recorte con OpenCV.
- Página `/creditos` con la foto, el autor, la licencia, el enlace al original y las modificaciones
  hechas.
- `photo` vuelve a ser obligatorio. El validador comprueba las licencias admitidas y, desde el
  script, que existan las fotos procesadas.
- PRD: S-04 (ficha de cada personaje) se amplía con foto, partido y un texto que responde a todas
  las preguntas, a propuesta del usuario.

## Qué se modificó
- Nuevos: `scripts/procesar-fotos.ts`, `scripts/quitar-fondo.py`, `scripts/detectar-ojos.py`,
  `src/ui/screens/Creditos.tsx` y su CSS, `tests/e2e/creditos.spec.ts`, `public/fotos/politicos-es/`.
- Modificados: `src/decks/politicos-es/deck.json` (créditos y recorte de cada foto),
  `src/decks/schema.ts`, `src/decks/validate.ts` y sus tests, `scripts/validar-baraja.ts`,
  `src/ui/App.tsx`, `package.json` (sharp), `.gitignore`.
- Documentación: `docs/prd.md`, `docs/data-model.md`, `docs/architecture.md`, `docs/roadmap.md`,
  `docs/features/fotos-y-creditos.md` (Verificada), `README.md`, `CLAUDE.md`.

## Por qué
Cuarto paso de la fase 1. El juego es fotorrealista: cada ficha necesita una foto real,
homogénea con las demás y con su crédito, como exigen las licencias.
