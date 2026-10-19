# Tablero 3D y partida jugable contra la máquina

**Estado:** Verificada
**Requisitos que cierra:** M-01, M-02, M-03, M-04, M-05, M-06, M-07, M-08, M-09
**Fecha de acuerdo:** 2026-10-19

## Qué se construye

El primer prototipo jugable de principio a fin. Se abre la web, se pulsa "Jugar" y aparece el
tablero rojo con las 24 fichas de pie, visto desde unos 45°. Tu personaje secreto está en la
ranura delantera con marco amarillo, y arriba hay una ficha azul con el número de fichas que le
quedan al rival.

En tu turno eliges una pregunta de la lista y ves la respuesta. Las fichas que no encajan se marcan
en amarillo; puedes ajustar a mano cuáles marcar y, al pulsar "Bajar fichas", caen hacia atrás en
cascada. Luego pregunta la máquina: ves su pregunta, el juego responde por ti y el contador del
rival baja. En cualquier momento puedes bajar o levantar una ficha pulsándola. Cuando quieras,
"Adivinar": eliges a quién, confirmas y la partida termina con los dos secretos boca arriba y un
botón para jugar otra.

Junta en una sola feature el "Tablero 3D" y la "Partida jugable" del roadmap: por separado, el
tablero no se podría probar con una partida de verdad (M-04 necesita preguntas y respuestas), y lo
que queremos es tener cuanto antes un prototipo para revisar la vista a ojo.

Cierra la parte visible de los requisitos cuyo motor ya se hizo en `andamiaje-y-motor` (M-02,
M-03, M-06, M-08, M-09) y los que son solo de interfaz (M-01, M-04, M-05, M-07).

## Decisiones tomadas

- **La interfaz solo lee `playerView()`** y manda acciones al motor; nunca toca el estado de la
  máquina directamente. Es el mismo contrato que tendrá el nivel 2.
- **3D con CSS** según `docs/design-system.md`: tablero plano con `rotateX(45deg)` y perspectiva,
  fichas con bisagra en el borde inferior que caen a `rotateX(-82deg)` en cascada de 40 ms. Con
  `prefers-reduced-motion`, fundido en lugar de caída. Los valores son el punto de partida; se
  ajustan a ojo con el prototipo.
- **Cada ficha es un botón** con el nombre del personaje y `aria-pressed` según esté bajada, así se
  puede jugar con teclado y los tests no dependen de la animación.
- **La máquina tarda unos 1,2 s en jugar** ("El rival está pensando…") para que se entienda el
  cambio de turno. Solo modo fácil; la dificultad (S-01) es fase 2, así que no hay selector.
- **Semilla:** cada partida usa una semilla aleatoria del navegador. Con `?semilla=<número>` en la
  URL se fija, para que los E2E sepan qué personajes tocan.
- **En móvil** el tablero se queda en 6×4 si las fichas miden al menos 48 px de ancho; si no, pasa a
  4×6, como dice el design system. La lista de preguntas va debajo del tablero en móvil y al lado
  en escritorio.
- **Salir a mitad de partida** pide confirmación al navegador (`beforeunload`).
- **Fuera del juego, el enlace a créditos** sigue en la pantalla de inicio.
- **Ajustes tras ver el prototipo en el navegador:** el móvil se queda en 6×4 (en 4×6 el tablero
  ocupaba toda la pantalla y las preguntas quedaban muy abajo); se recupera con margen negativo el
  hueco que deja la inclinación arriba; la ficha bajada queda tumbada hacia atrás y oscurecida.
- **Pendiente para la revisión visual:** en móvil, el nombre de la placa es demasiado pequeño para
  leerse a ese ángulo (la foto sí identifica a cada uno). Anotado en `mejoras/backlog.md`.
- **Los E2E entran en CI** en un job propio con Chromium.

## Cobertura

| Requisito | Se implementa en | Se valida con |
|-----------|------------------|---------------|
| M-01 | `src/ui/board/` (tablero 6×4 con foto y nombre) | `tests/e2e/partida.spec.ts` |
| M-02 | `src/ui/hud/SecretCard.tsx` | `tests/e2e/partida.spec.ts` |
| M-03 | `src/ui/hud/QuestionList.tsx` | `tests/e2e/partida.spec.ts` |
| M-04 | `src/ui/board/` (marcado y caída) y `src/ui/screens/Partida.tsx` | `tests/e2e/partida.spec.ts` |
| M-05 | `src/ui/board/Tile.tsx` | `tests/e2e/partida.spec.ts` |
| M-06 | `src/ui/screens/Partida.tsx` (turno de la máquina) | `tests/e2e/partida.spec.ts` |
| M-07 | `src/ui/hud/RivalCounter.tsx` | `tests/e2e/partida.spec.ts` |
| M-08 | `src/ui/hud/GuessDialog.tsx` | `tests/e2e/partida.spec.ts` |
| M-09 | `src/ui/screens/FinPartida.tsx` | `tests/e2e/partida.spec.ts` |

## Fuera de esta feature

- Dificultad "Difícil" (S-01), historial de preguntas (S-03), ficha de personaje (S-04), girar el
  tablero en escritorio (S-05), sonido (C-04) y elegir color (C-05).
- WebKit en los E2E: se añade aquí solo si el usuario lo pide; sigue en Chromium escritorio y móvil.
- Revisión estética fina del plástico y la cámara: se hace a ojo sobre este prototipo, en una
  pasada aparte.
