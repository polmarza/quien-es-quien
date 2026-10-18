# Baraja de políticos de España

**Estado:** Verificada
**Requisitos que cierra:** M-10
**Fecha de acuerdo:** 2026-10-16

## Qué se construye

La primera baraja real, `src/decks/politicos-es/deck.json`: los 24 políticos de
`docs/data-model.md`, cada uno con su nombre, cargo a fecha de hoy y el valor de cada atributo
(sexo, bloque, trayectoria e ideología del partido), con las fuentes de las que sale cada dato. Las
preguntas de la lista cerrada, entre 12 y 16, en tono neutral.

Y el validador, `pnpm validar-baraja`, que comprueba cualquier baraja de `src/decks/`: esquema,
equilibrio de cada pregunta (8–16 de 24), repartos de sexo y bloque (10–14), que no haya dos
personajes indistinguibles y que cada personaje tenga al menos dos fuentes. Si algo no cuadra, falla y
dice qué pregunta o qué personaje.


## Decisiones tomadas

- **Cada dato se contrasta con al menos dos fuentes fiables, preferiblemente oficiales**
  (Congreso, Senado, Parlamento Europeo, La Moncloa, BOE, parlamentos autonómicos, webs y
  programas de los partidos; Wikipedia solo como apoyo, nunca como única fuente). Cada personaje
  lleva su lista de fuentes (`sources`, mínimo dos) y el validador lo exige. Se añade al modelo de
  datos en esta feature.
- **Los datos se buscan y comprueban en la web, no de memoria**: los cargos cambian y la
  información del agente tiene fecha de corte. `dataAsOf` es la fecha en que se comprueban.
- **El usuario confía en el contraste de fuentes y no revisa dato a dato.** Aun así, el PR incluye
  la tabla de los 24 personajes con todos sus valores, para dejar constancia. Si dos fuentes no
  coinciden o la respuesta es discutible, el dato no se fuerza: se cambia la pregunta.
- **Si una pregunta no pasa el validador, se cambia la pregunta antes que la lista de políticos.**
  Si no hay manera, se recurre a los suplentes de `docs/data-model.md`, avisando al usuario.
- **Sin tono humor** (decisión del usuario del 2026-10-18, a mitad de construcción): las preguntas
  van solo en tono neutral y M-12 sale del PRD. Se quitó de la baraja, el esquema y el motor.
- **Una sola pregunta por texto:** nada de alternativas con "o". Las dos preguntas compuestas
  ("presidente autonómico o alcalde" y "PSOE (o PSC) o PP") no pasaban el equilibrio divididas
  (6, 5, 4 y 6), así que se sustituyeron por "¿Ha ocupado escaño en un parlamento autonómico?"
  y "¿Nació en una comunidad autónoma con lengua cooficial?", con el visto bueno del usuario.
- **Ada Colau sustituye a Ione Belarra** (avisado al usuario): con las preguntas que pasan las
  reglas, Belarra e Irene Montero tenían exactamente las mismas respuestas.
- **12 preguntas, no las de la propuesta inicial tal cual:** se descartaron las ambiguas o
  dependientes del momento (líder del partido, cargo actual, república, escaño en el Congreso) y se
  añadieron "¿Nació en los años setenta?", "¿Estudió Derecho?" y "¿Ha sido concejal?". La lista y el motivo de cada descarte están en
  `docs/data-model.md`.
- **El contraste encontró un dato que de memoria habría salido mal:** Gabriel Rufián fue concejal
  en Santa Coloma de Gramenet hasta enero de 2025.
- **Las fotos no entran aquí** (feature propia, M-11). El campo `photo` pasa a ser opcional en el
  esquema hasta entonces; la feature de las fotos lo vuelve obligatorio.

## Cobertura

| Requisito | Se implementa en | Se valida con |
|-----------|------------------|---------------|
| M-10 | `src/decks/validate.ts`, `scripts/validar-baraja.ts`, `src/decks/politicos-es/deck.json` | `src/decks/validate.test.ts`, `src/decks/politicos-es/deck.test.ts` |

## Fuera de esta feature

- Fotos, su procesado y la página de créditos (M-11).
- Cualquier pantalla del juego.
- Colores de tablero elegibles por partido (C-05): la baraja incluye solo rojo y azul por defecto.
- Más barajas de otros temas (C-03).
