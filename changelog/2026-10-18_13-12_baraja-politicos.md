# Baraja de políticos de España y validador de equilibrio

**Fecha:** 2026-10-18 13:12
**Tipo:** Feature
**Requisitos:** M-10

## Qué se hizo
- Baraja `politicos-es` (versión 1.0.0, datos a 2026-10-16): 24 políticos equilibrados por sexo y
  bloque, 12 preguntas de sí/no en tono neutral, y al menos dos fuentes por personaje.
- Validador `pnpm validar-baraja` para cualquier baraja de `src/decks/`. Comprueba el esquema, que
  haya 24 personajes, que cada pregunta deje entre 8 y 16 "sí", que los repartos principales
  queden entre 10 y 14, que no haya personajes indistinguibles y las fuentes. Ahora también corre
  en CI.
- Se quitó el tono humor de las preguntas (M-12 sale del PRD, decisión del usuario) del esquema,
  la baraja y el motor.
- Ada Colau sustituye a Ione Belarra, que tenía las mismas respuestas que Irene Montero.
- Se sustituyeron dos preguntas compuestas ("presidente autonómico o alcalde" y "PSOE (o PSC) o
  PP") por preguntas simples equilibradas.

## Qué se modificó
- Nuevos: `src/decks/politicos-es/` (`deck.json`, `index.ts`, `deck.test.ts`),
  `src/decks/validate.ts`, `src/decks/validate.test.ts`, `scripts/validar-baraja.ts`.
- Modificados: `src/decks/schema.ts` (`sources`, `core`, `photo` opcional, `text` simple),
  `src/engine/` (sin `tone`), `src/engine/test-deck.ts`, `src/decks/schema.test.ts`,
  `tsconfig.json`, `package.json`, `.github/workflows/tests.yml`.
- Documentación: `docs/prd.md`, `docs/data-model.md`, `docs/user-flows.md`,
  `docs/design-system.md`, `docs/architecture.md`, `docs/roadmap.md`, `docs/testing.md`,
  `docs/features/baraja-politicos.md` (Verificada), `README.md`, `CLAUDE.md`.

## Por qué
Tercer paso de la fase 1. Sin una baraja equilibrada y con datos fiables, el juego no funciona: una
pregunta que solo cumplen tres personajes, o un dato mal puesto, rompe la partida.
