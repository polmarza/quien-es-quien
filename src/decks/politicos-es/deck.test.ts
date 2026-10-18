import { describe, expect, it } from 'vitest';
import { validateDeck } from '../validate';
import raw from './deck.json';
import { politicosEs as deck } from './index';

const yes = (attributeId: string) => deck.characters.filter((c) => c.attributes[attributeId]).map((c) => c.id);

describe('baraja politicos-es', () => {
  it('M-10 pasa el validador sin errores', () => {
    expect(validateDeck(raw).errors).toEqual([]);
  });

  it('M-10 tiene 24 personajes: 12 mujeres y 12 de izquierda, 6 y 6 en cada bloque', () => {
    expect(deck.characters).toHaveLength(24);
    const women = new Set(yes('mujer'));
    const left = new Set(yes('izquierda'));
    expect(women.size).toBe(12);
    expect(left.size).toBe(12);
    expect([...left].filter((id) => women.has(id))).toHaveLength(6);
  });

  it('M-10 cada personaje tiene al menos dos fuentes', () => {
    for (const c of deck.characters) expect(c.sources.length, c.id).toBeGreaterThanOrEqual(2);
  });

  it('M-10 no pregunta por el aspecto físico: los atributos son de identidad, trayectoria o ideología', () => {
    for (const a of deck.attributes) expect(['identidad', 'trayectoria', 'ideologia']).toContain(a.kind);
    expect(deck.attributes.filter((a) => a.kind === 'identidad').map((a) => a.id)).toEqual(['mujer', 'izquierda']);
  });

  it('M-10 cada pregunta es una sola pregunta de sí o no, sin alternativas', () => {
    expect(deck.questions.length).toBeGreaterThanOrEqual(10);
    for (const q of deck.questions) {
      expect(q.text, q.id).toMatch(/^¿[^?]+\?$/);
      expect(q.text, q.id).not.toMatch(/ o /);
    }
  });

  it('datos contrastados de referencia', () => {
    // Comprobaciones puntuales de datos verificados con dos fuentes (ver docs/features/baraja-politicos.md).
    expect(yes('consejo-ministros').sort()).toEqual(
      ['alberto-garzon', 'esperanza-aguirre', 'irene-montero', 'maria-jesus-montero', 'mariano-rajoy', 'monica-garcia',
        'oscar-puente', 'pablo-iglesias', 'pedro-sanchez', 'salvador-illa', 'yolanda-diaz'].sort(),
    );
    expect(yes('apoyo-investidura-sanchez')).toContain('albert-rivera');
    expect(yes('concejal')).toContain('gabriel-rufian');
    expect(deck.dataAsOf).toBe('2026-10-16');
  });
});
