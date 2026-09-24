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
