import { describe, expect, it } from 'vitest';
import { chooseBotAction, playBotTurn } from './bot';
import { answerFor, ask, createGame, questionsAskedBy, setTiles } from './game';
import { testDeck } from './test-deck';
import type { GameState, Result } from './types';

function ok(result: Result): GameState {
  if (!result.ok) throw new Error(`Se esperaba éxito y llegó el error ${result.error}`);
  return result.state;
}

function botStarts(seed = 1): GameState {
  for (let s = seed; s < seed + 100; s++) {
    const state = createGame(testDeck, { seed: s });
    if (state.turn === 'rival') return state;
  }
  throw new Error('Ninguna semilla de prueba hace empezar a la máquina');
}

describe('M-06 turno de la máquina', () => {
  it('M-06 pregunta, la respuesta sobre el secreto del jugador es la verdadera y el turno vuelve al jugador', () => {
    for (let seed = 0; seed < 100; seed++) {
      const state = botStarts(seed);
      const after = ok(playBotTurn(state, testDeck));
      const last = after.history.at(-1);
      expect(last?.by).toBe('rival');
      expect(last?.type).toBe('pregunta');
      if (last?.type !== 'pregunta') continue;
      expect(last.answer).toBe(answerFor(testDeck, state.players.jugador.secretId, last.questionId));
      expect(after.turn).toBe('jugador');
    }
  });

  it('M-06 baja en su tablero exactamente las fichas que no encajan, y nunca el secreto del jugador', () => {
    const state = botStarts();
    const after = ok(playBotTurn(state, testDeck));
    const last = after.history.at(-1);
    if (last?.type !== 'pregunta') throw new Error('La máquina debía preguntar');
    const expectedUp = testDeck.characters
      .map((c) => c.id)
      .filter((id) => answerFor(testDeck, id, last.questionId) === last.answer);
    expect(after.players.rival.upIds).toEqual(expectedUp);
    expect(after.players.rival.upIds).toContain(state.players.jugador.secretId);
    expect(after.players.jugador.upIds).toEqual(state.players.jugador.upIds);
  });

  it('M-06 no repite preguntas', () => {
    let state = botStarts();
    // Se alterna: la máquina pregunta y el jugador responde con una pregunta propia.
    const playerQuestions = testDeck.questions.map((q) => q.id);
    for (let i = 0; i < 2; i++) {
      state = ok(playBotTurn(state, testDeck));
      state = ok(ask(state, testDeck, 'jugador', playerQuestions[i] as string));
    }
    const asked = questionsAskedBy(state, 'rival');
    expect(new Set(asked).size).toBe(asked.length);
  });

  it('M-06 adivina cuando le queda una sola ficha', () => {
    const state = botStarts();
    const target = state.players.jugador.secretId;
    const others = state.players.rival.upIds.filter((id) => id !== target);
    const oneLeft = ok(setTiles(state, testDeck, 'rival', others, false));
    expect(chooseBotAction(oneLeft, testDeck, 'rival').action).toEqual({ type: 'adivinar', characterId: target });
    const after = ok(playBotTurn(oneLeft, testDeck));
    expect(after.phase).toBe('terminada');
    expect(after.winner).toBe('rival');
  });

  it('M-06 sin preguntas pendientes adivina al azar entre sus fichas levantadas', () => {
    let state = botStarts();
    // La máquina gasta las tres preguntas sin bajar fichas (se le devuelve el turno a mano).
    for (const q of testDeck.questions) {
      state = { ...ok(ask(state, testDeck, 'rival', q.id)), turn: 'rival' };
    }
    const { action } = chooseBotAction(state, testDeck, 'rival');
    expect(action.type).toBe('adivinar');
    if (action.type === 'adivinar') expect(state.players.rival.upIds).toContain(action.characterId);
  });

  it('M-06 (negativo) no juega fuera de su turno ni con la partida terminada', () => {
    const playerTurn = createGame(testDeck, { seed: 1 });
    const state = playerTurn.turn === 'jugador' ? playerTurn : { ...playerTurn, turn: 'jugador' as const };
    expect(playBotTurn(state, testDeck)).toEqual({ ok: false, error: 'no-es-tu-turno' });
    expect(playBotTurn({ ...state, phase: 'terminada' }, testDeck)).toEqual({ ok: false, error: 'partida-terminada' });
  });

  it('M-06 dos máquinas terminan siempre la partida, y acierta quien llega a una ficha', () => {
    for (let seed = 0; seed < 300; seed++) {
      let state = createGame(testDeck, { seed });
      let turns = 0;
      while (state.phase === 'jugando') {
        state = ok(playBotTurn(state, testDeck, state.turn));
        turns++;
        expect(turns).toBeLessThanOrEqual(2 * (testDeck.questions.length + 1));
      }
      expect(state.winner).not.toBeNull();
      // Con respuestas veraces, el secreto propio nunca desaparece del tablero rival.
      expect(state.players.rival.upIds).toContain(state.players.jugador.secretId);
      expect(state.players.jugador.upIds).toContain(state.players.rival.secretId);
    }
  });

  it('M-06 con la misma semilla juega exactamente igual', () => {
    const play = () => {
      let state = createGame(testDeck, { seed: 99 });
      while (state.phase === 'jugando') state = ok(playBotTurn(state, testDeck, state.turn));
      return state;
    };
    expect(play()).toEqual(play());
  });
});
