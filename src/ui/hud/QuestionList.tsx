import type { Question } from '../../decks/schema';
import styles from './Hud.module.css';

interface QuestionListProps {
  questions: Question[];
  asked: string[];
  disabled: boolean;
  onAsk: (questionId: string) => void;
}

/** Lista cerrada de preguntas (M-03). Las ya hechas por el jugador quedan marcadas. */
export function QuestionList({ questions, asked, disabled, onAsk }: QuestionListProps) {
  return (
    <ul className={styles.questions} aria-label="Preguntas">
      {questions.map((q) => {
        const done = asked.includes(q.id);
        return (
          <li key={q.id}>
            <button
              type="button"
              className={styles.question}
              disabled={disabled || done}
              data-done={done}
              onClick={() => onAsk(q.id)}
            >
              {q.text}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
