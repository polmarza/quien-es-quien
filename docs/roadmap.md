# Roadmap

<!-- Planificación de fases de desarrollo. No es un calendario con fechas exactas,
     sino una guía de prioridades.
     Actualizar cuando algo pase de una fase a otra, o cuando se redefinan las prioridades. -->

---

## Fase 1 — MVP: contra la máquina (nivel 1)

Una partida completa contra la máquina, en local y luego publicada en Cloudflare. Orden de
construcción previsto:

- [ ] **Andamiaje:** Vite + React + TypeScript, Vitest, Playwright, tokens del design system como
      variables CSS, `wrangler.jsonc`.
- [ ] **Motor del juego** (sin interfaz): reparto con semilla, turnos, preguntas, fichas que
      encajan, adivinar, fin de partida y la máquina en modo fácil — M-02, M-03, M-06, M-08, M-09.
- [ ] **Baraja `politicos-es`:** datos con fuente de los 24 personajes, preguntas en los dos tonos
      y validador de equilibrio — M-10, M-12 (textos).
- [ ] **Fotos:** búsqueda de fotos con licencia, script de procesado y créditos — M-11.
- [ ] **Tablero 3D:** vista a 45°, fichas con bisagra, caída en cascada, bajar y levantar a mano —
      M-01, M-04, M-05.
- [ ] **Partida jugable:** pantalla de inicio con tono, carta secreta, lista de preguntas,
      contador del rival, adivinar y pantalla final — M-07, M-12.
- [ ] **Revisión del prototipo:** ajustar ángulo, cámara y aspecto del plástico a ojo.
- [ ] **Publicación:** repo en GitHub conectado a Cloudflare (lo hace el usuario).

**Objetivo de validación:** saber si una partida contra la máquina es divertida y dura lo que
esperamos (5–10 minutos), si las preguntas se entienden sin ambigüedad y si la vista 3D se lee
bien en el móvil.

---

## Fase 2 — Mejora sobre validación

Se concreta al terminar la fase 1, con lo que se aprenda jugando. Candidatos:

- [ ] Más variedad de preguntas (trayectoria e ideología que crucen bloques), siempre pasando el
      validador.
- [ ] Máquina con dificultad "Difícil" — S-01.
- [ ] Historial de preguntas — S-03.
- [ ] Ficha ampliada de cada personaje — S-04.
- [ ] Girar el tablero en escritorio — S-05.
- [ ] Elegir el color del tablero — C-05.
- [ ] Sonido de las fichas — C-04.
- [ ] Actualizar cargos y `dataAsOf` cuando haya cambios políticos relevantes.

---

## Fase 3 — Multijugador y más barajas

- [ ] Jugar contra otra persona por enlace (nivel 2): Worker + Durable Object que arbitra con el
      mismo motor — C-01.
- [ ] Salas con código para crear y unirse a partidas (nivel 3) — C-02.
- [ ] Barajas de otros temas y selector de baraja — C-03.

---

## Descartado (con motivo)

| Funcionalidad | Motivo del descarte |
|---------------|---------------------|
| Preguntas físicas (gafas, barba, pelo…) | Decisión del usuario: solo se pregunta el sexo como rasgo personal; el resto, datos de trayectoria e ideología del partido. |
| Preguntas libres o respuestas con IA | La máquina tiene que poder responder sin error sobre personas reales. |
| Caras generadas con IA | Los personajes son personas reales. |
| Dibujar el tablero del rival | Basta una ficha con el número de fichas que le quedan. |
| Cuentas, rankings y monetización | El juego es gratuito y sin registro. |
