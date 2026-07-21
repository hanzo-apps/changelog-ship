# Shipwright (changelog-ship) — agent notes

A real Hanzo app forked from `hanzo-starter`: a public product **changelog**
paired with a longer-form **blog**. Vite + React 19 + `@hanzo/gui` (UI) +
`@hanzo/iam` (auth) + `@hanzo/base` (data). Keep it minimal and REAL — every
surface builds and runs, no fabricated UI.

## What it is

- **Three views**: the changelog **feed** (reverse-chron timeline, type/tag
  filter), the post **detail** (full body + related), and **compose** (signed-in
  editor). The signed-out landing is a public changelog page with a preview
  timeline. Router-less: `src/views/home.tsx` holds a `Nav` state machine.
- **Design**: a monospace-accented terminal aesthetic — a connector line down
  the left gutter (`TimelineRow`), JetBrains-style version chips, muted graphite
  with a single lime highlight reserved for the newest release. All visual
  constants live in `src/theme.ts`; shared gui compositions in `src/ui.tsx`.

## One way, decomplected (unchanged from the starter)

- **Providers** (`src/providers.tsx`) mount `GuiProvider` → `IamProvider` →
  `BaseProvider`. `BaseProvider` gets a `BaseClient` carrying the IAM access
  token; it is rebuilt when the token changes (`src/lib/base.ts` `baseAs`). That
  seam makes every `useQuery`/`useMutation`/`useBase` org-scoped to the user.
- **Env is one place** (`src/env.ts`), read from `import.meta.env.VITE_*`. The
  IAM client id is `VITE_IAM_CLIENT_ID` (fallback `hanzo-app`).
- **UI is one system** — `@hanzo/gui` primitives only (no second kit, no
  Tailwind).

## Gotchas (do not regress)

- **`@hanzo/gui` under Vite** needs three things in `vite.config.ts` (it is the
  Tamagui line): (1) alias `react-native` → `react-native-web`, (2) `define`
  `process.env.TAMAGUI_TARGET` / `NODE_ENV` / `__DEV__`, (3) `dedupe`
  react/react-dom/react-native-web. No Tamagui compiler, no `one`, no Expo.
- **`@hanzo/gui` props are Tamagui LONGHAND** with this v5 config:
  `alignItems`/`justifyContent`/`backgroundColor`/`padding`/`borderRadius`/
  `textAlign` — NOT the `items`/`justify`/`bg`/`p`/`rounded`/`text` shorthands.
  Shorthands pass at runtime but FAIL `tsc`.
- **Mono without a `$mono` token**: the v5 config registers only `body`/
  `heading`. `fontFamily` accepts a raw string, so `theme.ts` sets `MONO` to a
  literal monospace stack — a non-`$` value renders verbatim. Do NOT write
  `fontFamily="$mono"` (typechecks but has no token → wrong render).
- **`Button` carries no `fontFamily`** (it is a Stack, not a text node). Wrap the
  label in `<Mono>` — see `PrimaryButton`/`GhostButton` in `ui.tsx`. `Button`
  uses `onPress`; `Input`/`TextArea` use `value`/`onChangeText` (and reject
  `lineHeight`/`placeholderTextColor` as raw values — style with `color`).
- **PKCE storage is `localStorage`** so verifier/state survive the hanzo.id
  round-trip.
- **`schema.sql` is the data contract.** It is the `databaseSchema` DDL the
  deploy translates into Base collections. Three collections —
  `entries`/`tags`/`entry_tags` — kept in lockstep with `feed.tsx` /
  `detail.tsx` / `compose.tsx`.

## Deploy contract (Hanzo Cloud)

- Static SPA: `npm run build` → `dist/`, served at `<slug>.hanzo.app`. No server.
- On publish, `schema.sql` → `provisionBaseFromDDL` creates the collections
  (org-scoped via `@request.auth.org_id = org`, IAM-native).
- **IAM redirect registration** is the one external requirement: the IAM client
  (`VITE_IAM_CLIENT_ID`) must allow this origin's `/auth/callback`.

## Proven

`tsc --noEmit` clean · `vite build` → `dist/` · the landing renders under Vite
with the terminal aesthetic and zero console errors · `login()` performs a real
PKCE S256 redirect to hanzo.id.

## Build

CI (`.github/workflows/ci.yml`) runs `npm ci && npm run typecheck && npm run
build` — build-verification only, NEVER a container image (Hanzo Cloud owns
deploys).
