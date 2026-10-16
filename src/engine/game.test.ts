import { describe, expect, it } from 'vitest';
import { answerFor, ask, createGame, guess, mismatchedIds, opponent, playerView, setTiles } from './game';
import { testDeck } from './test-deck';
import type { GameState, PlayerId, Result } from './types';

const ids = testDeck.characters.map((c) => c.id);

function ok(result: Result): GameState {
  if (!result.ok) throw new Error(`Se esperaba éxito y llegó el error ${result.error}`);
  return result.state;
}

/** Partida con semilla fija en la que empieza `first`. */
function gameStartingWith(first: PlayerId): GameState {
  for (let seed = 1; seed < 100; seed++) {
    const state = createGame(testDeck, { seed });
    if (state.turn === first) return state;
  }
  throw new Error(`Ninguna semilla de prueba hace empezar a ${first}`);
}

describe('M-02 reparto de personajes secretos', () => {
  it('M-02 asigna a cada jugador un secreto de la baraja, distinto del otro', () => {
    for (let seed = 0; seed < 200; seed++) {
      const { players } = createGame(testDeck, { seed });
      expect(ids).toContain(players.jugador.secretId);
      expect(ids).toContain(players.rival.secretId);
      expect(players.jugador.secretId).not.toBe(players.rival.secretId);
    }
  });

  it('M-02 con la misma semilla reparte lo mismo, y semillas distintas dan repartos distintos', () => {
    expect(createGame(testDeck, { seed: 42 })).toEqual(createGame(testDeck, { seed: 42 }));
    const secrets = new Set(Array.from({ length: 50 }, (_, seed) => createGame(testDeck, { seed }).players.rival.secretId));
    expect(secrets.size).toBeGreaterThan(1);
  });

  it('M-02 empieza con todas las fichas levantadas, partida en juego y sin historial', () => {
    const state = createGame(testDeck, { seed: 7 });
    expect(state.players.jugador.upIds).toEqual(ids);
    expect(state.players.rival.upIds).toEqual(ids);
    expect(state.phase).toBe('jugando');
    expect(state.history).toEqual([]);
    expect(state.winner).toBeNull();
  });

  it('M-02 el jugador ve su secreto pero no el de la máquina', () => {
    const state = createGame(testDeck, { seed: 7 });
    const view = playerView(state, 'jugador');
    expect(view.me.secretId).toBe(state.players.jugador.secretId);
    expect(view.rival.secretId).toBeNull();
    expect(view).not.toHaveProperty('players');
  });

  it('M-02 usa los colores por defecto de la baraja salvo que se elijan otros', () => {
    const byDefault = createGame(testDeck, { seed: 1 });
    expect(byDefault.players.jugador.color).toBe('rojo');
    expect(byDefault.players.rival.color).toBe('azul');
    const chosen = createGame(testDeck, { seed: 1, colors: { jugador: 'azul' } });
    expect(chosen.players.jugador.color).toBe('azul');
  });

  it('M-02 sortea quién empieza', () => {
    const starters = new Set(Array.from({ length: 50 }, (_, seed) => createGame(testDeck, { seed }).turn));
    expect(starters).toEqual(new Set(['jugador', 'rival']));
  });
});

describe('M-03 preguntar de la lista cerrada', () => {
  it('M-03 responde con la verdad sobre el secreto del otro jugador y pasa el turno', () => {
    const state = gameStartingWith('jugador');
    const rivalSecret = state.players.rival.secretId;
    for (const q of testDeck.questions) {
      const after = ok(ask(state, testDeck, 'jugador', q.id));
      const expected = testDeck.characters.find((c) => c.id === rivalSecret)?.attributes[q.attributeId];
      expect(after.history.at(-1)).toEqual({ by: 'jugador', type: 'pregunta', questionId: q.id, answer: expected });
      expect(after.turn).toBe('rival');
    }
  });

  it('M-03 preguntar no baja fichas: eso lo confirma el jugador', () => {
    const state = gameStartingWith('jugador');
    const after = ok(ask(state, testDeck, 'jugador', 'q-mujer'));
    expect(after.players.jugador.upIds).toEqual(ids);
  });

  it('M-03 (negativo) fuera de turno no se puede preguntar y el estado no cambia', () => {
    const state = gameStartingWith('rival');
    expect(ask(state, testDeck, 'jugador', 'q-mujer')).toEqual({ ok: false, error: 'no-es-tu-turno' });
    expect(state.history).toEqual([]);
  });

  it('M-03 (negativo) no acepta preguntas fuera de la lista ni repetir una ya hecha', () => {
    const state = gameStartingWith('jugador');
    expect(ask(state, testDeck, 'jugador', 'q-inventada')).toEqual({ ok: false, error: 'pregunta-desconocida' });

    const first = ok(ask(state, testDeck, 'jugador', 'q-mujer'));
    const back = ok(ask(first, testDeck, 'rival', 'q-mujer'));
    expect(ask(back, testDeck, 'jugador', 'q-mujer')).toEqual({ ok: false, error: 'pregunta-ya-hecha' });
  });

  it('M-03 calcula las fichas que no encajan con la respuesta', () => {
    expect(mismatchedIds(testDeck, ids, 'q-mujer', true)).toEqual(['eloy', 'fede', 'gil', 'hugo']);
    expect(mismatchedIds(testDeck, ids, 'q-mujer', false)).toEqual(['ana', 'bea', 'carla', 'dora']);
    expect(mismatchedIds(testDeck, ['ana', 'eloy'], 'q-ministro', true)).toEqual([]);
  });

  it('M-03 el secreto del otro nunca queda entre las fichas que no encajan', () => {
    for (let seed = 0; seed < 100; seed++) {
      const state = createGame(testDeck, { seed });
      const secret = state.players.rival.secretId;
      for (const q of testDeck.questions) {
        const answer = answerFor(testDeck, secret, q.id);
        expect(mismatchedIds(testDeck, ids, q.id, answer)).not.toContain(secret);
      }
    }
  });
});

describe('bajar y levantar fichas (modelo de M-05)', () => {
  it('baja y vuelve a levantar fichas manteniendo el orden del tablero', () => {
    const state = createGame(testDeck, { seed: 3 });
    const lowered = ok(setTiles(state, testDeck, 'jugador', ['bea', 'gil'], false));
    expect(lowered.players.jugador.upIds).toEqual(['ana', 'carla', 'dora', 'eloy', 'fede', 'hugo']);
    const raised = ok(setTiles(lowered, testDeck, 'jugador', ['gil'], true));
    expect(raised.players.jugador.upIds).toEqual(['ana', 'carla', 'dora', 'eloy', 'fede', 'gil', 'hugo']);
    expect(raised.players.rival.upIds).toEqual(ids);
    expect(raised.turn).toBe(state.turn);
  });

  it('(negativo) no acepta personajes que no están en la baraja', () => {
    const state = createGame(testDeck, { seed: 3 });
    expect(setTiles(state, testDeck, 'jugador', ['nadie'], false)).toEqual({ ok: false, error: 'personaje-desconocido' });
  });
});

describe('M-08 adivinar', () => {
  it('M-08 si acierta, gana quien adivina', () => {
    const state = gameStartingWith('jugador');
    const after = ok(guess(state, testDeck, 'jugador', state.players.rival.secretId));
    expect(after.winner).toBe('jugador');
    expect(after.history.at(-1)).toMatchObject({ by: 'jugador', type: 'adivinar', answer: true });
  });

  it('M-08 si falla, pierde quien adivina', () => {
    const state = gameStartingWith('jugador');
    const wrong = ids.find((id) => id !== state.players.rival.secretId) as string;
    const after = ok(guess(state, testDeck, 'jugador', wrong));
    expect(after.winner).toBe('rival');
    expect(after.history.at(-1)).toMatchObject({ by: 'jugador', type: 'adivinar', guessId: wrong, answer: false });
  });

  it('M-08 (negativo) no se puede adivinar fuera de turno ni un personaje inexistente', () => {
    const rivalTurn = gameStartingWith('rival');
    expect(guess(rivalTurn, testDeck, 'jugador', 'ana')).toEqual({ ok: false, error: 'no-es-tu-turno' });
    const myTurn = gameStartingWith('jugador');
    expect(guess(myTurn, testDeck, 'jugador', 'nadie')).toEqual({ ok: false, error: 'personaje-desconocido' });
  });
});

describe('M-09 fin de partida', () => {
  it('M-09 al adivinar la partida termina y no admite más jugadas', () => {
    const state = gameStartingWith('jugador');
    const ended = ok(guess(state, testDeck, 'jugador', state.players.rival.secretId));
    expect(ended.phase).toBe('terminada');
    for (const player of ['jugador', 'rival'] as const) {
      expect(ask(ended, testDeck, player, 'q-mujer')).toEqual({ ok: false, error: 'partida-terminada' });
      expect(guess(ended, testDeck, player, 'ana')).toEqual({ ok: false, error: 'partida-terminada' });
      expect(setTiles(ended, testDeck, player, ['ana'], false)).toEqual({ ok: false, error: 'partida-terminada' });
    }
  });

  it('M-09 al terminar, cada jugador ve los dos secretos y quién ha ganado', () => {
    const state = gameStartingWith('jugador');
    const ended = ok(guess(state, testDeck, 'jugador', state.players.rival.secretId));
    for (const viewer of ['jugador', 'rival'] as const) {
      const view = playerView(ended, viewer);
      expect(view.me.secretId).toBe(ended.players[viewer].secretId);
      expect(view.rival.secretId).toBe(ended.players[opponent(viewer)].secretId);
      expect(view.winner).toBe('jugador');
      expect(view.phase).toBe('terminada');
    }
  });

  it('M-09 la vista del rival solo da su número de fichas mientras se juega', () => {
    const state = createGame(testDeck, { seed: 5 });
    const lowered = ok(setTiles(state, testDeck, 'rival', ['ana', 'bea', 'carla'], false));
    const view = playerView(lowered, 'jugador');
    expect(view.rival).toEqual({ upCount: 5, color: 'azul', secretId: null });
  });
});
