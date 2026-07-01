# Progress Log

## Current Verified State
- Repository root: `g:/Projects/vzla-sismo-feed`
- Standard startup path: `./init.sh` (pwd, Node check, `npm ci`, `npx tsc --noEmit`, `npm run build`, PWA artifact check)
- Standard verification path: `npx tsc --noEmit` and `npm run build`. Last run: green.
- Current branch: `master`
- Node: v24.14.1 (local). Engine pin: `>=20.0.0` covers the team baseline.
- npm: 11.14.1 (local). Team baseline: 11.13.0. Engine pin: `>=11.0.0`.
- Agent skills installed at project scope (`./.agents/skills/`, gitignored; `skills-lock.json` tracked). See Session 002.
- Frontend visual refresh applied on `feat/agent-skills-frontend`. See Session 003.
- Map UI/UX improvements (interactive legend magnitude filter, state filter, details card, 3D skeleton loading/guide) completed on `master`. See Session 010.
- Current blocker: none for the verification harness. Local Supabase not provisioned (`.env.local` uses placeholders so dev server boots without a real DB; API routes now return fast degraded-mode empty responses in local dev).

## Session Log

### Session 010 — 2026-07-01
- Date: 2026-07-01
- Goal: improve the UI/UX of the maps page (2D and 3D) using ui-ux-pro-max and impeccable guidelines.
- Completed:
  - Custom styled Leaflet popups, containers, and zoom controls in [globals.css](file:///g:/Projects/vzla-sismo-feed/src/app/globals.css) to match the brand typography and colors (clear light/dark themes).
  - Modified [LeafletMap.tsx](file:///g:/Projects/vzla-sismo-feed/src/components/LeafletMap.tsx) to support centering the camera (flyTo) on selected sismos and emit click events on markers.
  - Redesigned [MapaSismos.tsx](file:///g:/Projects/vzla-sismo-feed/src/components/MapaSismos.tsx) to render a dashboard layout with a floating sidebar (interactive magnitude range filters, geographic state filters, and sismo details panel).
  - Enhanced [MapaEdificios3D.tsx](file:///g:/Projects/vzla-sismo-feed/src/components/MapaEdificios3D.tsx) with a loading skeleton/shimmer and a floating panel containing specifications, navigation controls, and censo context.
  - Modified [MapaSwitcher.tsx](file:///g:/Projects/vzla-sismo-feed/src/components/MapaSwitcher.tsx) to query the `zona` field from Supabase and polished the tab buttons for accessibility and touch targets.
- Verification:
  - TypeScript type check (`npx tsc --noEmit`) and production Next.js build (`npm run build`) completed successfully with zero warnings/errors.
- Commits:
  - `4253012` feat(mapa): improve UI/UX of sismos and 3D buildings maps

### Session 009 — 2026-06-30
- Date: 2026-06-30
- Goal: add an interactive SVG map of Venezuela showing the double earthquake epicenters and affected areas.
- Completed:
  - Created [MapaVenezuelaSVG.tsx](file:///g:/Projects/vzla-sismo-feed/src/components/MapaVenezuelaSVG.tsx) using projected GeoJSON coordinates to render a lightweight, responsive vector map of Venezuela.
  - Added animated seismic waves at the epicenters (San Felipe and Valencia) and styled shaking and coastal impact zones.
  - Integrated the map into the `ResumenEvento` widget in [FeedNoticias.tsx](file:///g:/Projects/vzla-sismo-feed/src/components/FeedNoticias.tsx) in a responsive two-column layout.
- Verification:
  - Run typecheck and production build successfully. All checks passed.
- Commits:
  - `d4b29db` feat(frontend): add interactive SVG map of Venezuela to event summary

### Session 008 — 2026-06-28
- Date: 2026-06-28
- Goal: implement the user-approved map and emergency-feed improvements across five independent feature branches.
- Design/planning decisions (user-approved):
  - Five independent feature branches created from `master`:
    1. `feat/dark-map-tiles` — reactive Leaflet tile layer (OpenStreetMap light / CartoDB dark matter).
    2. `feat/map-territory-heatmap` — Venezuela country outline GeoJSON + magnitude-based heatmap circles.
    3. `feat/filter-by-zone` — Groq-extracted `zona` column + `?zona=` API filter + UI selector.
    4. `feat/offline-mode` — improved Workbox caching + offline banner.
    5. `feat/tsunami-alert` — USGS `tsunami` field capture + display in feed cards and map popups.
- Completed:
  - `feat/dark-map-tiles`: added `useDarkMode` hook via `MutationObserver` on `<html class="dark">`; switched `TileLayer` URL/attribution reactively. Verified with Puppeteer MCP screenshots in light and dark modes.
  - `feat/map-territory-heatmap`: added lightweight (~24K) Venezuela outline GeoJSON under `public/data/venezuela.geojson`; rendered it as a `GeoJSON` layer; added heatmap circles sized/colored by parsed magnitude. Verified map outline renders correctly.
  - `feat/filter-by-zone`: added `zona` column via `supabase/migrations/006_zona.sql`; extended Groq prompt to extract state; stored `zona` in ingest pipeline; added `?zona=` filter to `/api/feed`; added zone `<select>` to feed filter bar.
  - `feat/offline-mode`: rewrote `next.config.js` `runtimeCaching` with `StaleWhileRevalidate` for feed/stats/pages and `CacheFirst` for static assets + map tiles; created `OfflineBanner` component and added it to `layout.tsx`.
  - `feat/tsunami-alert`: added `tsunami` column via `supabase/migrations/005_tsunami.sql`; captured `props.tsunami` in `ingestUSGS`; exposed field in `/api/feed`; rendered alert badge in feed cards and map popups.
- Verification:
  - `./init.sh` green on every branch (typecheck + production build + PWA artifacts).
  - Puppeteer MCP used to validate dark tile switching and Venezuela outline rendering.
- Commits:
  - `feat/dark-map-tiles`: `1d2879e` feat(map): add dark-mode tile layer
  - `feat/dark-map-tiles`: `924ee3c` docs(progress): update current state and feature plan
  - `feat/tsunami-alert`: `05a21cb` feat(tsunami): capture and display USGS tsunami alerts in feed and map
  - `feat/map-territory-heatmap`: `f43b7c9` feat(map): add Venezuela territory outline and magnitude heatmap layer
  - `feat/filter-by-zone`: `0b28629` feat(feed): extract and filter news by Venezuelan geographic zone
  - `feat/offline-mode`: `1981a73` feat(pwa): improve offline caching and add offline banner
- Files or artifacts updated:
  - `src/components/MapaSismos.tsx` (dark tiles, territory, heatmap, tsunami popup)
  - `public/data/venezuela.geojson`
  - `src/lib/factchecker.ts` (zona extraction)
  - `src/app/api/ingest/route.ts` (zona + tsunami storage)
  - `src/app/api/feed/route.ts` (zona filter + tsunami field)
  - `src/components/FeedNoticias.tsx` (zona selector + tsunami badge)
  - `next.config.js` (PWA caching)
  - `src/components/OfflineBanner.tsx`
  - `src/app/layout.tsx` (OfflineBanner)
  - `supabase/migrations/005_tsunami.sql`, `006_zona.sql`
  - `PROGRESS.md`
- Known risk or unresolved issue:
  - Migration files `005_tsunami.sql` and `006_zona.sql` live on separate branches; before merging both, verify numeric ordering and avoid duplicate `005` files.
  - `FeedNoticias.tsx` diverged significantly across branches; merging `feat/filter-by-zone` and `feat/tsunami-alert` will require resolving overlapping UI edits.
  - Puppeteer MCP required manual Chrome install and `--no-sandbox` launch options.
- Next best step:
  - Merge branches one by one into `master`, resolving conflicts in `PROGRESS.md` and `FeedNoticias.tsx`/`MapaSismos.tsx` as needed.
- Goal: plan and begin implementing user-requested map improvements and emergency-feed enhancements.
- Design/planning decisions (user-approved):
  - Five independent feature branches created from `master`:
    1. `feat/dark-map-tiles` — reactive Leaflet tile layer that switches between OpenStreetMap (light) and CartoDB dark matter (dark) via `MutationObserver` on `<html class="dark">`.
    2. `feat/map-territory-heatmap` — overlay Venezuela state boundaries as GeoJSON polygons colored by seismic activity + a heatmap layer of USGS events.
    3. `feat/filter-by-zone` — new `zona` column extracted by Groq, filterable via `?zona=` in `/api/feed` with UI selector in the feed sidebar.
    4. `feat/offline-mode` — improved Workbox runtime caching and an offline banner.
    5. `feat/tsunami-alert` — capture USGS `properties.tsunami`, store in new `tsunami` column, display alert in feed cards and map popups.
- Completed in this session:
  - Created the five branches from `master`.
  - Implemented `feat/dark-map-tiles` in `src/components/MapaSismos.tsx`.
  - Verified with `./init.sh`: typecheck green, production build green (6/6 static pages), PWA artifacts present.
  - Puppeteer MCP screenshots captured confirming light and dark tile layers render correctly and switch in real time.
- Commits:
  - `feat/dark-map-tiles`: `1d2879e` feat(map): add dark-mode tile layer
- Files or artifacts updated: `src/components/MapaSismos.tsx`, `PROGRESS.md`, `screenshots/*` (gitignored).
- Known risk or unresolved issue:
  - Puppeteer MCP required manual Chrome install (`npx puppeteer browsers install chrome@131.0.6778.204`) and `--no-sandbox` launch options to run in this environment.
  - Four remaining feature branches are empty; next session will implement them in priority order.
- Next best step:
  - Continue with the next feature branch (suggested: `feat/tsunami-alert` or `feat/map-territory-heatmap`).

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

### Session 003 — 2026-06-28
- Date: 2026-06-28
- Goal: apply a visual redesign focused on crisis clarity and ease of understanding for the Venezuela earthquake emergency feed, using the installed agent skills as guidance and Playwright MCP for screenshot verification.
- Design decisions (grounded in `frontend-design`, `web-design-guidelines`, `web-typography`, `vercel-react-best-practices`, `tailwind-css`):
  - **Crisis-first palette**: red (`#DC2626`) reserved for the global alert banner, emergency FAB, and critical badges; grays and soft semantic colors for information. Avoids playful or distracting tones.
  - **Removed all emojis from UI**: replaced with inline SVG icons (search, theme, menu, phone, warning, document, globe). Emojis reduce seriousness and hurt screen-reader clarity in a crisis context.
  - **Typography**: system font stack (Inter/system-ui) for performance and familiarity; clear scale using `clamp()` for headings, 16px+ body, 1.6 line-height. No web-font blocking requests.
  - **Global alert banner**: fixed red banner below header with warning icon and the text "Información verificada en tiempo real — Sismo Venezuela 24 jun". Single high-contrast signature element.
  - **Prominent emergency access**: red FAB "Emergencias" (text on desktop, phone icon on mobile) opens a clean modal directory with Protección Civil, bomberos, operadoras, FUNVISIS and official platforms.
  - **Clear empty/error states**: replaced confusing satellite emoji with an explanatory icon, heading, and action-oriented description.
  - **Accessibility**: visible `:focus-visible` rings, reduced-motion media query, semantic HTML, aria labels on icon-only buttons.
  - **Performance**: no new npm dependencies; only Tailwind v3 utilities and inline SVGs. `next/dynamic` for Leaflet preserved.
- Files changed:
  - `tailwind.config.js`: added `crisis` semantic colors, `font-sans`, `font-size` display/title/body/small/caption tokens, `fade-in` animation.
  - `src/app/globals.css`: base typography, focus-visible rings, reduced-motion reset.
  - `src/app/layout.tsx`: added `NumerosEmergencia` globally and `font-sans` class.
  - `src/components/Navbar.tsx`: no emojis, SVG icons, cleaner active states, accessible labels.
  - `src/components/FeedNoticias.tsx`: alert banner, improved header, SVG search icon, language buttons as text, short tag labels, clearer cards, better empty/error state.
  - `src/components/SismosUSGS.tsx`: no emojis, magnitude severity labels, cleaner card layout.
  - `src/components/NumerosEmergencia.tsx`: no emojis, cleaner modal with reusable `NumberCard`, consistent sections.
  - `src/app/stats/page.tsx`: improved typography and spacing.
  - `src/components/MapaSismos.tsx`: cleaner header and popup link styling.
  - `.gitignore`: excluded `.playwright-mcp/` and `screenshots/` generated during verification.
- Verification:
  - `npx tsc --noEmit`: green.
  - `./init.sh`: green (typecheck, build, PWA artifacts).
  - Playwright MCP screenshots captured for baseline and after states (saved locally under `screenshots/`, gitignored):
    - Desktop feed, stats, map (light and dark).
    - Mobile feed (light and dark).
    - Emergency modal.
- Commits (pending):
  - `feat(ui): crisis-focused visual redesign with accessible typography and emergency directory`
- Files or artifacts updated: `tailwind.config.js`, `src/app/globals.css`, `src/app/layout.tsx`, `src/components/Navbar.tsx`, `src/components/FeedNoticias.tsx`, `src/components/SismosUSGS.tsx`, `src/components/NumerosEmergencia.tsx`, `src/app/stats/page.tsx`, `src/components/MapaSismos.tsx`, `.gitignore`, `PROGRESS.md`.
- Known risk or unresolved issue:
  - With placeholder Supabase env, `/api/feed` returns 500, so the feed shows an error empty state in local dev. This is expected and unchanged functionally; the UI now explains the failure clearly. A future follow-up could implement the degraded-mode guard noted in Session 001.
  - `SismosUSGS` component is updated but not currently mounted in any page.
- Next best step:
  - Review the screenshots and commit `feat/agent-skills-frontend` to `master` when ready.
  - Optional follow-up: implement degraded-mode API responses and wire `SismosUSGS` into a dedicated seismic monitoring page or tab.

### Session 004 — 2026-06-28
- Date: 2026-06-28
- Goal: fix the two issues reported by user: (1) slow navigation between sections, and (2) emergency modal hidden behind the map.
- Diagnosis:
  - **Slow navigation**: `/api/feed` and `/api/stats` were trying to connect to the placeholder Supabase URL (`https://placeholder.supabase.co`) and timing out on DNS. With `force-dynamic` pages, every route change triggered these slow server fetches, making navigation feel sluggish.
  - **Modal behind map**: the emergency modal had `z-[100]`, but Leaflet map panes and controls use z-index values up to 1000, so the modal rendered underneath.
- Fixes applied:
  - Added `src/lib/env.ts` with `isSupabaseConfigured()` helper (detects missing or placeholder Supabase URL/key) and `supabaseDegradedResponse()`.
  - Added degraded-mode guards to `/api/feed` and `/api/stats`: when Supabase is not configured, return HTTP 200 with empty data and `{ degraded: true, reason: 'supabase_not_configured' }` immediately.
  - Updated `FeedNoticias` to detect the `degraded` flag and show a clear empty state: "Servicio de noticias no configurado — El feed está en modo local. Conecta Supabase para ver noticias verificadas en tiempo real."
  - Added `src/app/loading.tsx` to show a loading spinner during route transitions, improving perceived performance.
  - Fixed z-index: emergency FAB raised from `z-40` to `z-[60]`; modal overlay raised from `z-[100]` to `z-[1100]` so it always sits above Leaflet.
- Verification:
  - `npx tsc --noEmit`: green.
  - `./init.sh`: green.
  - Measured response times locally (degraded mode):
    - `/` 24ms, `/stats` 11ms, `/mapa` 18ms, `/api/feed` 6ms, `/api/stats` 4ms.
  - Playwright MCP screenshot confirmed the emergency modal now renders on top of the map.
- Commits (pending):
  - `fix(ui): raise modal z-index above leaflet and add degraded-mode api guards for faster navigation`
- Files or artifacts updated: `src/lib/env.ts`, `src/app/api/feed/route.ts`, `src/app/api/stats/route.ts`, `src/components/FeedNoticias.tsx`, `src/components/NumerosEmergencia.tsx`, `src/app/loading.tsx`, `PROGRESS.md`.
- Known risk or unresolved issue:
  - Degraded mode is triggered by placeholder values in `.env.local`. In production with real Supabase credentials, the routes will fetch normally.
  - `SismosUSGS` remains unmounted; navigation speed issue is unrelated to it.
- Next best step:
  - Review and merge `feat/agent-skills-frontend` into `master`.
  - Optional follow-up: wire `SismosUSGS` into a page or tab.

### Session 005 — 2026-06-28
- Date: 2026-06-28
- Goal: address user feedback that the page looked too centered and templated; redesign the feed and supporting pages to look more professional and appropriate for a Venezuela earthquake information resource.
- Design decisions:
  - Replaced the narrow centered column (`max-w-2xl mx-auto`) with a full-width dashboard layout (`max-w-8xl`) that uses the available screen real estate.
  - Added a prominent hero section with the page title, live indicator, description, and key metrics (verified news count, date).
  - Introduced a sticky left sidebar on desktop for search, language filter, category filter, and service status; this removes the crowded horizontal tag strip from the main content area.
  - Kept the category tags accessible as a vertical list in the sidebar, with semantic color pills for each category.
  - Updated cards to use the wider content area, larger headline type, and subtler shadows.
  - Refined the palette: crisis red is now slightly deeper (`#B91C1C`) and surface colors were tuned for both light and dark modes.
  - Improved dark mode surfaces so they are dark but not pure black (`surface-dark: #0B0F19`, `surface-elevated-dark: #111827`).
  - Redesigned the navbar to be full-width with a stronger logo mark and clearer active states.
  - Updated `/mapa` and `/stats` to use the same full-width layout and improved typography.
- Files changed:
  - `tailwind.config.js`: extended tokens with `hero/headline/lead` type scale, `surface` colors, `max-w-8xl`, and softer shadows.
  - `src/app/globals.css`: tied body background to the new surface tokens.
  - `src/components/Navbar.tsx`: full-width navbar with logo icon and refined navigation.
  - `src/components/FeedNoticias.tsx`: two-column desktop layout (sidebar + feed), hero section, improved cards and empty states.
  - `src/components/NumerosEmergencia.tsx`: consistent surface colors and cleaner modal styling.
  - `src/app/stats/page.tsx`: full-width dashboard layout with larger hero stat and responsive category grid.
  - `src/components/MapaSismos.tsx`: full-width map container and improved header.
- Verification:
  - `npx tsc --noEmit`: green.
  - `./init.sh`: green (typecheck, build, PWA artifacts).
  - Playwright MCP screenshots captured for the redesigned pages (saved under `screenshots/`, gitignored).
- Commits (pending):
  - `feat(ui): full-width professional redesign with sidebar, hero, and improved dashboard layout`
- Files or artifacts updated: `tailwind.config.js`, `src/app/globals.css`, `src/components/Navbar.tsx`, `src/components/FeedNoticias.tsx`, `src/components/NumerosEmergencia.tsx`, `src/app/stats/page.tsx`, `src/components/MapaSismos.tsx`, `PROGRESS.md`.
- Known risk or unresolved issue:
  - With placeholder Supabase env, `/api/feed` returns degraded empty state; the UI now explains this clearly.
  - The Leaflet map tile layer remains the default OpenStreetMap style, which is light even in dark mode. A future enhancement could load dark tiles when the system is in dark mode.
  - Local dev server could not be kept running between tool calls in this session, but build-time and init.sh verification passed.
- Next best step:
  - Review and merge `feat/agent-skills-frontend` into `master`.
  - Optional follow-up: integrate dark-mode map tiles and wire `SismosUSGS` into a dedicated page.

### Session 007 — 2026-06-28
- Date: 2026-06-28
- Goal: reconcile `feat/agent-skills-frontend` with recent upstream `master` changes before opening a PR.
- Completed:
  - Added `upstream` remote and fetched latest `master`.
  - Ran `git rebase upstream/master` on `feat/agent-skills-frontend`.
  - Resolved merge conflicts in `src/components/FeedNoticias.tsx` and `src/components/SismosUSGS.tsx` by keeping the crisis-focused/editorial redesign versions from the feature branch.
  - Verified the rebased branch with `./init.sh`: typecheck green, production build green (6/6 static pages), PWA artifacts present.
- Files changed: `src/components/FeedNoticias.tsx`, `src/components/SismosUSGS.tsx` (conflict resolution), `PROGRESS.md`.
- Verification:
  - `git status`: working tree clean on `feat/agent-skills-frontend`.
  - `./init.sh`: green.
- Commits (pending):
  - `docs(progress): update current state after rebasing feature branch onto upstream master`
- Known risk or unresolved issue:
  - The local branch history has diverged from `origin/feat/agent-skills-frontend` because of the rebase; a force-push (`--force-with-lease`) is required.
- Next best step:
  - `git push --force-with-lease origin feat/agent-skills-frontend`
  - Open the PR from `feat/agent-skills-frontend` to the upstream `master` branch.

### Session 006 — 2026-06-28
- Date: 2026-06-28
- Goal: redesign the UI to look more professional and less "AI-generated" per user feedback. Scope limited to structure and visual design only — no backend changes, no changes to the information displayed.
- Diagnosis (grounded in the installed `frontend-design` and `web-typography` skills): the previous design carried the common AI "tells" — a pulsing red "En vivo" dot, a big-number hero stat block (the skill literally calls this "the template answer"), rounded pill badges everywhere, green confidence progress bars, a two-tone "VenezuelaSismo" wordmark, and Inter used as a neutral delivery font.
- Design direction chosen: an editorial "boletín de emergencia / observatorio sísmico" identity grounded in the subject (a Venezuelan civil-emergency news service).
  - **Typography**: editorial pairing via `next/font/google` (self-hosted, `display: swap`, no new npm dependency) — `Newsreader` (news serif) for the masthead, headlines and article titles; `Inter` kept as the workhorse sans for UI, data and labels. Exposed as `--font-serif` / `--font-sans` CSS variables and mapped in Tailwind.
  - **Palette**: cool neutral "paper" (`#F4F4F2` / dark `#121317`), near-black `ink`, hairline `rule` borders, and a single institutional accent red (`#B5121B`) used only for the top alert rule, live status and active states. Deliberately not the warm-cream-plus-serif AI cluster.
  - **Signature element**: a seismogram motif — a static trace in the masthead nameplate and an animated bar trace as the live indicator (replacing the pulsing dot).
  - **Layout**: masthead nameplate with eyebrow + date; editorial hero with serif headline, dek and a ruled status dateline strip (keeps the total count as inline data, not a giant number); article feed converted from rounded cards to a ruled editorial list with category kickers (uppercase, in the accent colour), datelines, and verification shown as a small dot + "Verificación NN%" text instead of a green bar; sidebar restyled as an editorial index (underline tabs, ruled sections); stats page rebuilt as a serif total + ruled data table; map and loading states aligned.
- Files changed:
  - `src/app/layout.tsx`: `next/font/google` setup for Newsreader + Inter; body uses `paper`/`ink` tokens.
  - `tailwind.config.js`: editorial `paper`/`panel`/`ink`/`rule` colour system, serif/sans/display font families on CSS vars, masthead/hero/eyebrow type tokens, `seismo` keyframe, refreshed shadows. Kept `surface`/`crisis` aliases for back-compat.
  - `src/app/globals.css`: base typography tied to the new tokens, `tnum` tabular-figures utility, focus rings in accent red.
  - `src/components/Navbar.tsx`: masthead with seismograph nameplate, uppercase underline nav, top alert rule.
  - `src/components/FeedNoticias.tsx`: editorial hero, alert strip, sidebar index, ruled article list, animated seismograph live indicator, editorial empty/loading states. All displayed data preserved (source, language, category, NUEVO, relative time, confidence %).
  - `src/app/stats/page.tsx`: serif total + ruled distribution table.
  - `src/components/MapaSismos.tsx` and `src/app/mapa/page.tsx`: editorial header and loading copy.
  - `src/components/NumerosEmergencia.tsx`: squared institutional FAB and modal header with eyebrow + serif title.
  - `src/app/loading.tsx`: editorial route-transition state.
- Verification:
  - `npx tsc --noEmit`: green.
  - `./init.sh`: green (typecheck, build 6/6 static pages, PWA artifacts). Build emits a non-fatal `Failed to find font override values for font 'Newsreader'` warning (next/font cannot auto-generate fallback metric overrides for this family); the font loads and renders correctly.
  - Playwright MCP screenshots captured (feed light/dark, stats, mobile) and reviewed; temporary mock feed data was injected into `/api/feed` only to verify card rendering and then reverted with `git checkout` (backend untouched).
- Commits (pending):
  - `feat(ui): editorial boletín redesign with news serif, masthead, and ruled article list`
- Files or artifacts updated: `src/app/layout.tsx`, `tailwind.config.js`, `src/app/globals.css`, `src/components/Navbar.tsx`, `src/components/FeedNoticias.tsx`, `src/app/stats/page.tsx`, `src/components/MapaSismos.tsx`, `src/app/mapa/page.tsx`, `src/components/NumerosEmergencia.tsx`, `src/app/loading.tsx`, `PROGRESS.md`.
- Known risk or unresolved issue:
  - The `Newsreader` font-override build warning is cosmetic but noisy; if it becomes a concern, switch to `next/font/local` with self-hosted WOFF2 files, or pick a family with known metric overrides. The redesign also adds a build-time dependency on Google Fonts being reachable (next/font fetches at build, then self-hosts).
  - Emergency modal interior cards still use the legacy `surface`/gray tokens; visually consistent but could be migrated to the `panel`/`rule` system in a follow-up.
  - `NumerosEmergencia` FAB can overlap the last feed card on narrow desktop widths (pre-existing floating-button behaviour).
- Next best step:
  - Review the redesign and merge `feat/agent-skills-frontend` into `master`.
  - Optional follow-ups: resolve the font-override warning, migrate the emergency modal cards to the new tokens, and integrate dark-mode map tiles.

### Session 010 — 2026-07-01
- Date: 2026-07-01
- Goal: mejorar el UI/UX de las páginas de donaciones (/donar) y estadísticas (/stats) usando las directrices de /ui-ux-pro-max y /impeccable, respetando el estilo editorial.
- Completed:
  - Inicialización del contexto estratégico visual mediante los artefactos PRODUCT.md y DESIGN.md bajo el registro "brand".
  - **Página de donaciones**:
    - Remoción de side-stripe borders (bordes izquierdos rojos de 3px) en InsumoCard y OrgCard para eliminar malas prácticas ("AI Tells").
    - Restablecimiento del Hero a su diseño de fondo completo (full-bleed) original con la URL original de Wikimedia y opacidad controlada.
    - Solución del hover bug de OrgCard (fondo negro sobre texto negro en modo claro) mediante transiciones basadas en opacidad.
    - Diferenciación visual de socios locales que no disponen de URL de redirección directa.
  - **Página de estadísticas**:
    - Integración y maquetación de la sección oficial de víctimas y daños (fallecidos, heridos, desaparecidos) expuesta por la API de backend, anteriormente oculta.
    - Rediseño de la cabecera editorial y del panel del boletín (tarjeta asimétrica de reportes verificados).
    - Unificación de los colores de categorías con `FeedNoticias.tsx` y refinamiento de la tabla de distribución (barras más delgadas de 4px de altura, rectangulares y con hover interactivo).
  - Corrección de contrastes WCAG AA (>=4.5:1) en textos secundarios sobre fondo paper en ambas páginas.
- Verification:
  - Compilación limpia de producción y análisis de tipos pasados con éxito (`npm run build`).
- Commits:
  - `6303c33` feat(donar): improve ui-ux and establish design system
  - `daf1f95` feat(stats): improve ui-ux and integrate casualties data
  - `6bc3347` fix(donar): restore full-bleed background image in hero
