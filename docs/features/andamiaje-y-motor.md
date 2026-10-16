# Andamiaje y motor del juego

**Estado:** Verificada
**Requisitos que cierra:** M-02, M-03, M-06, M-08, M-09
**Fecha de acuerdo:** 2026-10-16

## Qué se construye

El proyecto pasa a tener código: Vite + React + TypeScript estricto, Vitest y Playwright
configurados, los tokens del design system como variables CSS, `wrangler.jsonc` preparado (sin
desplegar) y los scripts de `package.json` que declara `docs/testing.md`. `pnpm dev` abre una
página mínima que solo confirma que todo arranca; el tablero llega en otra feature.

Encima de eso, el motor del juego en `src/engine/`, en TypeScript puro y sin interfaz: crea una
partida a partir de una baraja y una semilla, reparte los personajes secretos, lleva los turnos,
responde preguntas, calcula qué fichas no encajan con una respuesta, permite bajar y levantar
fichas, resuelve el intento de adivinar y declara el ganador. Incluye la máquina en modo fácil:
elige al azar una pregunta que no haya hecho, baja sus fichas y adivina cuando le queda una.

Esta feature cierra la **parte de reglas** de los requisitos de la tabla: que el reparto, las
respuestas, los turnos, el adivinar y el final funcionan como dice el PRD. Lo que el jugador ve en
pantalla de esos mismos requisitos lo valida la feature del tablero y la partida jugable, que
volverá a listarlos con sus tests E2E.

## Decisiones tomadas

- El motor es funcional: cada acción recibe un estado y devuelve uno nuevo, sin mutarlo. Así es
  fácil de testear y de reutilizar en el Durable Object del nivel 2.
- Todo el azar sale de un generador con semilla dentro del motor; con la misma semilla, la misma
  partida.
- El motor se prueba con una baraja de prueba pequeña en los tests (`src/engine/test-deck.ts`), no
  con la de políticos: la baraja real llega en su propia feature y así una no bloquea a la otra.
- El esquema Zod de la baraja (`src/decks/schema.ts`) se crea aquí porque el motor lo necesita; el
  validador de equilibrio (M-10) va en la feature de la baraja.
- Las acciones fuera de turno o inválidas (preguntar dos veces seguidas, adivinar sin ser tu turno)
  devuelven un error tipado y no cambian el estado.
- Bajar o levantar fichas a mano (M-05) se modela en el motor, pero el requisito se cierra en la
  feature del tablero, que es donde el jugador lo hace.
- `playerView()` es lo único que la interfaz debe leer del estado: oculta el secreto del rival
  hasta el final. En el nivel 2 será lo que el servidor envíe a cada navegador.
- Los E2E corren en Chromium de escritorio y Chromium con emulación de móvil (Pixel 7). WebKit se
  añade cuando lleguen los E2E de la partida, para no descargar otro navegador antes de usarlo.

## Cobertura

| Requisito | Se implementa en | Se valida con |
|-----------|------------------|---------------|
| M-02 | `src/engine/game.ts` (reparto con semilla, `playerView`) | `src/engine/game.test.ts` |
| M-03 | `src/engine/game.ts` (preguntar y responder, control de turno) | `src/engine/game.test.ts` |
| M-06 | `src/engine/bot.ts` (la máquina pregunta; respuesta automática y veraz) | `src/engine/bot.test.ts` |
| M-08 | `src/engine/game.ts` (adivinar: acierto gana, fallo pierde) | `src/engine/game.test.ts` |
| M-09 | `src/engine/game.ts` (fase terminada, ganador y secretos revelados) | `src/engine/game.test.ts` |

## Fuera de esta feature

- Tablero, fichas, animaciones y cualquier pantalla del juego.
- La baraja de políticos, sus fotos y el validador de equilibrio (M-10, M-11).
- La máquina en modo difícil (S-01): fase 2.
- Desplegar en Cloudflare o conectar el repo: lo hace el usuario.
- Tests E2E de partidas: Playwright queda instalado y configurado, pero sus tests llegan con la
  interfaz.
