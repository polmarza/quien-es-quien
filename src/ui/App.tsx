import { useState } from 'react';
import { politicosEs } from '../decks/politicos-es';
import styles from './App.module.css';
import { seedFromLocation } from './game/useGame';
import hud from './hud/Hud.module.css';
import { Creditos } from './screens/Creditos';
import { Partida } from './screens/Partida';

// Mientras haya pocas pantallas, la ruta se decide con la URL.
export function App() {
  const [seed, setSeed] = useState<number | null>(null);
  if (window.location.pathname.replace(/\/$/, '') === '/creditos') return <Creditos deck={politicosEs} />;
  if (seed !== null) return <Partida deck={politicosEs} seed={seed} />;

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Quién es quién</h1>
      <p className={styles.subtitle}>Políticos de España</p>
      <button type="button" className={hud.primary} onClick={() => setSeed(seedFromLocation())}>
        Jugar
      </button>
      <a className={styles.link} href="/creditos">
        Créditos de las fotos
      </a>
    </main>
  );
}
