# Review engine — agents push, whiskers reviews to mergeable (2026-10-12)

Plan rendered in-thread (decisions, loop, memory, MCP, contract). Bot stays read-only; PR comments
are the source of truth; memory in studio Postgres (scope org → repo → folders, full-text, no
vector DB); notes auto-apply, humans audit; human merges unless a repo lets the agent.

- [x] PR 1 · Repo memory (`feat/repo-memory`): `memory_note` + `memory_activity`, console
      Memory page + activity with undo, `/api/memory`, internal read/write/used, whiskers
      memory context (rules always, rest ranked by full-text), review_rule migrated + dropped,
      conventions read from the base branch, settled list = findings only
- [ ] PR 2 · Verdict contract (`feat/verdict-contract`, parallel agent): fingerprints,
      done_when, loop verdict + round, fixed-thread resolve, check run JSON, `/v1` contract
- [ ] PR 3 · MCP server + `cw_` `loop` scope + `/whiskers-loop` Claude Code skill
- [ ] PR 4 · Learning loop + Haiku→Sonnet engine + reviewer memory tools + repo summary
- [ ] PR 5 · Merge brief, 5-round/stall limits, per-repo autonomy, merge_readiness
- [ ] PR 6 · Production context (issues/errors per changed file) in notes and findings

## Acceptance (PR 1)

- [x] A note added in the console reaches the next review prompt; scope inheritance + budget tested
- [x] Existing review rules survive the migration as notes (throwaway Postgres 17)
- [x] `fmt-lint`, `check-types`, `test`, studio build clean; service smoke 15/15 on Postgres

---

# Scope + review redesign (2026-09-24)

Juan: "many things not associated with a repo or a project, so it's hard to filter; improve
design and usability, especially reviews". References: Sentry project picker, Linear rows with a
project chip, Graphite PR page with a status sidebar (Mobbin).

- [x] `project.repository` (whiskers 0004, shipped alone first, healed by a manual redeploy)
- [x] Telemetry reads take `projectId` (comma list): issues, logs, log patterns, traces, services,
      releases; `POST /v1/projects/:id/repository`
- [x] `?scope=` on `/console`, retained across navigation; picker in triage + 8 data sections
- [x] Triage rows carry a repo/project chip; project names replace ids; header chip scopes
- [x] Integrations → Error ingest: repository column, Link/Change repository, repo on create
- [x] Review screen: outcome card, details sidebar, push timeline, findings grouped by file,
      severity filter, dismissed toggle, collapsible read
- [x] Studio app got `bun test` (scope resolution, file grouping, outcome)

## Acceptance

- [x] Local: linking a project puts its errors under the repo; scope survives nav; "All" clears it
- [x] `check-types`, `fmt-lint`, `test` clean
- [x] Prod: 72c2724 live on both apps, review screen renders, new project routes answer

---

# Finish the console — every section on real data

All 16 sections read real data; each shows its labelled sample only while its source is empty.
The spec was the "Feature → home" table in docs/architecture.md.

## 0 · Blockers

- [x] `/v1/*` was public — gate behind the studio session (12ca583)
- [x] Signing in is not access: `/v1` and project triage need an installation membership
- [x] GitHub sync failed in production (sign-in is an OAuth App) — whiskers answers access with
      the App's credentials until the config is switched (see Needs Juan)

## A · Sections whose data already exists

- [x] Triage on studio: decisions read back, assign, snooze, comments, per-finding dismiss, real
      viewer, notifications, ⌘K, j/k/e/s, filter, push history, re-run review, live issue evidence
- [x] Nav counts from live data
- [x] Issues, Members, Codebase map (+ CODEOWNERS owners), Instance (+ setup checklist, reviewer
      token usage)

## B · Studio-owned configuration, with forms

- [x] Review rules — read by the reviewer, filtered by glob against the diff
- [x] API keys — read-only `/v1`, hashed, shown once
- [x] Integrations — webhooks (SSRF-guarded), error-ingest projects with DSNs, GitHub App status
- [x] Saved queries — Live logs, Traces, Issues
- [x] Alert rules — evaluated by whiskers every minute, delivered by studio
- [x] Repositories — pause/resume reviews, sync on demand

## C · Whiskers telemetry

- [x] Releases, Regressions (and regressions back in the inbox)
- [x] Live logs, Traces (waterfall), Services — OTLP/HTTP JSON at `/otlp`, 5 MB cap
- [x] Error log patterns in triage
- [x] Retention: logs/spans `TELEMETRY_RETENTION_DAYS` (7), error events
      `ERROR_EVENT_RETENTION_DAYS` (90)

## Acceptance

- [x] No section renders sample data once its source has rows (local sweep, 0 page errors)
- [x] `bun run check-types`, `bun run fmt-lint`, `bun run test` clean
- [x] Migrations deployed: studio 0005–0010, whiskers 0002–0003; prod smoke 26/26, signed-in reads 20/20

## Needs Juan

1. Sign in with the GitHub App's own OAuth: set studio `GITHUB_CLIENT_ID`/`SECRET` to the App's
   client id `Iv23liAPFcHsGJsfh7Vr` and a generated secret, callback
   `https://whiskers.netko.dev/api/auth/callback/github`. The whiskers fallback covers it until then.
2. Studio still carries `USESEND_URL`, `USESEND_API_KEY`, `EMAIL_FROM` — unused since GitHub-only.
3. Nothing sends OTLP or Sentry events to production yet: create a project under Integrations.

## Known gaps

- Everyone with installation access sees every installation's reviews and issues — `/v1` is not
  yet scoped per installation. Fine for one team; not for several unrelated ones.
- Alert rules evaluate against all projects when no project is picked.
- No partitioning or rollups for telemetry yet; BRIN + retention until volume says otherwise.
