import { deckSchema, type Deck } from '../decks/schema';

// Baraja pequeña solo para los tests del motor: 8 personajes con los 8 combinaciones posibles de
// tres atributos, así cada personaje queda identificado con exactamente tres preguntas.

const photo = (id: string) => ({
  file: `${id}.webp`,
  original: `${id}.jpg`,
  author: 'Prueba',
  license: 'CC0',
  licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  sourceUrl: `https://example.org/${id}`,
  crop: { eyeX: 0.5, eyeY: 0.4, scale: 1 },
});

const people: [id: string, a: boolean, b: boolean, c: boolean][] = [
  ['ana', true, true, true],
  ['bea', true, true, false],
  ['carla', true, false, true],
  ['dora', true, false, false],
  ['eloy', false, true, true],
  ['fede', false, true, false],
  ['gil', false, false, true],
  ['hugo', false, false, false],
];

export const testDeck: Deck = deckSchema.parse({
  id: 'prueba',
  name: 'Baraja de prueba',
  version: '1.0.0',
  dataAsOf: '2026-10-16',
  boardColors: [
    { id: 'rojo', label: 'Rojo', base: '#c8262c', shade: '#8f1a1f' },
    { id: 'azul', label: 'Azul', base: '#2f86c9', shade: '#1f5f93' },
  ],
  defaultColors: { player: 'rojo', rival: 'azul' },
  attributes: [
    { id: 'mujer', kind: 'identidad', source: 'prueba' },
    { id: 'ministro', kind: 'trayectoria', source: 'prueba' },
    { id: 'republica', kind: 'ideologia', source: 'prueba' },
  ],
  questions: [
    { id: 'q-mujer', attributeId: 'mujer', text: { neutral: '¿Es mujer?', humor: '¿Es mujer, mujer?' } },
    { id: 'q-ministro', attributeId: 'ministro', text: { neutral: '¿Ha sido ministro?', humor: '¿Ha tenido coche oficial?' } },
    { id: 'q-republica', attributeId: 'republica', text: { neutral: '¿Su partido defiende la república?', humor: '¿Le sobra el rey?' } },
  ],
  characters: people.map(([id, mujer, ministro, republica]) => ({
    id,
    name: id.toUpperCase(),
    fullName: id,
    role: 'Personaje de prueba',
    attributes: { mujer, ministro, republica },
    photo: photo(id),
  })),
});
