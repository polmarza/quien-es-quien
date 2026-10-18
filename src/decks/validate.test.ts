import { describe, expect, it } from 'vitest';
import type { Deck } from './schema';
import { validateDeck } from './validate';

// Baraja sintética de 24 personajes: el atributo bK es el bit K del índice, así todos son distintos
// y los repartos son 12, 12, 12, 8 y 8.
function balancedDeck(): Deck {
  const bits = [0, 1, 2, 3, 4];
  return {
    id: 'sintetica',
    name: 'Sintética',
    version: '1.0.0',
    dataAsOf: '2026-10-16',
    boardColors: [
      { id: 'rojo', label: 'Rojo', base: '#c8262c', shade: '#8f1a1f' },
      { id: 'azul', label: 'Azul', base: '#2f86c9', shade: '#1f5f93' },
    ],
    defaultColors: { player: 'rojo', rival: 'azul' },
    attributes: bits.map((k) => ({ id: `b${k}`, kind: 'trayectoria' as const, source: 'prueba', core: k < 2 })),
    questions: bits.map((k) => ({ id: `q-b${k}`, attributeId: `b${k}`, text: `¿Bit ${k}?` })),
    characters: Array.from({ length: 24 }, (_, i) => ({
      id: `p${i}`,
      name: `P${i}`,
      fullName: `Persona ${i}`,
      role: 'Prueba',
      attributes: Object.fromEntries(bits.map((k) => [`b${k}`, ((i >> k) & 1) === 1])),
      sources: [`https://example.org/${i}`, `https://example.org/${i}/b`],
    })),
  };
}

describe('M-10 validador de equilibrio', () => {
  it('M-10 acepta una baraja equilibrada y cuenta los "sí" de cada pregunta', () => {
    const report = validateDeck(balancedDeck());
    expect(report.errors).toEqual([]);
    expect(report.counts).toEqual({ 'q-b0': 12, 'q-b1': 12, 'q-b2': 12, 'q-b3': 8, 'q-b4': 8 });
  });

  it('M-10 (negativo) falla y nombra la pregunta que solo cumplen 3 personajes', () => {
    const deck = balancedDeck();
    deck.characters.forEach((c, i) => (c.attributes.b4 = i < 3));
    expect(validateDeck(deck).errors).toContain('La pregunta q-b4 la cumplen 3 de 24; debe estar entre 8 y 16');
  });

  it('M-10 (negativo) falla si una pregunta la cumplen más de 16', () => {
    const deck = balancedDeck();
    deck.characters.forEach((c, i) => (c.attributes.b3 = i < 17));
    expect(validateDeck(deck).errors).toContain('La pregunta q-b3 la cumplen 17 de 24; debe estar entre 8 y 16');
  });

  it('M-10 (negativo) exige repartos principales entre 10 y 14', () => {
    const deck = balancedDeck();
    deck.characters.forEach((c, i) => (c.attributes.b0 = i < 15));
    expect(validateDeck(deck).errors).toContain('El reparto de b0 es de 15 de 24; debe estar entre 10 y 14');
  });

  it('M-10 (negativo) detecta personajes indistinguibles', () => {
    const deck = balancedDeck();
    const [first, second] = deck.characters;
    if (!first || !second) throw new Error('Baraja sintética vacía');
    second.attributes = { ...first.attributes };
    expect(validateDeck(deck).errors).toContain('Personajes indistinguibles con estas preguntas: p0, p1');
  });

  it('M-10 (negativo) exige exactamente 24 personajes', () => {
    const deck = balancedDeck();
    deck.characters = deck.characters.slice(0, 20);
    expect(validateDeck(deck).errors).toContain('La baraja tiene 20 personajes y deben ser 24');
  });

  it('M-10 (negativo) exige al menos dos fuentes por personaje', () => {
    const deck = balancedDeck();
    const [first] = deck.characters;
    if (!first) throw new Error('Baraja sintética vacía');
    first.sources = ['https://example.org/solo-una'];
    expect(validateDeck(deck).errors).toEqual([expect.stringContaining('Cada personaje necesita al menos dos fuentes')]);
  });

  it('avisa, sin fallar, de personajes sin foto y atributos sin pregunta', () => {
    const deck = balancedDeck();
    deck.attributes.push({ id: 'suelto', kind: 'trayectoria', source: 'prueba' });
    deck.characters.forEach((c) => (c.attributes.suelto = false));
    const report = validateDeck(deck);
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual(['El atributo suelto no tiene ninguna pregunta', '24 personajes sin foto todavía (M-11)']);
  });
});
