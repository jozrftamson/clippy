# Issue #15 - Windows XP Helper Agent Plan

Issue: https://github.com/pi0/clippyjs/issues/15

## Goal

Add the Windows XP setup helper (question mark agent) as a first-class bundled agent in ClippyJS.

## Required Inputs (Blockers)

- Agent animation data in the same shape as existing `src/agents/*/agent.ts` files.
- Sprite sheet PNG (`map.png`) that matches the frame coordinates in the animation data.
- Sound map (`sounds-mp3.ts`) in the same format as existing agents.
- Final public agent name (for example: `QMark`, `XPHelper`, or `QuestionMark`).

## Implementation Checklist

1. Add new agent folder:
   - `src/agents/<name>/index.ts`
   - `src/agents/<name>/agent.ts`
   - `src/agents/<name>/sounds-mp3.ts`
   - `src/agents/<name>/map.png`
2. Export agent from `src/agents/index.ts`.
3. Add subpath export in `package.json` (`./agents/<name>`).
4. Add new agent key to `build.config.mjs` `agents` array.
5. Include the agent in `src/legacy.ts` for `clippy.min.js` compatibility.
6. Add a demo button/option in `demo/demo.ts`.
7. Update docs:
   - `README.md` available agents section
   - `AGENTS.md` architecture/examples where needed
8. Run validation:
   - `pnpm fmt`
   - `pnpm test`
   - `pnpm build`

## Acceptance Criteria

- Agent can be loaded via ESM:
  - `import { <Name> } from "clippyjs/agents"`
  - `import <Name> from "clippyjs/agents/<name>"`
- Agent can be loaded via legacy API:
  - `clippy.load("<name>", callback)` (if mapped)
- Agent appears in demo UI and can `show`, `animate`, `speak`, `moveTo`.
- Build artifacts include `dist/agents/<name>/` chunks.

## Notes

- Keep naming consistent across folder name, export name, and demo label.
- If original XP assets need conversion, preserve frame coordinates and animation timing during extraction.
