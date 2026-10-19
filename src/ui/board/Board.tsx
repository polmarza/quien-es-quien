import type { Deck } from '../../decks/schema';
import type { Mode } from '../game/useGame';
import styles from './Board.module.css';
import { Tile, type TileState } from './Tile';

interface BoardProps {
  deck: Deck;
  upIds: string[];
  mode: Mode;
  dropOrder: Record<string, number>;
  disabled: boolean;
  onTile: (characterId: string) => void;
}

/** Tablero plano visto a unos 45°, con las 24 fichas en una cuadrícula de 6×4 (M-01). */
export function Board({ deck, upIds, mode, dropOrder, disabled, onTile }: BoardProps) {
  const stateOf = (id: string): TileState => {
    if (!upIds.includes(id)) return 'bajada';
    if (mode.kind === 'marcando' && mode.marked.includes(id)) return 'marcada';
    if (mode.kind === 'adivinando' && mode.candidateId === id) return 'candidata';
    return 'arriba';
  };
  const labelOf = (name: string, state: TileState) => {
    if (mode.kind === 'adivinando') return `Adivinar: ${name}`;
    if (mode.kind === 'marcando') return state === 'marcada' ? `${name}, marcada para bajar` : name;
    return state === 'bajada' ? `${name}, bajada. Pulsa para levantarla` : `${name}. Pulsa para bajarla`;
  };

  return (
    <div className={styles.scene} data-testid="tablero">
      <div className={styles.board} data-mode={mode.kind} aria-disabled={disabled}>
        {deck.characters.map((c) => {
          const state = stateOf(c.id);
          return (
            <Tile
              key={c.id}
              deckId={deck.id}
              character={c}
              state={state}
              dropIndex={dropOrder[c.id]}
              label={labelOf(c.name, state)}
              onClick={() => !disabled && onTile(c.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
