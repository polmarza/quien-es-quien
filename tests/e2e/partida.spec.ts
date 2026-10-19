import { expect, type Page, test } from '@playwright/test';
import deckJson from '../../src/decks/politicos-es/deck.json' with { type: 'json' };
import { deckSchema } from '../../src/decks/schema.ts';
import { playBotTurn } from '../../src/engine/bot.ts';
import { answerFor, ask, createGame, mismatchedIds, setTiles } from '../../src/engine/game.ts';
import type { GameState } from '../../src/engine/types.ts';

// Partida contra la máquina de principio a fin. Con `?semilla=` la partida es determinista y el
// motor (el mismo que usa la interfaz) dice qué esperar en cada paso.

const deck = deckSchema.parse(deckJson);
const nameOf = (id: string) => deck.characters.find((c) => c.id === id)?.name ?? id;
const Q = 'q-mujer';
const questionText = deck.questions.find((q) => q.id === Q)?.text ?? '';

/** Primera semilla en la que empieza el jugador. */
function seedWhereIStart(): { seed: number; game: GameState } {
  for (let seed = 1; seed < 500; seed++) {
    const game = createGame(deck, { seed });
    if (game.turn === 'jugador') return { seed, game };
  }
  throw new Error('Ninguna semilla hace empezar al jugador');
}

const { seed, game } = seedWhereIStart();
const mySecret = game.players.jugador.secretId;
const rivalSecret = game.players.rival.secretId;

async function start(page: Page) {
  await page.goto(`/?semilla=${seed}`);
  await page.getByRole('button', { name: 'Jugar' }).click();
  await expect(page.getByTestId('tablero')).toBeVisible();
}

function ok(result: ReturnType<typeof ask>): GameState {
  if (!result.ok) throw new Error(result.error);
  return result.state;
}

test('M-01 M-02 M-07 el tablero muestra 24 fichas con foto y nombre, tu secreto y el contador del rival', async ({ page }) => {
  await start(page);
  const tiles = page.locator('[data-testid^="ficha-"]');
  await expect(tiles).toHaveCount(24);
  for (const c of deck.characters) {
    const tile = page.getByTestId(`ficha-${c.id}`);
    await expect(tile).toContainText(c.name);
    await expect(tile).toHaveAttribute('aria-pressed', 'false');
    await expect.poll(() => tile.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  }
  await expect(page.getByTestId('secreto-nombre')).toHaveText(nameOf(mySecret));
  await expect(page.getByTestId('contador-rival')).toHaveText('24');
  await expect(page.getByTestId('estado')).toHaveText('Empiezas tú: haz una pregunta');
});

test('M-03 M-04 preguntar muestra la respuesta, marca las que no encajan y al confirmar caen solo esas', async ({ page }) => {
  await start(page);
  const answer = answerFor(deck, rivalSecret, Q);
  const toLower = mismatchedIds(deck, game.players.jugador.upIds, Q, answer);

  await page.getByRole('button', { name: questionText }).click();
  const panel = page.getByTestId('panel-respuesta');
  await expect(panel.getByTestId('respuesta')).toHaveText(answer ? '✓ Sí' : '✗ No');
  await expect(panel).toContainText(`Se bajarán ${toLower.length} fichas`);
  for (const c of deck.characters) {
    await expect(page.getByTestId(`ficha-${c.id}`)).toHaveAttribute('data-state', toLower.includes(c.id) ? 'marcada' : 'arriba');
  }

  // Se puede desmarcar una antes de confirmar.
  const [spared, ...rest] = toLower;
  await page.getByTestId(`ficha-${spared}`).click();
  await expect(page.getByTestId(`ficha-${spared}`)).toHaveAttribute('data-state', 'arriba');

  await panel.getByRole('button', { name: 'Bajar fichas' }).click();
  for (const c of deck.characters) {
    await expect(page.getByTestId(`ficha-${c.id}`)).toHaveAttribute('aria-pressed', String(rest.includes(c.id)));
  }
});

test('M-03 (negativo) fuera de tu turno las preguntas y adivinar están deshabilitados', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: questionText }).click();
  await page.getByTestId('panel-respuesta').getByRole('button').click();
  await expect(page.getByTestId('estado')).toHaveText('El rival está pensando…');
  await expect(page.getByRole('button', { name: deck.questions[1]?.text ?? '' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Adivinar' })).toBeDisabled();
});

test('M-05 una ficha se baja y se vuelve a levantar pulsándola', async ({ page }) => {
  await start(page);
  const tile = page.getByTestId(`ficha-${deck.characters[0]?.id}`);
  await tile.click();
  await expect(tile).toHaveAttribute('aria-pressed', 'true');
  await tile.click();
  await expect(tile).toHaveAttribute('aria-pressed', 'false');
});

test('M-06 M-07 la máquina pregunta, el juego responde por ti con la verdad y su contador baja', async ({ page }) => {
  await start(page);
  // Lo que hará la máquina, calculado con el mismo motor.
  const afterAsk = ok(ask(game, deck, 'jugador', Q));
  const last = afterAsk.history.at(-1);
  if (last?.type !== 'pregunta') throw new Error('Pregunta no registrada');
  const lowered = ok(setTiles(afterAsk, deck, 'jugador', mismatchedIds(deck, game.players.jugador.upIds, Q, last.answer), false));
  const afterBot = ok(playBotTurn(lowered, deck, 'rival'));
  const botTurn = afterBot.history.at(-1);
  if (botTurn?.type !== 'pregunta') throw new Error('La máquina debía preguntar');

  await page.getByRole('button', { name: questionText }).click();
  await page.getByTestId('panel-respuesta').getByRole('button').click();

  const rivalPanel = page.getByTestId('turno-rival');
  await expect(rivalPanel).toContainText(deck.questions.find((q) => q.id === botTurn.questionId)?.text ?? '');
  await expect(rivalPanel.getByTestId('respuesta')).toHaveText(answerFor(deck, mySecret, botTurn.questionId) ? '✓ Sí' : '✗ No');
  await expect(page.getByTestId('contador-rival')).toHaveText(String(afterBot.players.rival.upIds.length));
  await expect(page.getByTestId('estado')).toHaveText('Tu turno');
});

test('M-08 M-09 adivinar bien gana, se ven los dos secretos y se puede jugar otra', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: 'Adivinar' }).click();
  await page.getByTestId(`ficha-${rivalSecret}`).click();
  await page.getByRole('button', { name: `Sí, es ${nameOf(rivalSecret)}` }).click();

  const end = page.getByTestId('fin-partida');
  await expect(end.getByRole('heading')).toHaveText('¡Has ganado!');
  await expect(end.getByTestId('fin-secreto-jugador')).toContainText(nameOf(mySecret));
  await expect(end.getByTestId('fin-secreto-rival')).toContainText(nameOf(rivalSecret));

  await end.getByRole('button', { name: 'Jugar otra' }).click();
  await expect(page.getByTestId('fin-partida')).toHaveCount(0);
  await expect(page.getByTestId('contador-rival')).toHaveText('24');
});

test('M-08 (negativo) adivinar mal pierde; cancelar no gasta el turno', async ({ page }) => {
  await start(page);
  const wrong = deck.characters.find((c) => c.id !== rivalSecret)?.id ?? '';

  await page.getByRole('button', { name: 'Adivinar' }).click();
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await expect(page.getByTestId('estado')).toHaveText('Empiezas tú: haz una pregunta');

  await page.getByRole('button', { name: 'Adivinar' }).click();
  await page.getByTestId(`ficha-${wrong}`).click();
  await page.getByRole('button', { name: `Sí, es ${nameOf(wrong)}` }).click();
  await expect(page.getByTestId('fin-partida').getByRole('heading')).toHaveText('Ha ganado el rival');
});
