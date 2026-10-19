import type { Deck } from '../../decks/schema';
import styles from './Creditos.module.css';

export const PHOTO_CHANGES = 'Recortada, con el fondo sustituido por uno uniforme y la luz corregida.';

/** Ruta pública de la foto de un personaje en el tamaño pedido. */
export function photoUrl(deckId: string, file: string, size: 300 | 600 = 300) {
  return `/fotos/${deckId}/${size}/${file}`;
}

/** Página de créditos de las fotos (M-11): autor, licencia, fuente y qué se ha modificado. */
export function Creditos({ deck }: { deck: Deck }) {
  return (
    <main className={styles.page}>
      <a className={styles.back} href="/">
        ← Volver al juego
      </a>
      <h1 className={styles.title}>Créditos de las fotos</h1>
      <p className={styles.intro}>
        Todas las fotos vienen de Wikimedia Commons y se usan según su licencia. {PHOTO_CHANGES} Datos de los personajes a
        fecha de {new Date(deck.dataAsOf).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}.
      </p>
      <ul className={styles.list}>
        {deck.characters.map((c) => (
          <li key={c.id} className={styles.item} data-testid={`credito-${c.id}`}>
            {c.photo ? (
              <>
                <img className={styles.photo} src={photoUrl(deck.id, c.photo.file)} alt={c.name} width={75} height={100} loading="lazy" />
                <div>
                  <h2 className={styles.name}>{c.name}</h2>
                  <p className={styles.meta}>
                    Autor: <span data-testid="autor">{c.photo.author}</span>
                  </p>
                  <p className={styles.meta}>
                    Licencia:{' '}
                    <a href={c.photo.licenseUrl} rel="license noreferrer" target="_blank" data-testid="licencia">
                      {c.photo.license}
                    </a>
                  </p>
                  <p className={styles.meta}>
                    <a href={c.photo.sourceUrl} rel="noreferrer" target="_blank" data-testid="fuente">
                      Ver la foto original
                    </a>
                  </p>
                </div>
              </>
            ) : (
              <h2 className={styles.name}>{c.name} (sin foto)</h2>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
