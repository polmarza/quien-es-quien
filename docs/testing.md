# Estrategia de testing

<!-- Documento vivo. Actualizar cuando cambie el stack o las convenciones de testing.
     Los cambios deben registrarse también en changelog/. -->

---

## Filosofía

El valor está en dos sitios: que las reglas del juego sean correctas (qué fichas caen, de quién
es el turno, quién gana) y que la partida se pueda jugar de principio a fin en el navegador. Las
reglas viven en un motor sin DOM, así que se cubren con muchos tests unitarios rápidos. La
interfaz se cubre con pocos tests E2E que juegan partidas completas. El equilibrio de la baraja es
un script con sus propios tests.

---

## Cuándo se escriben los tests

**Después de implementar, en una pasada propia.** No durante la planificación, y no a la vez que
el código.

El compromiso de que un requisito se va a validar se adquiere antes: es la tercera columna de la
tabla de cobertura de `docs/features/`. Pero el test en sí se escribe cuando el código ya existe,
leyéndolo. Es una diferencia de calendario pequeña con una consecuencia grande: un test escrito
antes que el código apunta a selectores, rutas y respuestas *imaginados*. Cuando luego no
coinciden con la realidad, casi nadie reescribe el test — se le van quitando aserciones hasta que
pasa, y acaba siendo un test que no comprueba nada pero que da luz verde. Escrito después, apunta
a lo que hay.

Reglas que se derivan de eso:

- **Antes de escribir una aserción, verifica que el selector existe en el código.** No lo
  supongas por el nombre del componente.
- **Si un elemento no tiene selector estable, añádele uno.** Meter un `data-testid` en el código
  es un cambio mínimo aceptable y preferible a colgar el test de una clase de estilos o de un
  texto que cambiará con el próximo ajuste de copy.
- **Cada "entonces" del criterio de aceptación necesita al menos una aserción.** Si el criterio
  define caso negativo, va su propio test.
- **Un test que falla no se arregla quitándole aserciones.** Si falla, o el código está mal o el
  criterio estaba mal escrito. Ambas cosas se corrigen donde toca; degradar el test para forzar el
  verde convierte la suite en decoración.
- **Los datos que crea un test los borra ese test.** Prefija lo que insertes para poder
  identificarlo y limpia al terminar, aunque el test falle a mitad.

---

## Stack de testing

| Tipo | Herramienta |
|------|-------------|
| Unitario | Vitest (motor, máquina, validación de baraja) |
| Integración | Vitest + Testing Library (componentes con estado: lista de preguntas, contador) |
| E2E | Playwright contra `localhost` (`pnpm preview`): Chromium escritorio y Chromium con emulación de móvil; WebKit móvil se añade con los E2E de la partida |

---

## Qué testear

### Sí testear
- Motor: reparto de secretos, turnos, respuesta a cada pregunta, qué fichas se marcan, adivinar y
  fin de partida.
- Máquina: que responde siempre la verdad sobre su secreto y que en "Difícil" elige la pregunta
  que mejor parte sus fichas.
- Baraja: esquema válido, equilibrio de cada pregunta (8–16 de 24) y de los repartos principales,
  y que toda foto tiene autor, licencia y fuente.
- E2E: partida completa ganada y perdida, bajar y levantar a mano, contador del
  rival, página de créditos.
- Partidas deterministas: el motor acepta una semilla para el azar, así los tests saben qué
  secreto tiene cada uno.

### No testear (o mockear)
- La calidad visual de la animación y el ángulo de la cámara: se revisan a ojo en el prototipo.
  Los E2E se ejecutan con `prefers-reduced-motion: reduce` para no depender de los tiempos de
  animación.
- El procesado de fotos con `sharp`: se revisa el resultado visualmente; se testea solo el cálculo
  del recorte.

---

## Convenciones

- Unitarios junto al código: `src/engine/turnos.test.ts`.
- E2E en `tests/e2e/`, un archivo por flujo: `partida-contra-maquina.spec.ts`.
- El nombre del test empieza por el ID del requisito: `"M-04 baja las fichas que no encajan"`.
- Descripciones en presente y en español.
- Selectores E2E por rol accesible o `data-testid`, nunca por clases CSS.

---

## Cobertura objetivo

≥ 90% de líneas en `src/engine/` y en el script de validación de baraja. Sin objetivo numérico en
la interfaz: la cubren los E2E por requisito.

---

## En CI

`.github/workflows/tests.yml` ejecuta `pnpm build` (que incluye la comprobación de tipos),
`pnpm test` y `pnpm validar-baraja` en cada pull request y en cada push a `main`. `.github/workflows/cobertura.yml`
verifica las tablas de cobertura de `docs/features/`. Los E2E se añadirán a CI con los de la
partida.

## Cómo correr los tests

```bash
# Todos los tests unitarios y de integración
pnpm test

# Modo watch
pnpm test:watch

# Con cobertura
pnpm test:coverage

# E2E (levanta el build en localhost)
pnpm test:e2e

# Validar el equilibrio de las barajas
pnpm validar-baraja
```
