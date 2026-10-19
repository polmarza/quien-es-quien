import type { Character } from '../../decks/schema';
import { photoUrl } from '../screens/Creditos';
import styles from './Hud.module.css';

/** Tu personaje secreto, en la ranura delantera del tablero (M-02). */
export function SecretCard({ deckId, character }: { deckId: string; character: Character }) {
  return (
    <figure className={styles.secret} data-testid="secreto">
      <img src={photoUrl(deckId, character.photo.file, 600)} alt="" width={120} height={160} />
      <figcaption>
        <span className={styles.secretLabel}>Tu personaje</span>
        <strong data-testid="secreto-nombre">{character.name}</strong>
      </figcaption>
    </figure>
  );
}
