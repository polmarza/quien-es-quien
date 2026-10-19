import type { CSSProperties } from 'react';
import type { Character } from '../../decks/schema';
import { photoUrl } from '../screens/Creditos';
import styles from './Board.module.css';

export type TileState = 'arriba' | 'marcada' | 'bajada' | 'candidata';

interface TileProps {
  deckId: string;
  character: Character;
  state: TileState;
  /** Posición en la tanda que cae a la vez, para la cascada. */
  dropIndex?: number;
  label: string;
  onClick: () => void;
}

/** Ficha con bisagra en el borde inferior (M-01, M-04, M-05). */
export function Tile({ deckId, character, state, dropIndex = 0, label, onClick }: TileProps) {
  return (
    <div className={styles.slot}>
      <button
        type="button"
        className={styles.tile}
        data-state={state}
        data-testid={`ficha-${character.id}`}
        aria-pressed={state === 'bajada'}
        aria-label={label}
        style={{ '--drop-delay': `${dropIndex * 40}ms` } as CSSProperties}
        onClick={onClick}
      >
        <span className={styles.frame}>
          <img className={styles.photo} src={photoUrl(deckId, character.photo.file)} alt="" width={300} height={400} draggable={false} />
          <span className={styles.nameplate}>{character.name}</span>
        </span>
      </button>
    </div>
  );
}
