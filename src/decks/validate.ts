import { deckSchema, type Deck } from './schema.ts';

// Validador de barajas (M-10). Lo usan `pnpm validar-baraja` y los tests de cada baraja.
// Los límites son los del PRD: con 24 fichas, cada pregunta deja entre 8 y 16 personajes en el
// "sí", y los repartos principales (atributos `core`: sexo y bloque) entre 10 y 14.

export const CHARACTERS = 24;
export const QUESTION_RANGE = [8, 16] as const;
export const CORE_RANGE = [10, 14] as const;
/** Licencias de foto admitidas (tal como las nombra Wikimedia Commons). */
export const ALLOWED_LICENSES = /^(CC0|CC BY [0-9.]+( [a-z]{2})?|CC BY-SA [0-9.]+( [a-z]{2})?|Public domain|Attribution)$/;

export interface ValidationOptions {
  /** Comprueba que el archivo de la foto procesada existe (lo pasa el script; los tests, a veces). */
  photoExists?: (file: string) => boolean;
}

export interface ValidationReport {
  errors: string[];
  warnings: string[];
  /** Personajes con "sí" en cada pregunta, para el informe. */
  counts: Record<string, number>;
}

export function validateDeck(input: unknown, options: ValidationOptions = {}): ValidationReport {
  const parsed = deckSchema.safeParse(input);
  if (!parsed.success) {
    return {
      errors: parsed.error.issues.map((i) => `${i.path.join('.') || 'baraja'}: ${i.message}`),
      warnings: [],
      counts: {},
    };
  }
  return checkBalance(parsed.data, options);
}

function checkBalance(deck: Deck, options: ValidationOptions): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const counts: Record<string, number> = {};
  const yes = (attributeId: string) => deck.characters.filter((c) => c.attributes[attributeId]).length;

  if (deck.characters.length !== CHARACTERS) {
    errors.push(`La baraja tiene ${deck.characters.length} personajes y deben ser ${CHARACTERS}`);
  }

  for (const q of deck.questions) {
    const n = yes(q.attributeId);
    counts[q.id] = n;
    const [min, max] = QUESTION_RANGE;
    if (n < min || n > max) {
      errors.push(`La pregunta ${q.id} la cumplen ${n} de ${deck.characters.length}; debe estar entre ${min} y ${max}`);
    }
  }

  for (const a of deck.attributes.filter((a) => a.core)) {
    const n = yes(a.id);
    const [min, max] = CORE_RANGE;
    if (n < min || n > max) {
      errors.push(`El reparto de ${a.id} es de ${n} de ${deck.characters.length}; debe estar entre ${min} y ${max}`);
    }
  }

  // Dos personajes con las mismas respuestas a todas las preguntas son imposibles de distinguir.
  const byAnswers = new Map<string, string[]>();
  for (const c of deck.characters) {
    const key = deck.questions.map((q) => (c.attributes[q.attributeId] ? '1' : '0')).join('');
    byAnswers.set(key, [...(byAnswers.get(key) ?? []), c.id]);
  }
  for (const ids of byAnswers.values()) {
    if (ids.length > 1) errors.push(`Personajes indistinguibles con estas preguntas: ${ids.join(', ')}`);
  }

  const asked = new Set(deck.questions.map((q) => q.attributeId));
  for (const a of deck.attributes) {
    if (!asked.has(a.id)) warnings.push(`El atributo ${a.id} no tiene ninguna pregunta`);
  }
  for (const c of deck.characters) {
    if (!ALLOWED_LICENSES.test(c.photo.license)) {
      errors.push(`La foto de ${c.id} tiene una licencia no admitida: ${c.photo.license}`);
    }
    if (options.photoExists && !options.photoExists(c.photo.file)) {
      errors.push(`Falta la foto procesada de ${c.id}: ${c.photo.file} (ejecuta pnpm procesar-fotos)`);
    }
  }

  return { errors, warnings, counts };
}
