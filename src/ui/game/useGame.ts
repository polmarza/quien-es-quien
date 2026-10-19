import { useCallback, useEffect, useMemo, useReducer } from 'react';
import type { Deck } from '../../decks/schema';
import { playBotTurn } from '../../engine/bot';
import { ask, createGame, guess, mismatchedIds, playerView, setTiles } from '../../engine/game';
import type { GameState, Result } from '../../engine/types';

/** Lo que el jugador está haciendo en su turno, además del estado del motor (FLOW-02, FLOW-04). */
export type Mode =
  | { kind: 'libre' }
  /** Acaba de preguntar: ve la respuesta y ajusta qué fichas bajar antes de confirmar. */
  | { kind: 'marcando'; questionId: string; answer: boolean; marked: string[] }
  | { kind: 'adivinando'; candidateId: string | null };

interface UiState {
  game: GameState;
  mode: Mode;
  /** Orden de caída de la última tanda, para la cascada (id → posición). */
  dropOrder: Record<string, number>;
}

type Action =
  | { type: 'preguntar'; questionId: string }
  | { type: 'marcar'; characterId: string }
  | { type: 'bajar-marcadas' }
  | { type: 'alternar-ficha'; characterId: string }
  | { type: 'empezar-adivinar' }
  | { type: 'elegir-candidato'; characterId: string }
  | { type: 'cancelar-adivinar' }
  | { type: 'confirmar-adivinar' }
  | { type: 'turno-maquina' }
  | { type: 'nueva-partida'; seed: number };

const BOT_DELAY_MS = 1200;

function unwrap(result: Result, fallback: GameState): GameState {
  // Las acciones inválidas no cambian nada: la interfaz ya no las ofrece, así que no se notifican.
  return result.ok ? result.state : fallback;
}

function reducer(deck: Deck) {
  return (state: UiState, action: Action): UiState => {
    const { game, mode } = state;
    switch (action.type) {
      case 'preguntar': {
        if (mode.kind !== 'libre') return state;
        const result = ask(game, deck, 'jugador', action.questionId);
        if (!result.ok) return state;
        const last = result.state.history.at(-1);
        if (!last || last.type !== 'pregunta') return state;
        const marked = mismatchedIds(deck, game.players.jugador.upIds, action.questionId, last.answer);
        return { ...state, game: result.state, mode: { kind: 'marcando', questionId: action.questionId, answer: last.answer, marked } };
      }
      case 'marcar': {
        if (mode.kind !== 'marcando' || !game.players.jugador.upIds.includes(action.characterId)) return state;
        const marked = mode.marked.includes(action.characterId)
          ? mode.marked.filter((id) => id !== action.characterId)
          : [...mode.marked, action.characterId];
        return { ...state, mode: { ...mode, marked } };
      }
      case 'bajar-marcadas': {
        if (mode.kind !== 'marcando') return state;
        const order = deck.characters.map((c) => c.id).filter((id) => mode.marked.includes(id));
        return {
          game: unwrap(setTiles(game, deck, 'jugador', order, false), game),
          mode: { kind: 'libre' },
          dropOrder: Object.fromEntries(order.map((id, i) => [id, i])),
        };
      }
      case 'alternar-ficha': {
        if (mode.kind === 'marcando') return reducer(deck)(state, { type: 'marcar', characterId: action.characterId });
        if (mode.kind === 'adivinando') return reducer(deck)(state, { type: 'elegir-candidato', characterId: action.characterId });
        const up = game.players.jugador.upIds.includes(action.characterId);
        return { ...state, game: unwrap(setTiles(game, deck, 'jugador', [action.characterId], !up), game), dropOrder: {} };
      }
      case 'empezar-adivinar':
        if (mode.kind !== 'libre' || game.turn !== 'jugador' || game.phase !== 'jugando') return state;
        return { ...state, mode: { kind: 'adivinando', candidateId: null } };
      case 'elegir-candidato':
        if (mode.kind !== 'adivinando' || !game.players.jugador.upIds.includes(action.characterId)) return state;
        return { ...state, mode: { kind: 'adivinando', candidateId: action.characterId } };
      case 'cancelar-adivinar':
        return mode.kind === 'adivinando' ? { ...state, mode: { kind: 'libre' } } : state;
      case 'confirmar-adivinar':
        if (mode.kind !== 'adivinando' || !mode.candidateId) return state;
        return { ...state, game: unwrap(guess(game, deck, 'jugador', mode.candidateId), game), mode: { kind: 'libre' } };
      case 'turno-maquina':
        if (game.turn !== 'rival' || game.phase !== 'jugando' || mode.kind === 'marcando') return state;
        return { ...state, game: unwrap(playBotTurn(game, deck, 'rival'), game) };
      case 'nueva-partida':
        return initial(deck, action.seed);
    }
  };
}

function initial(deck: Deck, seed: number): UiState {
  return { game: createGame(deck, { seed }), mode: { kind: 'libre' }, dropOrder: {} };
}

/** Semilla de la URL (`?semilla=123`, para los E2E) o aleatoria del navegador. */
export function seedFromLocation(search = window.location.search): number {
  const fixed = Number.parseInt(new URLSearchParams(search).get('semilla') ?? '', 10);
  if (Number.isFinite(fixed)) return fixed;
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 1;
}

export function useGame(deck: Deck, seed: number) {
  const [state, dispatch] = useReducer(useMemo(() => reducer(deck), [deck]), seed, (s) => initial(deck, s));
  const view = playerView(state.game, 'jugador');
  const botThinking = view.phase === 'jugando' && view.turn === 'rival' && state.mode.kind !== 'marcando';

  // Turno de la máquina, con una pausa para que se entienda el cambio de turno (FLOW-03).
  useEffect(() => {
    if (!botThinking) return;
    const timer = window.setTimeout(() => dispatch({ type: 'turno-maquina' }), BOT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [botThinking, state.game.history.length]);

  // Salir a mitad de partida pide confirmación (FLOW-01, casos de error).
  useEffect(() => {
    if (view.phase !== 'jugando') return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [view.phase]);

  const newGame = useCallback(() => dispatch({ type: 'nueva-partida', seed: seedFromLocation('') }), []);

  return { view, mode: state.mode, dropOrder: state.dropOrder, botThinking, dispatch, newGame };
}
