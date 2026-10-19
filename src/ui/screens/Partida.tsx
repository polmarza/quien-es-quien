import type { Deck } from '../../decks/schema';
import { Board } from '../board/Board';
import { useGame } from '../game/useGame';
import { Answer } from '../hud/Answer';
import { GuessDialog } from '../hud/GuessDialog';
import hud from '../hud/Hud.module.css';
import { QuestionList } from '../hud/QuestionList';
import { RivalCounter } from '../hud/RivalCounter';
import { SecretCard } from '../hud/SecretCard';
import { FinPartida } from './FinPartida';
import styles from './Partida.module.css';

/** Partida contra la máquina (FLOW-01 a FLOW-04). La interfaz solo lee `playerView()`. */
export function Partida({ deck, seed }: { deck: Deck; seed: number }) {
  const { view, mode, dropOrder, botThinking, dispatch, newGame } = useGame(deck, seed);
  const byId = (id: string) => deck.characters.find((c) => c.id === id);
  const questionText = (id: string) => deck.questions.find((q) => q.id === id)?.text ?? id;
  const secret = byId(view.me.secretId);
  const myTurn = view.phase === 'jugando' && view.turn === 'jugador' && mode.kind === 'libre';
  const asked = view.history.flatMap((t) => (t.by === 'jugador' && t.type === 'pregunta' ? [t.questionId] : []));
  const lastRival = [...view.history].reverse().find((t) => t.by === 'rival');

  let status: string;
  if (view.phase === 'terminada') status = 'Partida terminada';
  else if (botThinking) status = 'El rival está pensando…';
  else if (mode.kind === 'marcando') status = 'Elige qué fichas bajar';
  else if (mode.kind === 'adivinando') status = 'Adivina quién es';
  else status = view.history.length === 0 ? 'Empiezas tú: haz una pregunta' : 'Tu turno';

  return (
    <main className={styles.game}>
      <header className={styles.top}>
        <RivalCounter count={view.rival.upCount} />
        <p className={styles.status} role="status" data-testid="estado">
          {status}
        </p>
      </header>

      <div className={styles.layout}>
        <section className={styles.boardArea} aria-label="Tu tablero">
          <Board
            deck={deck}
            upIds={view.me.upIds}
            mode={mode}
            dropOrder={dropOrder}
            disabled={view.phase === 'terminada'}
            onTile={(id) => dispatch({ type: 'alternar-ficha', characterId: id })}
          />
          {secret && (
            <div className={styles.slot}>
              <SecretCard deckId={deck.id} character={secret} />
            </div>
          )}
        </section>

        <aside className={styles.side}>
          {lastRival && view.phase === 'jugando' && (
            <section className={hud.panel} aria-label="Último turno del rival" data-testid="turno-rival">
              {lastRival.type === 'pregunta' ? (
                <p>
                  El rival preguntó «{questionText(lastRival.questionId)}». Tu personaje: <Answer value={lastRival.answer} />
                </p>
              ) : (
                <p>El rival ha intentado adivinar.</p>
              )}
            </section>
          )}

          {mode.kind === 'marcando' && (
            <section className={hud.panel} aria-label="Respuesta" data-testid="panel-respuesta">
              <p>
                «{questionText(mode.questionId)}» <Answer value={mode.answer} />
              </p>
              <p>
                {mode.marked.length === 0
                  ? 'Esta respuesta no descarta a nadie.'
                  : `Se bajarán ${mode.marked.length} fichas. Puedes marcar o desmarcar en el tablero.`}
              </p>
              <div className={hud.actions}>
                <button type="button" className={hud.primary} onClick={() => dispatch({ type: 'bajar-marcadas' })}>
                  {mode.marked.length === 0 ? 'Seguir' : 'Bajar fichas'}
                </button>
              </div>
            </section>
          )}

          {mode.kind === 'adivinando' && (
            <GuessDialog
              candidateName={mode.candidateId ? (byId(mode.candidateId)?.name ?? null) : null}
              onConfirm={() => dispatch({ type: 'confirmar-adivinar' })}
              onCancel={() => dispatch({ type: 'cancelar-adivinar' })}
            />
          )}

          {mode.kind === 'libre' && view.phase === 'jugando' && (
            <section className={hud.panel} aria-label="Tu turno">
              <h2 className={hud.panelTitle}>Pregunta</h2>
              <QuestionList
                questions={deck.questions}
                asked={asked}
                disabled={!myTurn}
                onAsk={(id) => dispatch({ type: 'preguntar', questionId: id })}
              />
              <div className={hud.actions}>
                <button type="button" className={hud.secondary} disabled={!myTurn} onClick={() => dispatch({ type: 'empezar-adivinar' })}>
                  Adivinar
                </button>
              </div>
            </section>
          )}
        </aside>
      </div>

      {view.phase === 'terminada' && <FinPartida deck={deck} view={view} onAgain={newGame} />}
    </main>
  );
}
