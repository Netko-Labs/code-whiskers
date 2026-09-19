# CLAUDE.md

This file applies to the whole repository unless a deeper `CLAUDE.md` overrides it.

## Conventions

Portable code-style and folder-structure rules live in a reusable file imported here:

@docs/conventions.md

That file covers **Vocabulary**, **Modules & Scope** (the `lib/` + `shared/` model), **Backend
Layering**, **Component Authoring**, **State & Wiring**, **Code Style**, and **Workflow** (working
principles, task management, and the commit convention). The sections below stay in this file because
they describe this repo's specific topology, scaffolding, and commands.

## Repository Overview

- Runtime and package manager: `bun@1.4.0`
- TypeScript 7 (native `tsc`); dev servers run through **portless** (`https://{app}.localhost`, names in `portless.json`, `PORTLESS=0` to bypass)
- Monorepo tooling: Turborepo
- Two apps:
  - `apps/studio` — TanStack Start (React 19, Tailwind, Base UI, Tabler Icons) frontend + an **auth-only** Elysia backend (better-auth: magic link + jwt/jwks). Owns the **public hostname** and forwards the whiskers surfaces (`/webhooks/*`, `/api/:projectId/envelope|store`, `/v1/*`) to the worker via `forwardToWhiskers` (`packages/studio/api/src/shared`), byte-for-byte so HMAC/DSN checks still happen in whiskers. `WHISKERS_URL` points at the worker (internal DNS in Coolify).
  - `apps/whiskers` — the 360 code tool **worker** (own process, `https://whiskers.localhost` locally, no public host in prod): GitHub webhook -> AI PR review (AI SDK + OpenRouter, BYOK via `OPENROUTER_API_KEY`), Sentry-SDK-compatible error ingest, read-only `/v1` insights. Packages: `packages/whiskers/{domain,repository,service,api}` + `packages/configs/whiskers-config`. Disposable Docker sandboxes live in `packages/shared/sandbox`.
- Studio packages: `packages/studio/{domain,repository,service,api}` (auth + forwarder) + `packages/configs/studio-config`.
- Two databases: studio (auth tables) and whiskers (reviews, findings, issues, events).
- Shared tooling and UI live under `packages/shared/*` (`cli`, `logger`, `ui`, `typescript-config`).
- **Brand**: `docs/brand.md` (colors, type, voice, rules). The cat mark and expressions ship from `@code-whiskers/ui/brand` (`CatMark`, `CatExpression`); static cuts live in `apps/studio/public/`. Fonts are Inter (interface) + JetBrains Mono (evidence); brand color tokens (`ink`, `paper`, `fog`, `hairline`, `ash`, `severity-*`) are Tailwind theme colors in `globals.css`.

When extending the template with additional apps, colocate app-specific packages under `packages/{app-name}/*` and config under `packages/configs/{app-name}-config`. Keep cross-cutting concerns in `packages/shared/*`.

## Backend Layering

The generic layering pattern and per-layer folder structure (`domain → repository → service → api →
ui`, plus `lib/`/`shared/` and the `domain` folder vocabulary) live in **Backend Layering** in
`@docs/conventions.md`. This section records only the concrete studio-stack specifics:

- `apps/studio` backend is **auth only**: better-auth is mounted at `/api/auth` (magic link + `jwt`/`jwks`). All transactional data + logic lives in whiskers. Put `drizzle-zod` entities in the relevant `domain` package (`createInsertSchema()`/`createUpdateSchema()`/`createSelectSchema()`).
- `apps/whiskers` is a **standalone** Elysia server started with `.listen()`. Elysia validators accept `drizzle-zod`/zod schemas directly (Standard Schema).
- **Cross-service auth**: studio mints a JWT (`GET /api/auth/token`); whiskers verifies it against studio's JWKS (`/api/auth/jwks`) with `jose` — no shared secret.
- **Elysia 2 (pre-release, `2.0.0-beta.14`)**: the whole repo type-checks under TypeScript 7's native `tsc`. `@elysiajs/cors` has no Elysia-2 build yet, so whiskers CORS is hand-rolled in `packages/whiskers/api/src/app.ts` (a `request` hook + an `OPTIONS` preflight route). **All routes live in the api package** — `packages/whiskers/api/src/routes/{webhooks,ingest,insights}.ts` — composed into the one exported `app`; the app entry (`apps/whiskers`) just `.listen()`s it.

## Scaffolding

- **`bun run gen:app`** — Turbo generator in `turbo/generators/config.ts`. Prompts for a name, then creates a studio-type app under `apps/{name}` plus layered packages (`domain`, `repository`, `service`, `api`) and `packages/configs/{name}-config`.
- **Studio template** — `turbo/generators/templates/app-tanstack/`. TanStack Start + Elysia HTTP API: `~/*` path alias, `components/core/root/` shell, Eden Treaty client under `src/integrations/eden/`, TanStack Query provider, `@code-whiskers/ui`, Nitro + Vite 8.
- **Reference app** — treat `apps/studio` as the living example when extending a generated app. Root `CLAUDE.md` applies to all apps unless an app adds a local override.
- **`bun run gen:lib`** — shared library under `packages/shared/{name}`.

## Commands

- Studio (frontend + auth) development: `bun run repo dev --app studio` (https://studio.localhost)
- Whiskers (360 code tool) development: `bun run repo dev --app whiskers` (https://whiskers.localhost)
- Bypass portless (plain `localhost:3000` / `:3002`): `PORTLESS=0 bun run repo dev --app <app>`
- Web production build: `bun run repo build --app studio`
- Web preview: `bun run repo serve --app studio`
- Docker up/down: `bun run repo docker:up --app studio` / `bun run repo docker:down --app studio`
- Repo typecheck: `bun run check-types`
- Repo lint and formatting check: `bun run fmt-lint`
- Repo lint and formatting fix: `bun run fmt-lint:fix`
- Repo tests: `bun run test`
- End-to-end tests: `bun run repo test:e2e`
- Generate app: `bun run gen:app`
- Generate library: `bun run gen:lib`
- Studio DB generate: `bun run repo db:generate --app studio`
- Studio DB migrate: `bun run repo db:migrate --app studio`
- Studio DB push: `bun run repo db:push --app studio`
- Studio DB seed: `bun run repo db:seed --app studio`

## Deploy

Coolify + Railpack, built from the repo root. `bun run repo build --app {app}` emits a self-contained output (`apps/studio/.output` via Nitro's bun preset, `apps/whiskers/dist` via `bun build --target bun`) plus `{out}/migrate/migrate.js` + the drizzle folder. `apps/{app}/railpack.json` (select per Coolify app with `RAILPACK_CONFIG_FILE=apps/{app}/railpack.json`) runs that build and ships only the output + bun into the runtime image; **whiskers migrates itself on startup** — `apps/whiskers/src/index.ts` awaits `runMigrations()` before `.listen()`, resolving the drizzle folder shipped at `{out}/drizzle`. Coolify's pre-deployment hook runs inside the *previous* container, so a hook-only app never applies a migration on the first deploy of the commit that adds it and boots against the old schema. Studio still migrates through that hook (`bun run {out}/migrate/migrate.js`) because Nitro has no equivalent entry point; it carries the same first-deploy caveat. `{out}/migrate/migrate.js` stays for both, and `db:migrate` uses the same `src/db/migrate.ts` locally. The build forces `NODE_ENV=production` (a dev value in `.env` would make Vite emit a development SSR bundle) and needs no secrets. In prod studio serves `https://whiskers.netko.dev` and whiskers has no public host; studio reaches it at `WHISKERS_URL=http://<whiskers app uuid>:3002` on the Coolify network. Devtools are a dev-only lazy import (`components/core/root/root-devtools.tsx`) — Solid-based devtools must never reach the SSR bundle.

## Verification

- Start with the smallest relevant check for the code you changed, then broaden as needed.
- Before handing work off, run the relevant subset of:
  - `bun run check-types`
  - `bun run fmt-lint`
  - `bun run test`
- If database code changes, run the appropriate `db:*` command or explain why it was not run.
- If you cannot run a command, document the reason and note the remaining risk.

## Handoff Notes

- Reference concrete files and commands when summarizing work.
- Call out any follow-up steps needed when contracts or shared packages change.
- Commit freely at logical checkpoints, following the **Commit Convention** in
  `@docs/conventions.md`. Push or open a PR only when asked; never commit directly to main in
  multi-branch repos — branch first.
