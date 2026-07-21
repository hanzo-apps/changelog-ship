# Agent guide

Canonical instructions for this repo live in [`LLM.md`](./LLM.md) (and its
`CLAUDE.md` symlink). Read it before changing anything.

TL;DR: Shipwright — a product changelog + blog. Vite + React 19 + `@hanzo/gui` +
`@hanzo/iam` + `@hanzo/base`. Keep it minimal and real. `@hanzo/gui` needs the
react-native-web alias + Tamagui defines in `vite.config.ts` and uses Tamagui
LONGHAND props (tsc enforces this); a mono family is a raw `fontFamily` string
(no `$mono` token), and `Button` labels are wrapped in `<Mono>` (Button has no
`fontFamily`). `schema.sql` (entries · tags · entry_tags) is the Base data
contract. Prove changes with `npm run build` (tsc + vite). Never build a
container image locally — Hanzo Cloud owns deploys.
