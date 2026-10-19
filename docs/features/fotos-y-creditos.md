# Fotos de los personajes y créditos

**Estado:** Verificada
**Requisitos que cierra:** M-11
**Fecha de acuerdo:** 2026-10-18

## Qué se construye

Una foto real para cada uno de los 24 políticos de la baraja, todas con licencia que permita
reutilizarlas y con el mismo aspecto: busto, ojos a la misma altura, fondo uniforme `#D6DCE1` y
una corrección suave de luz. Se sirven en WebP a 300×400 y 600×800.

Un script, `pnpm procesar-fotos`, descarga los originales de Wikimedia Commons, los recorta con
las coordenadas guardadas en `deck.json`, quita el fondo y exporta las versiones finales. Se puede
volver a ejecutar en cualquier momento y da el mismo resultado.

Y la página de créditos (`/creditos`), donde cada foto aparece con su autor, su licencia, el enlace
a la fuente original y una nota de qué se ha modificado.

## Decisiones tomadas

- **Solo Wikimedia Commons**, con licencias CC BY, CC BY-SA, CC0 o dominio público. Muchas fotos de
  políticos que hay allí vienen del Parlamento Europeo, de La Moncloa o de parlamentos autonómicos
  y llevan la licencia indicada en Commons. Una foto sin licencia clara se descarta.
- **Criterios para elegir cada foto:** de frente o casi, expresión neutra, reciente si es posible
  y con la cara a buena resolución. Ningún criterio favorece ni perjudica a nadie: la foto debe
  ser de las "normales" de esa persona, ni la mejor ni la peor.
- **Antes de procesar las 24 fotos, el usuario ve una hoja de contactos** con las elegidas y da el
  visto bueno o pide cambios.
- **Quitar el fondo con `rembg`** (licencia MIT, se ejecuta en local con Python). Su modelo se
  descarga una vez (unos 170 MB, desde el repositorio oficial del proyecto). No se usa
  `@imgly/background-removal`, que tiene licencia AGPL.
- **La cara no se toca:** solo recorte, fondo, exposición y balance de blancos. Nada de IA
  generativa ni retoques de rasgos.
- **Las modificaciones se declaran** en los créditos ("recortada, fondo sustituido y luz
  corregida"), como piden las licencias CC. Las fotos derivadas de una CC BY-SA mantienen esa
  licencia.
- **Los originales no se suben al repo** (`fotos-originales/` en `.gitignore`): pesan demasiado y se
  pueden volver a descargar con la URL guardada en `deck.json`. Las fotos procesadas sí se suben
  (unos 2 MB en total).
- **El recorte se ajusta a mano:** para cada foto se guarda en `deck.json` el punto entre los ojos
  y la escala, mirando la imagen.
- **Punto de partida, la foto principal de Wikidata** de cada político (un retrato ya elegido por la
  comunidad), sustituida por otra de Commons cuando no servía: Yolanda Díaz (foto horizontal),
  Ana Pontón, Feijóo y Rivera (poca resolución), Rufián (cara pequeña), Monasterio (gente detrás),
  Arrimadas (mirando hacia arriba) y Juanma Moreno (un adorno del fondo quedaba pegado a la
  silueta).
- **OpenCV para los ojos:** el recorte lo propone `scripts/detectar-ojos.py` (OpenCV 4, licencia
  Apache 2.0, en el mismo entorno de Python), limitado para que el encuadre nunca se salga del
  original. Las fotos que ya venían muy recortadas (Yolanda Díaz, Ana Pontón) quedan algo más
  cerca que el resto.
- **Licencia "Attribution" admitida:** es la plantilla de Commons de las fotos de La Moncloa y la
  Generalitat, que permiten reutilizar citando la fuente.
- **Al terminar, `photo` vuelve a ser obligatorio** en el esquema, y el validador comprueba que la
  licencia esté en la lista de admitidas y que el archivo exista.

## Cobertura

| Requisito | Se implementa en | Se valida con |
|-----------|------------------|---------------|
| M-11 | `src/decks/politicos-es/deck.json` (créditos), `scripts/procesar-fotos.ts`, `src/ui/screens/Creditos.tsx` | `src/decks/politicos-es/deck.test.ts`, `tests/e2e/creditos.spec.ts` |

## Fuera de esta feature

- El tablero y las fichas: aquí solo se preparan las imágenes y la página de créditos.
- Fotos de otras barajas.
- Ajustes de estética de la ficha: se revisan con el prototipo del tablero.
