import styles from './Hud.module.css';

/** Respuesta "Sí" / "No", siempre con texto e icono además del color. */
export function Answer({ value }: { value: boolean }) {
  return (
    <span className={styles.answer} data-answer={value ? 'si' : 'no'} data-testid="respuesta">
      <span aria-hidden="true">{value ? '✓' : '✗'}</span> {value ? 'Sí' : 'No'}
    </span>
  );
}
