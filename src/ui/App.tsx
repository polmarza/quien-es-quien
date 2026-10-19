import { politicosEs } from '../decks/politicos-es';
import styles from './App.module.css';
import { Creditos } from './screens/Creditos';

// Mientras no haya más pantallas, la ruta se decide con la URL; el tablero llega en su feature.
export function App() {
  if (window.location.pathname.replace(/\/$/, '') === '/creditos') return <Creditos deck={politicosEs} />;

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Quién es quién</h1>
      <p className={styles.subtitle}>Políticos de España · en construcción</p>
      <a className={styles.link} href="/creditos">
        Créditos de las fotos
      </a>
    </main>
  );
}
