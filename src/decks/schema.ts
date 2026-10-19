import { z } from 'zod';

// Esquema de una baraja (docs/data-model.md). El equilibrio (M-10) lo comprueba el validador de
// barajas; aquí solo la forma de los datos y su coherencia interna.

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color hex de 6 dígitos');
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Identificador en kebab-case');

export const boardColorSchema = z.object({
  id: slug,
  label: z.string().min(1),
  base: hex,
  shade: hex,
});

export const attributeSchema = z.object({
  id: slug,
  kind: z.enum(['identidad', 'trayectoria', 'ideologia']),
  source: z.string().min(1),
  /** Reparto principal de la baraja (sexo, bloque): el validador lo exige más ajustado. */
  core: z.boolean().optional(),
});

export const questionSchema = z.object({
  id: slug,
  attributeId: slug,
  text: z.string().min(1),
});

export const photoSchema = z.object({
  file: z.string().min(1),
  original: z.string().min(1),
  author: z.string().min(1),
  license: z.string().min(1),
  licenseUrl: z.url(),
  sourceUrl: z.url(),
  crop: z.object({
    eyeX: z.number().min(0).max(1),
    eyeY: z.number().min(0).max(1),
    scale: z.number().positive(),
  }),
});

export const characterSchema = z.object({
  id: slug,
  name: z.string().min(1),
  fullName: z.string().min(1),
  role: z.string().min(1),
  attributes: z.record(z.string(), z.boolean()),
  /** Dónde se ha contrastado cada dato del personaje: al menos dos fuentes. */
  sources: z.array(z.url()).min(2, 'Cada personaje necesita al menos dos fuentes'),
  photo: photoSchema,
});

export const deckSchema = z
  .object({
    id: slug,
    name: z.string().min(1),
    version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Versión semver'),
    dataAsOf: z.iso.date(),
    boardColors: z.array(boardColorSchema).min(2),
    defaultColors: z.object({ player: slug, rival: slug }),
    attributes: z.array(attributeSchema).min(1),
    questions: z.array(questionSchema).min(1),
    characters: z.array(characterSchema).min(2),
  })
  .superRefine((deck, ctx) => {
    const issue = (message: string, path: (string | number)[]) =>
      ctx.addIssue({ code: 'custom', message, path });

    const duplicated = (ids: string[]) => ids.filter((id, i) => ids.indexOf(id) !== i);
    for (const [key, ids] of [
      ['boardColors', deck.boardColors.map((c) => c.id)],
      ['attributes', deck.attributes.map((a) => a.id)],
      ['questions', deck.questions.map((q) => q.id)],
      ['characters', deck.characters.map((c) => c.id)],
    ] as const) {
      for (const id of duplicated([...ids])) issue(`Identificador repetido: ${id}`, [key]);
    }

    const colorIds = new Set(deck.boardColors.map((c) => c.id));
    for (const who of ['player', 'rival'] as const) {
      if (!colorIds.has(deck.defaultColors[who])) {
        issue(`Color por defecto inexistente: ${deck.defaultColors[who]}`, ['defaultColors', who]);
      }
    }

    const attributeIds = deck.attributes.map((a) => a.id);
    deck.questions.forEach((q, i) => {
      if (!attributeIds.includes(q.attributeId)) {
        issue(`La pregunta ${q.id} apunta a un atributo inexistente: ${q.attributeId}`, [
          'questions',
          i,
          'attributeId',
        ]);
      }
    });

    deck.characters.forEach((c, i) => {
      for (const id of attributeIds) {
        if (!(id in c.attributes)) issue(`${c.id} no tiene valor para ${id}`, ['characters', i]);
      }
      for (const id of Object.keys(c.attributes)) {
        if (!attributeIds.includes(id)) issue(`${c.id} tiene un atributo desconocido: ${id}`, ['characters', i]);
      }
    });
  });

export type BoardColor = z.infer<typeof boardColorSchema>;
export type Attribute = z.infer<typeof attributeSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Character = z.infer<typeof characterSchema>;
export type Deck = z.infer<typeof deckSchema>;
