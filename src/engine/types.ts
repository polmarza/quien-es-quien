// Estado de partida (docs/data-model.md → GameState). Inmutable: cada acción devuelve uno nuevo.

export type PlayerId = 'jugador' | 'rival';
export type Tone = 'neutral' | 'humor';
export type Difficulty = 'facil' | 'dificil';
export type Phase = 'jugando' | 'terminada';

export interface PlayerState {
  secretId: string;
  /** Fichas levantadas en su tablero, en el orden de la baraja. */
  upIds: string[];
  color: string;
}

export type Turn =
  | { by: PlayerId; type: 'pregunta'; questionId: string; answer: boolean }
  | { by: PlayerId; type: 'adivinar'; guessId: string; answer: boolean };

export interface GameState {
  seed: number;
  /** Estado del generador con semilla; avanza cada vez que el motor usa el azar. */
  rng: number;
  deckId: string;
  tone: Tone;
  difficulty: Difficulty;
  phase: Phase;
  turn: PlayerId;
  players: Record<PlayerId, PlayerState>;
  history: Turn[];
  winner: PlayerId | null;
}

export type GameError =
  | 'partida-terminada'
  | 'no-es-tu-turno'
  | 'pregunta-desconocida'
  | 'pregunta-ya-hecha'
  | 'personaje-desconocido';

export type Result = { ok: true; state: GameState } | { ok: false; error: GameError };
