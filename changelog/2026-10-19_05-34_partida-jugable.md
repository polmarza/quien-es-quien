# Tablero 3D y partida jugable contra la máquina

**Fecha:** 2026-10-19 05:34
**Tipo:** Feature
**Requisitos:** M-01, M-02, M-03, M-04, M-05, M-06, M-07, M-08, M-09

## Qué se hizo
- Primer prototipo jugable de principio a fin. El tablero rojo se ve a 45° con las 24 fichas con
  bisagra, la carta secreta va en la ranura delantera y el rival es una ficha azul con su contador.
- Se puede preguntar con respuesta "✓ Sí" / "✗ No". Las fichas que no encajan se marcan, se
  pueden ajustar y caen en cascada al confirmar. Cualquier ficha se baja o se levanta a mano.
- La máquina juega con una pausa de 1,2 s. Al adivinar hay confirmación, y la pantalla final
  muestra los dos secretos y el botón "Jugar otra".
- `?semilla=` fija la partida para los tests. Salir a mitad de partida pide confirmación.
- 14 E2E nuevos (7 en escritorio y 7 en móvil), y los E2E entran en CI.

## Qué se modificó
- Nuevos: `src/ui/game/useGame.ts`, `src/ui/board/` (Board, Tile y su CSS), `src/ui/hud/`
  (SecretCard, RivalCounter, QuestionList, Answer, GuessDialog), `src/ui/screens/Partida.tsx`,
  `FinPartida.tsx` y su CSS, `tests/e2e/partida.spec.ts`, `.claude/launch.json`.
- Modificados: `src/ui/App.tsx` (pantalla de inicio con "Jugar") y `.github/workflows/tests.yml`
  (job de E2E).
- Documentación: `docs/design-system.md` (móvil en 6×4, caída y componentes), `docs/architecture.md`,
  `docs/testing.md`, `docs/roadmap.md`, `docs/features/partida-jugable.md` (Verificada),
  `mejoras/backlog.md`, `README.md` y `CLAUDE.md`.

## Por qué
Cierra los requisitos MUST de la fase 1 salvo M-10 y M-11, que ya estaban cerrados. Con esto
hay un prototipo para revisar a ojo la vista y la sensación del juego.
