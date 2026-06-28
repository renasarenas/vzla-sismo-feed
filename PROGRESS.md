# Progress Log

## Current Verified State
- Repository root: `/home/phylip/Downloads/vzla-sismo-feed`
- Standard startup path: `./init.sh` (pwd, Node check, `npm ci`, `npx tsc --noEmit`, `npm run build`, PWA artifact check)
- Standard verification path: `./init.sh` from a clean state. Last run: green.
- Current branch: `master` (Session 002 commit `040903f` on top of PR #14 merge `eba983c`; `fix/mapa-ssr-and-node-version` was merged in `d996682` before this session).
- Node: v24.14.1 (local). Engine pin: `>=20.0.0` covers the team baseline.
- npm: 11.14.1 (local). Team baseline: 11.13.0. Engine pin: `>=11.0.0`.
- Agent skills installed at project scope (`./.agents/skills/`, gitignored; `skills-lock.json` tracked). See Session 002.
- Current highest-priority unfinished feature: pick a concrete frontend improvement using one of the installed skills as the source of truth.
- Current blocker: none for the verification harness. Local Supabase not provisioned (`.env.local` uses placeholders so dev server boots without a real DB).

## Session Log

### Session 001 — 2026-06-27
- Date: 2026-06-27
- Goal: bootstrap a verification harness, document the stack, fix the /mapa SSR bug, and pin Node/npm versions.
- Completed:
  - `CONSTRAINTS.md` populated with the actual stack (Next.js 14 / React 18 / TS / Tailwind / Leaflet / Supabase / Groq / Vercel), a Spanish-only UI rule, a project-scoped agent tooling rule, and an `npm audit fix` prohibition.
  - `init.sh` created with `pwd`, Node version check, `npm ci`, typecheck, build, and PWA artifact checks. Executable.
  - `package-lock.json` regenerated from scratch to fix drift on npm 11.x (lockfile was missing ~628 lines of transitives such as `@webassemblyjs/leb128`, `ajv`, `schema-utils`).
  - `.env.local` added locally (gitignored) with placeholder values so the dev server boots without a real Supabase or Groq.
  - npm binary symlinks enabled in the fnm Node 24 install (npm was present in `lib/node_modules/npm` but `bin/npm` and `bin/npx` symlinks were missing).
  - Discovered and fixed the `/mapa` SSR bug (`ReferenceError: window is not defined`). Root cause: `import L from 'leaflet'` and `import { MapContainer, ... } from 'react-leaflet'` were both evaluated at module load on the server, where Leaflet touches `window`. The page-level `nextDynamic({ ssr: false })` had no effect because the page is a server component. Fix: `import type L from 'leaflet'` (stripped at build), `dynamic({ ssr: false })` per react-leaflet component inside a `'use client'` component, and a dynamic `import('leaflet')` for the icon-defaults setup inside `useEffect`.
  - `engines.node` (`>=20.0.0`) and `engines.npm` (`>=11.0.0`) added to `package.json`. `.nvmrc` with `20` added.
- Verification runs:
  - `./init.sh` from a clean state: `pwd` printed, Node version accepted, `npm ci` clean, `npx tsc --noEmit` green, `npm run build` green (6/6 static pages), `public/sw.js` and `public/manifest.webmanifest` generated.
  - Dev server with placeholder env: `/` 200, `/mapa` 200 (was 500), `/stats` 200, `/api/stats` 200 with valid empty-state JSON, `/api/feed` 500 with `{"error":"TypeError: fetch failed"}` (DNS to placeholder URL, expected and not a JS crash).
- Evidence captured:
  - `/mapa` server bundle dropped from 45.5 kB to 2.04 kB after the dynamic-import fix; Leaflet now lives in a client-only chunk.
  - `npm audit` (run during lockfile regen): 7 vulnerabilities (1 moderate, 6 high), all in transitive deps of webpack/next-pwa/workbox. Pre-existing, not introduced by this session. Not enforced by `init.sh`; reserved for release tagging per CONSTRAINTS.md §5.
- Commits:
  - On `master` (history pre-branch):
    - `08ccd62` docs(constraints): document stack, spanish-only ui rule, and dependency lock policy
    - `f48cef4` docs(constraints): drop python rules, clarify project-scoped tooling and code-level english allowance
    - `dbd447e` docs(constraints): switch package manager from pnpm to npm across stack and verification
    - `6ea3099` chore(init): add verification harness with pwd, node check, typecheck, build, and pwa artifact checks
    - `492418c` fix(deps): regenerate package-lock.json to fix npm ci drift on npm 11.x
  - On `fix/mapa-ssr-and-node-version`:
    - `6fe2a56` fix(mapa): make leaflet and react-leaflet client-only via dynamic imports
    - `9df0615` chore(engines): pin node >=20 and npm >=11 via engines and .nvmrc
- Files or artifacts updated: `CONSTRAINTS.md`, `init.sh`, `package.json`, `package-lock.json`, `.env.local` (untracked, gitignored), `.nvmrc`, `src/components/MapaSismos.tsx`, `PROGRESS.md`.
- Known risk or unresolved issue:
  - `nextDynamic({ ssr: false })` in `src/app/mapa/page.tsx` is now redundant (it only works in client components). Left in place to keep the bug fix scoped to a single file.
  - Branch has not been merged or pushed (user instruction: no merge, no PR).
  - 7 `npm audit` findings remain; not in the `init.sh` path, only relevant for release tagging.
- Next best step:
  - When the team is ready: review and merge `fix/mapa-ssr-and-node-version` into `master`, then push.
  - Optional cleanup in a follow-up: drop the redundant `nextDynamic` wrapper in `src/app/mapa/page.tsx`.
  - Optional degraded-mode guard: in `/api/feed` and `/api/stats`, return `{ degraded: true, reason: 'supabase_not_configured' }` with status 200 when env vars are missing, so the UI degrades to an explicit empty state instead of a 500.

### Session 002 — 2026-06-28
- Date: 2026-06-28
- Goal: discover and install project-scoped agent skills to improve frontend work (design, animations, typography, performance, accessibility).
- Installed at project scope (`./.agents/skills/`, gitignored per CONSTRAINTS.md §2 project-scoped tooling rule):
  1. `anthropics/skills@frontend-design` — visual design direction, typography pairing, intentional aesthetic choices (2.1K installs)
  2. `vercel-labs/agent-skills@vercel-react-best-practices` — React/Next.js performance patterns from Vercel Engineering (official Vercel source)
  3. `vercel-labs/agent-skills@vercel-react-view-transitions` — smooth, native-feeling animations using React's View Transition API
  4. `vercel-labs/agent-skills@web-design-guidelines` — Web Interface Guidelines compliance review
  5. `vercel-labs/agent-skills@vercel-composition-patterns` — scalable React component composition patterns
  6. `paulrberg/agent-skills@tailwind-css` — Tailwind CSS best practices and v4 rules (1.9K installs)
  7. `wondelai/skills@web-typography` — typeface selection, pairing, and responsive typography (4.3K installs)
- Reinstall command for any team member or fresh clone:
  ```bash
  npx skills add anthropics/skills@frontend-design -y
  npx skills add vercel-labs/agent-skills@vercel-react-best-practices -y
  npx skills add vercel-labs/agent-skills@vercel-react-view-transitions -y
  npx skills add vercel-labs/agent-skills@web-design-guidelines -y
  npx skills add vercel-labs/agent-skills@vercel-composition-patterns -y
  npx skills add paulrberg/agent-skills@tailwind-css -y
  npx skills add wondelai/skills@web-typography -y
  ```
- Verification:
  - `./init.sh` re-run after install: green. No source files changed, typecheck and build unaffected.
  - `.agents/skills/` total size: 808K of agent guidance markdown (gitignored).
  - All 7 skills confirmed to load a `SKILL.md` with valid frontmatter and a description.
- Commits (pending):
  - `chore(agents): gitignore .agents/ and log skills install` — `.gitignore` + `PROGRESS.md` update.
- Files or artifacts updated: `.gitignore`, `PROGRESS.md`, `.agents/skills/*` (gitignored).
- Known risk or unresolved issue:
  - Skills are gitignored to keep the repo lean. Team members must run the reinstall block above once per fresh checkout. If the team later wants these committed (e.g. for CI agent tooling), the `.agents/` gitignore line can be dropped and the lock can be regenerated by `npx skills add` with `--copy` instead of symlinks.
  - No code changes were made in this session; skills are passive guidance for future frontend work.
- Next best step:
  - Pick one concrete frontend improvement (e.g. unified typography scale, a hero animation, a navigation transition) and implement it using the relevant skill as the source of truth.
  - When the team is ready: review and merge `fix/mapa-ssr-and-node-version` into `master`, then push.
