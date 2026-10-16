import type { Deck } from '../decks/schema';
import { pick, seedToRng } from './random';
import type { Difficulty, GameError, GameState, PlayerId, Result, Tone, Turn } from './types';

export interface NewGameOptions {
  seed: number;
  tone?: Tone;
  difficulty?: Difficulty;
  colors?: Partial<Record<PlayerId, string>>;
}

const fail = (error: GameError): Result => ({ ok: false, error });
const done = (state: GameState): Result => ({ ok: true, state });

export function opponent(player: PlayerId): PlayerId {
  return player === 'jugador' ? 'rival' : 'jugador';
}

/** Reparte los dos personajes secretos (distintos) y sortea quién empieza. */
export function createGame(deck: Deck, options: NewGameOptions): GameState {
  const ids = deck.characters.map((c) => c.id);
  let rng = seedToRng(options.seed);

  const playerSecret = pick(rng, ids);
  rng = playerSecret.rng;
  const rivalSecret = pick(rng, ids.filter((id) => id !== playerSecret.value));
  rng = rivalSecret.rng;
  const first = pick<PlayerId>(rng, ['jugador', 'rival']);
  rng = first.rng;

  return {
    seed: options.seed,
    rng,
    deckId: deck.id,
    tone: options.tone ?? 'neutral',
    difficulty: options.difficulty ?? 'facil',
    phase: 'jugando',
    turn: first.value,
    players: {
      jugador: {
        secretId: playerSecret.value,
        upIds: [...ids],
        color: options.colors?.jugador ?? deck.defaultColors.player,
      },
      rival: {
        secretId: rivalSecret.value,
        upIds: [...ids],
        color: options.colors?.rival ?? deck.defaultColors.rival,
      },
    },
    history: [],
    winner: null,
  };
}

/** Respuesta verdadera a una pregunta sobre un personaje. */
export function answerFor(deck: Deck, characterId: string, questionId: string): boolean {
  const question = deck.questions.find((q) => q.id === questionId);
  const character = deck.characters.find((c) => c.id === characterId);
  if (!question || !character) throw new Error(`Pregunta o personaje desconocido: ${questionId}, ${characterId}`);
  return character.attributes[question.attributeId] === true;
}

/** Fichas levantadas que no encajan con la respuesta: las que hay que bajar (M-04). */
export function mismatchedIds(deck: Deck, upIds: readonly string[], questionId: string, answer: boolean): string[] {
  return upIds.filter((id) => answerFor(deck, id, questionId) !== answer);
}

export function questionsAskedBy(state: GameState, player: PlayerId): string[] {
  return state.history.flatMap((t) => (t.by === player && t.type === 'pregunta' ? [t.questionId] : []));
}

function checkTurn(state: GameState, by: PlayerId): GameError | null {
  if (state.phase === 'terminada') return 'partida-terminada';
  if (state.turn !== by) return 'no-es-tu-turno';
  return null;
}

function withTurn(state: GameState, turn: Turn, changes: Partial<GameState>): GameState {
  return { ...state, ...changes, history: [...state.history, turn] };
}

/** Pregunta sobre el personaje secreto del otro jugador y pasa el turno (M-03). */
export function ask(state: GameState, deck: Deck, by: PlayerId, questionId: string): Result {
  const error = checkTurn(state, by);
  if (error) return fail(error);
  if (!deck.questions.some((q) => q.id === questionId)) return fail('pregunta-desconocida');
  if (questionsAskedBy(state, by).includes(questionId)) return fail('pregunta-ya-hecha');

  const answer = answerFor(deck, state.players[opponent(by)].secretId, questionId);
  return done(withTurn(state, { by, type: 'pregunta', questionId, answer }, { turn: opponent(by) }));
}

/** Intenta adivinar el personaje del otro jugador: si acierta gana, si falla pierde (M-08). */
export function guess(state: GameState, deck: Deck, by: PlayerId, characterId: string): Result {
  const error = checkTurn(state, by);
  if (error) return fail(error);
  if (!deck.characters.some((c) => c.id === characterId)) return fail('personaje-desconocido');

  const answer = state.players[opponent(by)].secretId === characterId;
  return done(
    withTurn(state, { by, type: 'adivinar', guessId: characterId, answer }, {
      phase: 'terminada',
      winner: answer ? by : opponent(by),
    }),
  );
}

/** Baja o levanta fichas del tablero de un jugador. No consume turno (M-05). */
export function setTiles(state: GameState, deck: Deck, player: PlayerId, characterIds: readonly string[], up: boolean): Result {
  if (state.phase === 'terminada') return fail('partida-terminada');
  const known = new Set(deck.characters.map((c) => c.id));
  if (characterIds.some((id) => !known.has(id))) return fail('personaje-desconocido');

  const upSet = new Set(state.players[player].upIds);
  for (const id of characterIds) {
    if (up) upSet.add(id);
    else upSet.delete(id);
  }
  // Se mantiene el orden de la baraja, que es el orden del tablero.
  const upIds = deck.characters.map((c) => c.id).filter((id) => upSet.has(id));
  return done({ ...state, players: { ...state.players, [player]: { ...state.players[player], upIds } } });
}

export interface PlayerView {
  phase: GameState['phase'];
  turn: PlayerId;
  tone: Tone;
  me: { secretId: string; upIds: string[]; color: string };
  /** Del rival solo se ve cuántas fichas le quedan; su secreto, al terminar (M-07, M-09). */
  rival: { upCount: number; color: string; secretId: string | null };
  history: Turn[];
  winner: PlayerId | null;
}

/** Lo que un jugador puede ver de la partida. En el nivel 2 es lo único que se le envía. */
export function playerView(state: GameState, viewer: PlayerId): PlayerView {
  const me = state.players[viewer];
  const other = state.players[opponent(viewer)];
  return {
    phase: state.phase,
    turn: state.turn,
    tone: state.tone,
    me: { secretId: me.secretId, upIds: [...me.upIds], color: me.color },
    rival: {
      upCount: other.upIds.length,
      color: other.color,
      secretId: state.phase === 'terminada' ? other.secretId : null,
    },
    history: [...state.history],
    winner: state.winner,
  };
}
