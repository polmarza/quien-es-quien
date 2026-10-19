import type { Deck } from '../../decks/schema';
import type { PlayerView } from '../../engine/game';
import hud from '../hud/Hud.module.css';
import { photoUrl } from './Creditos';
import styles from './Partida.module.css';

/** Pantalla final (M-09): quién ha ganado, los dos secretos boca arriba y jugar otra. */
export function FinPartida({ deck, view, onAgain }: { deck: Deck; view: PlayerView; onAgain: () => void }) {
  const last = view.history.at(-1);
  const won = view.winner === 'jugador';
  const card = (title: string, id: string | null, testid: string) => {
    const c = deck.characters.find((x) => x.id === id);
    if (!c) return null;
    return (
      <figure className={styles.endCard} data-testid={testid}>
        <img src={photoUrl(deck.id, c.photo.file, 600)} alt="" width={150} height={200} />
        <figcaption>
          <span>{title}</span>
          <strong>{c.name}</strong>
        </figcaption>
      </figure>
    );
  };
  let reason = '';
  if (last?.type === 'adivinar') {
    const guessed = deck.characters.find((c) => c.id === last.guessId)?.name ?? '';
    const who = last.by === 'jugador' ? 'Dijiste' : 'El rival dijo';
    reason = `${who} ${guessed}: ${last.answer ? 'acierto' : 'fallo'}.`;
  }

  return (
    <div className={styles.endBackdrop}>
      <section className={styles.end} role="dialog" aria-modal="true" aria-labelledby="fin-titulo" data-testid="fin-partida">
        <h2 id="fin-titulo" className={styles.endTitle}>
          {won ? '¡Has ganado!' : 'Ha ganado el rival'}
        </h2>
        <p>{reason}</p>
        <div className={styles.endCards}>
          {card('Tu personaje', view.me.secretId, 'fin-secreto-jugador')}
          {card('El del rival', view.rival.secretId, 'fin-secreto-rival')}
        </div>
        <div className={hud.actions}>
          <button type="button" className={hud.primary} onClick={onAgain} autoFocus>
            Jugar otra
          </button>
        </div>
      </section>
    </div>
  );
}
