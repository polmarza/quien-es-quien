import { describe, expect, it } from 'vitest';
import { testDeck } from '../engine/test-deck';
import { deckSchema } from './schema';

const messages = (input: unknown) => {
  const result = deckSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => i.message);
};

describe('esquema de baraja', () => {
  it('acepta una baraja coherente', () => {
    expect(messages(testDeck)).toEqual([]);
  });

  it('(negativo) rechaza identificadores repetidos', () => {
    const deck = { ...testDeck, characters: [...testDeck.characters, testDeck.characters[0]] };
    expect(messages(deck)).toContain('Identificador repetido: ana');
  });

  it('(negativo) rechaza un color por defecto que no existe', () => {
    const deck = { ...testDeck, defaultColors: { player: 'verde', rival: 'azul' } };
    expect(messages(deck)).toContain('Color por defecto inexistente: verde');
  });

  it('(negativo) rechaza preguntas que apuntan a un atributo inexistente', () => {
    const deck = {
      ...testDeck,
      questions: [...testDeck.questions, { id: 'q-gafas', attributeId: 'gafas', text: { neutral: 'a', humor: 'b' } }],
    };
    expect(messages(deck)).toContain('La pregunta q-gafas apunta a un atributo inexistente: gafas');
  });

  it('(negativo) rechaza personajes con atributos sin valor o desconocidos', () => {
    const [first, ...rest] = testDeck.characters;
    if (!first) throw new Error('Baraja de prueba vacía');
    const broken = { ...first, attributes: { mujer: true, ministro: true, gafas: true } };
    expect(messages({ ...testDeck, characters: [broken, ...rest] })).toEqual(
      expect.arrayContaining(['ana no tiene valor para republica', 'ana tiene un atributo desconocido: gafas']),
    );
  });

  it('(negativo) exige autor, licencia y fuente en cada foto', () => {
    const [first, ...rest] = testDeck.characters;
    if (!first) throw new Error('Baraja de prueba vacía');
    const noCredit = { ...first, photo: { ...first.photo, author: '', sourceUrl: 'no-es-una-url' } };
    expect(deckSchema.safeParse({ ...testDeck, characters: [noCredit, ...rest] }).success).toBe(false);
  });
});
