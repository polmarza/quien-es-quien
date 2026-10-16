import type { Deck } from '../decks/schema';
import { ask, guess, mismatchedIds, questionsAskedBy, setTiles } from './game';
import { pick } from './random';
import type { GameState, PlayerId, Result } from './types';

export type BotAction = { type: 'pregunta'; questionId: string } | { type: 'adivinar'; characterId: string };

/**
 * Decide la jugada de la máquina en modo fácil: si le queda una ficha, adivina; si no, pregunta al
 * azar algo que no haya preguntado; si ya no le quedan preguntas, adivina al azar entre sus fichas.
 * El modo difícil (S-01) llega en la fase 2; de momento usa la misma estrategia.
 */
export function chooseBotAction(state: GameState, deck: Deck, by: PlayerId): { action: BotAction; rng: number } {
  const upIds = state.players[by].upIds;
  if (upIds.length === 1) {
    return { action: { type: 'adivinar', characterId: upIds[0] as string }, rng: state.rng };
  }

  const asked = new Set(questionsAskedBy(state, by));
  const pending = deck.questions.filter((q) => !asked.has(q.id)).map((q) => q.id);
  if (pending.length === 0) {
    const draw = pick(state.rng, upIds);
    return { action: { type: 'adivinar', characterId: draw.value }, rng: draw.rng };
  }

  const draw = pick(state.rng, pending);
  return { action: { type: 'pregunta', questionId: draw.value }, rng: draw.rng };
}

/**
 * Juega el turno completo de la máquina: decide, pregunta o adivina y, si ha preguntado, baja en
 * su tablero las fichas que no encajan con la respuesta (M-06). La respuesta la calcula el motor a
 * partir del secreto del otro jugador, así que siempre es verdadera.
 */
export function playBotTurn(state: GameState, deck: Deck, by: PlayerId = 'rival'): Result {
  if (state.phase === 'terminada') return { ok: false, error: 'partida-terminada' };
  if (state.turn !== by) return { ok: false, error: 'no-es-tu-turno' };

  const { action, rng } = chooseBotAction(state, deck, by);
  const advanced: GameState = { ...state, rng };

  if (action.type === 'adivinar') return guess(advanced, deck, by, action.characterId);

  const asked = ask(advanced, deck, by, action.questionId);
  if (!asked.ok) return asked;

  const last = asked.state.history.at(-1);
  if (!last || last.type !== 'pregunta') throw new Error('La pregunta no quedó en el historial');
  const toLower = mismatchedIds(deck, asked.state.players[by].upIds, last.questionId, last.answer);
  return setTiles(asked.state, deck, by, toLower, false);
}
