<h1 align="center">Quién es quién</h1>

<p align="center">
  El juego de adivinar personajes, con políticos españoles de verdad.<br>
  En el navegador, gratis y sin registro.
</p>

<p align="center">
  <a href="./LICENSE"><img alt="Licencia MIT" src="https://img.shields.io/badge/licencia-MIT-blue"></a>
  <img alt="pnpm v11" src="https://img.shields.io/badge/pnpm-v11-f69220">
  <img alt="Estado: en desarrollo" src="https://img.shields.io/badge/estado-en%20desarrollo-d9a21b">
</p>

---

## Qué es

Un "¿quién es quién?" de navegador. Tienes un tablero de 24 fichas con fotos reales de políticos
españoles y un personaje secreto. Por turnos, tú y la máquina hacéis preguntas de sí o no ("¿Ha
formado parte del Consejo de Ministros?", "¿Su partido defiende la república?") y vais bajando las
fichas que ya no encajan. Gana quien adivine antes el personaje del otro.

## Qué lo hace distinto

- **Baraja equilibrada.** Mitad mujeres y mitad hombres, mitad izquierda y mitad derecha, y cada
  pregunta parte el tablero en dos mitades parecidas. No hay preguntas que te dejen con tres
  fichas por suerte: gana quien pregunta mejor.
- **Preguntas con respuesta comprobable.** Trayectoria y programa del partido, con fuente. Nada
  sobre el aspecto físico, salvo el sexo.
- **Fichas que caen de verdad.** Tablero visto a 45°, fichas con bisagra que caen en cascada.
- **Dos tonos:** neutral o con humor, a elegir al empezar. Cambia la redacción, no los datos.
- **Fotos con licencia libre**, con autor y fuente en la página de créditos.

## Estado

En desarrollo. La documentación del producto está cerrada y la fase 1 (partida completa contra la
máquina) está por empezar. Después vendrán jugar contra otra persona, salas y barajas de otros
temas: ver [`docs/roadmap.md`](docs/roadmap.md).

---

## Requisitos previos

- Node.js 24 o superior
- pnpm 11 (`corepack enable` o instalación global). No se usa npm ni yarn.

## Variables de entorno

La fase 1 no necesita ninguna. Si en el futuro hace falta alguna, estará documentada en
[`.env.example`](.env.example); cópialo como `.env.local` y nunca lo commitees.

## Instalación y desarrollo

```bash
pnpm install
```

```bash
pnpm dev
```

Comandos previstos (se activan al montar el proyecto en la fase 1):

| Comando | Qué hace |
|---------|----------|
| `pnpm dev` | Servidor de desarrollo en local |
| `pnpm build` | Build de producción |
| `pnpm preview` | Sirve el build en local |
| `pnpm test` | Tests unitarios (motor, máquina, baraja) |
| `pnpm test:e2e` | Partidas completas con Playwright contra localhost |
| `pnpm validar-baraja` | Comprueba el equilibrio y los créditos de cada baraja |

## Despliegue

Cloudflare Workers con assets estáticos, conectado a este repositorio de GitHub: cada push a
`main` se publica. Detalles en [`docs/architecture.md`](docs/architecture.md).

---

## Estructura

```
docs/        → Producto, arquitectura, diseño, datos, roadmap, flujos y testing
docs/features/ → Una ficha por funcionalidad acordada, con cómo se valida cada requisito
changelog/   → Registro de cambios importantes
mejoras/     → Ideas que no entran ahora
scripts/     → Verificación de cobertura de requisitos
src/         → (fase 1) Motor del juego, barajas e interfaz
```

La estructura detallada de `src/` está en [`docs/architecture.md`](docs/architecture.md).

## Cómo contribuir

El proyecto se desarrolla con agentes de código siguiendo el protocolo de
[`CLAUDE.md`](CLAUDE.md): antes de construir algo se acuerda su ficha en `docs/features/`, cada
requisito del PRD lleva un criterio de aceptación comprobable y cada cambio importante deja entrada
en `changelog/`. Los pull requests llevan la salida real de los tests, no casillas marcadas.

Para añadir o corregir un personaje o una pregunta, edita el `deck.json` de la baraja y pasa
`pnpm validar-baraja`.

## Créditos y licencia

Código bajo licencia [MIT](LICENSE). Las fotos de los personajes conservan su licencia original
(Creative Commons o dominio público); autor, licencia y fuente de cada una están en la página de
créditos del juego y en el `deck.json` de la baraja.

"¿Quién es quién?" es una marca registrada de Hasbro. Este proyecto no está afiliado a Hasbro.
