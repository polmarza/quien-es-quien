# Inicialización del proyecto "Quién es quién"

**Fecha:** 2026-10-16 16:04
**Tipo:** Configuración
**Requisitos:** Ninguno

## Qué se hizo
Se definió el producto con el usuario y se convirtió el repositorio de la plantilla en el del
proyecto: un "¿quién es quién?" de navegador con políticos españoles, primero contra la máquina y
más adelante multijugador.

## Qué se modificó
- `docs/prd.md`, `docs/design-system.md`, `docs/architecture.md`, `docs/data-model.md`,
  `docs/roadmap.md`, `docs/user-flows.md`, `docs/testing.md`: rellenados.
- `docs/business.md`: borrado (el juego es gratuito).
- `README.md`, `CLAUDE.md`, `.env.example`, `.gitignore`: reescritos o ajustados para el proyecto.
- `docs/features/README.md`, `changelog/README.md`, `mejoras/backlog.md`,
  `.claude/skills/changelog/SKILL.md`, `.claude/skills/diagnostico/SKILL.md`: quitadas las
  referencias a la plantilla.
- `.template/` y `.claude/skills/init-proyecto/`: borrados.

## Por qué
El repositorio describía la plantilla, no el producto. Decisiones principales tomadas con el
usuario: 24 personajes equilibrados por sexo y bloque, preguntas de una lista cerrada sin rasgos
físicos (salvo el sexo), tono neutral o con humor a elegir, tableros rojo y azul por defecto con
vista a 45°, el rival representado por una sola ficha con su contador, stack React + Vite + motor
TypeScript puro, despliegue en Cloudflare Workers desde GitHub y ningún MCP de proyecto.
