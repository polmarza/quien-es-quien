import styles from './Hud.module.css';

/** Una sola ficha con el número de fichas que le quedan levantadas al rival (M-07). */
export function RivalCounter({ count }: { count: number }) {
  return (
    <div className={styles.rival} role="status" aria-label={`Al rival le quedan ${count}`}>
      <span key={count} className={styles.rivalCount} data-testid="contador-rival">
        {count}
      </span>
      <span className={styles.rivalLabel}>le quedan</span>
    </div>
  );
}
