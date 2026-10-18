# Product Requirements Document (PRD)

<!-- Fuente de verdad sobre qué construimos y por qué.
     Actualizar este archivo cuando cambie el alcance, las funcionalidades o el usuario objetivo.
     Si algo se mueve a "fuera de alcance", no borrar: mover a la sección correspondiente. -->

---

## Resumen ejecutivo

Juego de navegador del estilo "¿quién es quién?" con políticos españoles como personajes. Cada
jugador tiene un tablero de 24 fichas fotorrealistas y un personaje secreto; por turnos se hacen
preguntas de sí/no de una lista cerrada y se bajan las fichas que ya no encajan hasta que alguien
adivina al personaje del rival.

La primera versión se juega contra la máquina, en local y después publicada en Cloudflare. Más
adelante se añade jugar contra otra persona (nivel 2) y salas para crear partidas (nivel 3). Es
gratuito y sin cuentas de usuario.

La primera baraja es de políticos de España de todo el espectro, elegidos para que el tablero
esté equilibrado: más o menos la mitad hombres y mujeres, la mitad izquierda y derecha, y cada
pregunta disponible parte el tablero en dos mitades parecidas. La estructura admite más barajas
temáticas en el futuro (otros temas además de política): la baraja define sus personajes, sus
preguntas y su lista de colores de tablero.

---

## Problema que resuelve

El "¿quién es quién?" clásico tiene dos defectos: algunas preguntas descartan casi todo el
tablero de golpe (el rasgo lo tienen dos o tres personajes), y los personajes son caricaturas sin
interés propio. Este juego usa personajes reales que el jugador reconoce, y diseña la baraja para
que todas las preguntas sean útiles: ganar depende de elegir bien qué preguntar, no de tener
suerte con un rasgo raro.

---

## Usuario objetivo

**Jugador casual con interés por la actualidad.** Adulto, en España, que reconoce a buena parte de
la clase política y busca una partida corta (5–10 minutos) en el móvil o en el ordenador, solo o
con alguien. No quiere registrarse ni instalar nada.

---

## Funcionalidades core (MoSCoW)

### MUST
- **[M-01] Tablero con 24 fichas** — Dado que empieza una partida, cuando se carga el tablero,
  entonces se ven 24 fichas levantadas en una cuadrícula de 6×4, cada una con foto y nombre.
- **[M-02] Personaje secreto** — Dado que empieza una partida, cuando se reparte, entonces el
  jugador ve su personaje secreto aparte del tablero, y la máquina tiene asignado otro al azar
  que el jugador no ve.
- **[M-03] Preguntar de una lista cerrada** — Dado que es el turno del jugador, cuando elige una
  pregunta de la lista, entonces ve la respuesta (sí/no) de la máquina sobre su personaje secreto.
  *Negativo:* dado que no es el turno del jugador, cuando intenta preguntar, entonces la lista
  está deshabilitada.
- **[M-04] Bajar fichas automáticamente** — Dada una respuesta a la pregunta del jugador, cuando
  se recibe, entonces se marcan las fichas que no encajan y, al confirmar, caen hacia atrás con
  animación; las que encajan siguen levantadas.
- **[M-05] Bajar y levantar a mano** — Dado el tablero propio, cuando el jugador pulsa una ficha,
  entonces se baja si estaba levantada y se levanta si estaba bajada.
- **[M-06] Turno de la máquina** — Dado que es el turno de la máquina, cuando pregunta, entonces
  el jugador ve la pregunta y la respuesta correcta sobre su personaje la da el juego
  automáticamente (el jugador no puede mentir).
- **[M-07] Contador del rival** — Dada una partida en curso, cuando la máquina baja fichas,
  entonces la ficha única de la parte superior, que representa al rival, muestra el número de
  fichas que le quedan levantadas. El tablero del rival no se dibuja.
- **[M-08] Adivinar** — Dado que es el turno del jugador, cuando elige "Adivinar" y un personaje,
  entonces gana si acierta; si falla, pierde la partida.
- **[M-09] Fin de partida** — Dado que alguien acierta o falla al adivinar, cuando termina la
  partida, entonces se muestra quién ha ganado, los dos personajes secretos y un botón para jugar
  otra.
- **[M-10] Baraja equilibrada** — Dada la baraja de políticos, cuando se ejecuta el script de
  validación, entonces cada pregunta de la lista divide las 24 fichas en grupos de entre 8 y 16,
  y el reparto hombre/mujer e izquierda/derecha está entre 10 y 14.
  *Negativo:* dada una pregunta que solo cumplen 3 personajes, cuando se valida, entonces el
  script falla y nombra la pregunta.
- **[M-11] Créditos de las fotos** — Dada cualquier foto del juego, cuando se abre la página de
  créditos, entonces aparece su autor, licencia y enlace a la fuente original.

### SHOULD
- **[S-01] Máquina con niveles de dificultad** — Dado el nivel "Fácil", cuando la máquina
  pregunta, entonces elige preguntas al azar; en "Difícil", elige la que más se acerca a partir sus
  fichas levantadas por la mitad.
- **[S-03] Historial de preguntas** — Dada una partida en curso, cuando se abre el historial,
  entonces aparecen todas las preguntas hechas por ambos jugadores con su respuesta.
- **[S-04] Ficha de cada personaje** — Dado el tablero o la página de personajes, cuando el
  jugador mantiene pulsada una ficha o abre un personaje, entonces ve su foto, nombre completo,
  partido, cargo, la fecha de los datos y un texto breve que se lee de corrido y contiene la
  respuesta a cada pregunta del juego.
  *Negativo:* dado un personaje cuyo texto no cubre alguna de las preguntas de la baraja, cuando
  se validan las barajas, entonces falla y dice qué pregunta falta.

- **[S-05] Girar el tablero en escritorio** — Dado un navegador de escritorio, cuando el jugador
  arrastra sobre el tablero, entonces este gira como máximo ±25° a los lados sin mostrar nunca el
  dorso de las fichas, y al soltar vuelve a la posición inicial.
  *Negativo:* dado un móvil, cuando el jugador arrastra sobre el tablero, entonces la cámara no se
  mueve.

### COULD
- **[C-01] Jugar contra otra persona (nivel 2)** — Dados dos jugadores con el mismo enlace de
  partida, cuando ambos entran, entonces juegan por turnos en tiempo real, y el personaje secreto
  de cada uno solo lo conoce el servidor.
- **[C-02] Salas y crear partidas (nivel 3)** — Dado un jugador, cuando crea una sala, entonces
  obtiene un código que otro puede usar para unirse.
- **[C-03] Otras barajas** — Dada la pantalla de inicio, cuando hay más de una baraja, entonces el
  jugador elige con cuál juega.
- **[C-04] Sonido** — Dada una ficha que cae, cuando termina la animación, entonces suena un
  golpe de plástico (desactivable).
- **[C-05] Elegir el color del tablero** — Dada la pantalla de inicio, cuando el jugador elige un
  color de la lista cerrada de la baraja (en la de políticos, colores de partido), entonces su
  tablero se pinta de ese color. Por defecto, rojo para el jugador y azul para el rival.

### WON'T (esta versión)
- Preguntas libres escritas por el jugador ni respuestas generadas por IA.
- Caras generadas con IA de personas reales.
- Cuentas de usuario, rankings o estadísticas guardadas.
- Monetización o publicidad.
- Elegir tono "Neutral" o "Con humor" (antes M-12; ID vacante): decisión del usuario del
  2026-10-18, las preguntas se escriben solo en tono neutral.
- Dibujar el tablero del rival, ni siquiera en miniatura (antes S-02; ID vacante): basta la ficha
  única con el número de fichas que le quedan.

---

## Flujos de usuario principales

**Partida contra la máquina:**
El jugador abre la web, elige dificultad (si existe) y pulsa "Jugar". Ve su tablero de 24
fichas, su personaje secreto y el contador del rival. En su turno elige una pregunta, ve la
respuesta y confirma qué fichas caen. Luego la máquina pregunta, el juego responde por él y el
contador del rival baja. Se repite hasta que uno de los dos adivina. Al final ve quién ha ganado y
puede jugar otra.

---

## Requisitos no funcionales

- **Plataformas:** navegadores actuales de escritorio y móvil; el tablero cabe en una pantalla de
  móvil en vertical sin scroll horizontal.
- **Rendimiento:** la animación de las fichas va a 60 fps en un móvil de gama media; la partida
  carga en menos de 3 segundos en 4G.
- **Sin servidor en el nivel 1:** funciona como web estática.
- **Accesibilidad:** se puede jugar con teclado; las fichas tienen el nombre en texto, no solo en
  la imagen; se respeta `prefers-reduced-motion`.
- **Neutralidad:** la baraja está equilibrada entre bloques y partidos; las preguntas se basan en
  datos comprobables con fuente (trayectoria y programa del partido), nunca en opiniones ni en el
  aspecto físico; el sexo es el único rasgo personal que se pregunta. Cada pregunta es una sola
  pregunta, sin alternativas unidas con "o".
- **Licencias:** solo fotos con licencia que permita reutilizarlas (CC BY, CC BY-SA, dominio
  público o condiciones oficiales que lo permitan), siempre con crédito.
- **Datos fechados:** la baraja lleva la fecha a la que corresponden los cargos.
- **Idioma:** español.

---

## Fuera de alcance (explícito)

- Preguntas libres o respuestas con IA: contra la máquina hace falta una lista que la máquina
  pueda responder, y una IA puede equivocarse con datos de personas reales.
- Generar caras con IA: los personajes son personas reales.
- Cuentas, rankings y monetización.

---

## Decisiones tomadas

- **Nombre: "Quién es quién".** Se mantiene también en la versión publicada. Riesgo conocido:
  "¿Quién es quién?" es marca registrada de Hasbro; si llegara una reclamación, se cambia el
  nombre visible sin tocar el juego.
