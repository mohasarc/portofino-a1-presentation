# AI deck workflow

When asked to create or revise a presentation in this repository:

1. Read `.agents/skills/html-slides/SKILL.md`, `.agents/skills/frontend-design/SKILL.md`, and `.agents/skills/framer-motion-animator/SKILL.md` before editing.
2. Treat `src/deck.ts` as the authoring surface. Infer a focused audience and narrative when the prompt does not provide them.
3. Give each slide one claim, keep copy concise, and use the existing visual archetypes before adding a new `kind`.
4. Let the engine handle camera movement and responsive composition. Make camera coordinates form a deliberate spatial journey.
5. Preserve keyboard navigation, visible focus, and reduced-motion support.
6. Run `npm run check` and `npm run build` before handing off. Render every slide at 1440×900 when browser tooling is available and fix clipping or control overlap.

The goal is zero manual slide design: a user supplies the subject and the agent supplies story, art direction, layout selection, and motion choreography.
