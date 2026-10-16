# Andamiaje del proyecto y motor del juego

**Fecha:** 2026-10-16 16:13
**Tipo:** Feature
**Requisitos:** M-02, M-03, M-06, M-08, M-09 (parte de reglas; la parte visible se cierra con la feature del tablero)

## Qué se hizo
- Proyecto Vite + React + TypeScript estricto con Vitest, Playwright, fuentes autoalojadas, tokens
  del design system como variables CSS y `wrangler.jsonc` para Cloudflare Workers (sin desplegar).
- Motor del juego en `src/engine/`, sin interfaz: partida con semilla, reparto de secretos
  distintos, sorteo de quién empieza, preguntar con respuesta veraz, fichas que no encajan, bajar y
  levantar fichas, adivinar, fin de partida y `playerView()`, que oculta el secreto del rival hasta
  el final.
- La máquina en modo fácil: pregunta al azar sin repetir, baja sus fichas y adivina cuando le queda
  una (o al azar si se queda sin preguntas).
- Esquema Zod de las barajas y una baraja de prueba de 8 personajes para los tests.
- 34 tests unitarios y un test E2E de arranque.
- Workflow `.github/workflows/tests.yml`: tipos, build y tests unitarios en cada PR y push a main.

## Qué se modificó
- Nuevos: `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.json`,
  `vite.config.ts`, `playwright.config.ts`, `wrangler.jsonc`, `index.html`, `src/**`,
  `tests/e2e/arranque.spec.ts`, `.github/workflows/tests.yml`.
- Actualizados: `docs/features/andamiaje-y-motor.md` (Verificada), `docs/architecture.md`,
  `docs/testing.md`, `docs/roadmap.md`, `README.md`, `CLAUDE.md`.

## Por qué
Primeros dos pasos de la fase 1 del roadmap. El motor va separado de la interfaz para que el
servidor del nivel 2 arbitre con las mismas reglas.
