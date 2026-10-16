import styles from './App.module.css';

// Página provisional: confirma que el proyecto arranca. El tablero llega en su propia feature.
export function App() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Quién es quién</h1>
      <p className={styles.subtitle}>Políticos de España · en construcción</p>
    </main>
  );
}
