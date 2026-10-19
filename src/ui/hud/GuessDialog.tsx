import styles from './Hud.module.css';

interface GuessDialogProps {
  candidateName: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Panel de adivinar (M-08): se elige una ficha del tablero y se confirma. */
export function GuessDialog({ candidateName, onConfirm, onCancel }: GuessDialogProps) {
  return (
    <section className={styles.panel} aria-label="Adivinar" data-testid="adivinar">
      <h2 className={styles.panelTitle}>¿Quién es?</h2>
      {candidateName ? (
        <p>
          ¿Seguro que es <strong>{candidateName}</strong>? Si fallas, pierdes la partida.
        </p>
      ) : (
        <p>Pulsa en el tablero la ficha de quien crees que es.</p>
      )}
      <div className={styles.actions}>
        <button type="button" className={styles.primary} disabled={!candidateName} onClick={onConfirm}>
          Sí, es {candidateName ?? '…'}
        </button>
        <button type="button" className={styles.secondary} onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </section>
  );
}
