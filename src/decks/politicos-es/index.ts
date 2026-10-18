import { deckSchema } from '../schema';
import raw from './deck.json';

/** Baraja de políticos de España, validada con el esquema al cargarla. */
export const politicosEs = deckSchema.parse(raw);
