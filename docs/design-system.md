# Design System

<!-- Fuente de verdad visual del proyecto.
     Consultar antes de crear cualquier componente nuevo.
     Actualizar cuando se añadan nuevos patrones, componentes o se modifique la identidad visual. -->

---

## Paleta de colores

**Tableros por defecto:** rojo para el jugador y azul para el rival, como el juego físico.
Coinciden con los colores de los dos grandes partidos; es deliberado y queda compensado porque,
más adelante, cada jugador podrá elegir el color de su tablero de una lista cerrada (ver
"Colores de tablero elegibles"). La interfaz (botones, acento, avisos) no usa colores de partido.

| Rol | Nombre | Hex |
|-----|--------|-----|
| Board player | Plástico rojo | #C8262C |
| Board player shadow | Rojo en sombra | #8F1A1F |
| Board rival | Plástico azul | #2F86C9 |
| Board rival shadow | Azul en sombra | #1F5F93 |
| Secret frame | Marco amarillo de la carta secreta | #F2C230 |
| Accent | Mostaza (botones, turno activo) | #D9A21B |
| Accent hover | Mostaza oscuro | #B5850F |
| Table | Mesa (fondo de página) | #2A2420 |
| Photo backdrop | Fondo uniforme de las fotos | #D6DCE1 |
| Nameplate | Placa del nombre | #FAF8F3 |
| Text primary | Texto sobre claro | #1E1B18 |
| Text on dark | Texto sobre mesa/tablero | #F3EEE6 |
| Text secondary | Texto secundario | #6E665C |
| Yes | Respuesta "sí" | #2F8F5B |
| No | Respuesta "no" | #9A4A3C |
| Marked | Ficha marcada para caer (contorno) | #F2C230 |

Cada color de tablero se define como pareja (base + sombra) para que el plástico tenga volumen.

### Colores de tablero elegibles (C-05, versión posterior)

La lista la define cada baraja, no el juego: la de políticos usa colores de partido; una baraja de
otro tema traerá los suyos. Los hex son aproximaciones y se comprueban contra el manual de
identidad de cada partido antes de usarlos.

| Opción | Base aprox. |
|--------|-------------|
| Rojo (PSOE) — por defecto jugador | #C8262C |
| Azul (PP) — por defecto rival | #2F86C9 |
| Verde (Vox) | #5AC035 |
| Morado (Podemos) | #6B2C6E |
| Magenta (Sumar) | #E5007D |
| Amarillo (ERC) | #F5B800 |
| Naranja (Cs) | #EB6109 |
| Neutro (sin partido) | #3A3D42 |

Si un tablero se pinta de amarillo, el marco de la carta secreta pasa a blanco para no confundirse.

"Sí" y "no" siempre van con texto e icono, nunca solo con color.

---

## Tipografía

| Nivel | Fuente | Tamaño | Peso |
|-------|--------|--------|------|
| Título del juego | Bricolage Grotesque | 40px (móvil 28px) | 800 |
| H2 / pantallas | Bricolage Grotesque | 24px | 700 |
| Pregunta y respuesta | Bricolage Grotesque | 20px | 600 |
| Placa de nombre | Barlow Condensed, mayúsculas | 13px (móvil 10px) | 700 |
| Body / botones | Atkinson Hyperlegible | 16px | 400 / 700 |
| Caption / créditos | Atkinson Hyperlegible | 12px | 400 |

Fuentes autoalojadas (no Google Fonts en tiempo de ejecución).

---

## Espaciado y grid

- Escala: 4px base (4, 8, 12, 16, 24, 32, 48, 64).
- Tablero: cuadrícula de **6 columnas × 4 filas**. En móvil vertical, 4 × 6 si las fichas
  quedan por debajo de 48px de ancho.
- Ficha: proporción 3:4 para la foto más 18% de alto para la placa del nombre.
- Separación entre fichas: 8px (móvil 4px).
- Ancho máximo del área de juego: 960px.

---

## Estilo de componentes

- **Materialidad:** el tablero y las fichas imitan plástico inyectado: bordes redondeados (6px
  en fichas, 16px en tablero), un brillo suave arriba y sombra de contacto abajo. Nada de
  degradados llamativos ni brillos de "juguete barato".
- **Cámara:** el tablero es plano (todas las filas a la misma altura) y se ve desde arriba a unos
  45°, con las fichas de pie mirando hacia el jugador. Se usa perspectiva suave
  (`perspective: 1400px`, tablero a `rotateX(45deg)`) en lugar de isometría pura, para que las
  filas del fondo se vean algo más pequeñas, como en las fotos de referencia. Las fichas levantadas
  se inclinan unos 10° hacia atrás respecto a la vertical, como las del juego físico, para que la
  cara se lea bien a 45°.
- **Rotación en escritorio (S-05):** arrastrando con el ratón (o moviéndolo cerca de los bordes),
  el tablero gira sobre su eje vertical como máximo ±25° y la inclinación varía entre 35° y 55°.
  Nunca se llega a ver la parte de atrás de las fichas. Al soltar vuelve suavemente a la posición
  inicial en 400ms. En móvil la cámara está fija.
- **Caída de ficha:** bisagra en el borde inferior (`transform-origin: bottom`). Cae a
  `rotateX(-82deg)` en 380ms con `cubic-bezier(.5,0,.75,0)` y un rebote final de 4° en 120ms.
  Levantar es la animación inversa, 300ms. Con `prefers-reduced-motion`, la ficha pasa a dorso
  con un fundido de 150ms.
- **Varias fichas a la vez:** caen en cascada con 40ms de retraso entre una y la siguiente, en
  orden de lectura.
- **Ficha marcada:** antes de confirmar, las fichas que van a caer llevan contorno mostaza de 3px
  y bajan ligeramente la opacidad de la foto (0.7).
- **Tablero:** bandeja plana de plástico con 24 huecos en una cuadrícula de 6×4. Cada ficha va en
  un marco de plástico del color del tablero con pestañas laterales (las "bisagras").
- **Placa del nombre:** debajo de la foto, mayúsculas, sobre fondo claro.
- **Carta secreta:** encajada en una ranura del borde delantero del tablero, con marco amarillo
  `#F2C230`, más grande que las fichas y sin bisagra.
- **Contador del rival:** no se dibuja el tablero del rival. En la parte superior de la pantalla
  hay una única ficha vertical, con el color del tablero rival y el dorso de interrogantes, que
  muestra en grande el número de fichas que le quedan levantadas ("9") y debajo "le quedan". Cuando
  el número baja, la ficha hace un pequeño volteo.
- **Dorso de las fichas y de las cartas:** fondo con un patrón de "?" repetido en un tono más
  oscuro que el tablero.
- **Botones:** mostaza con texto oscuro, radio 10px, alto mínimo 44px.
- **Iconos:** Lucide, 20px.

---

## Fotos de los personajes

Las fotos vienen de fuentes distintas y se normalizan para que parezcan del mismo juego:

- Encuadre de busto: hombros visibles, ojos a un 40% de la altura de la foto, cara centrada.
- Fondo eliminado y sustituido por el fondo uniforme `#D6DCE1` con un viñeteado muy suave.
- Corrección ligera de exposición y balance de blancos; sin filtros, sin cambiar rasgos.
- Exportadas en WebP (y AVIF) a 300×400 y 600×800 px.
- Nunca se retoca la cara ni se genera con IA.

---

## Tono visual

Un juego de mesa de verdad sobre una mesa de verdad: plástico, fotos reales y luz cálida. Debe
parecer un objeto que da ganas de tocar, no una app de concurso de televisión ni un panfleto
político. Neutral en lo visual: el juego no se pone de parte de nadie, aunque los tableros lleven por
defecto el rojo y el azul clásicos. Los textos son sobrios: las preguntas se escriben en tono
neutral.

No debe parecer: una web de noticias, un mitin, un juego infantil de dibujos animados ni un
casino con brillos.

---

## Componentes definidos

<!-- Se documentan a medida que se construyen. Previstos: Board, Tile, SecretCard, RivalCounter (ficha única),
     QuestionList, AnswerBanner, GuessDialog, EndScreen, CreditsPage. -->

---

## Referencias visuales

- Tablero físico del "¿quién es quién?" clásico (foto aportada por el usuario al empezar el
  proyecto): fichas con bisagra, placa de nombre debajo de la cara y tableros en ángulo.
- Dos tableros de referencia aportados por el usuario: uno de 6×4 visto en perspectiva (el tablero es plano,
  lo que cambia es el ángulo) y con la carta secreta en la ranura delantera; otro plano con fondo de "?" en las fichas y la carta secreta
  con marco amarillo. De ahí salen la vista a 45°, la ranura delantera, el marco amarillo y el
  patrón de interrogantes.
