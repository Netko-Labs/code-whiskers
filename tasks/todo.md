# Finish the console — every section on real data

16 sections; 2 are real today (Pull requests, Repositories). The spec for every other one is the
"Feature → home" table in docs/architecture.md. One commit per item; nav counts and sample
fallbacks go away as each lands.

## 0 · Blockers

- [x] `/v1/*` was public — gate behind the studio session (12ca583)

## A · Sections whose data already exists (~half a day)

- [x] Triage on studio: decisions read back, assign to teammates, snooze, comments, findings
      with per-finding dismiss, real viewer, notifications from live items, ⌘K, j/k, filter
- [x] Nav counts from live data, not constants
- [x] Issues ← `/v1/issues`
- [x] Members ← `organization_member` + `user` (`GET /api/members`)
- [x] Codebase map ← findings grouped by directory (`/v1/hotspots`)
- [x] Instance ← `/v1/instance` + `/api/instance/storage`: both databases, activity, latency

## B · Studio-owned configuration, with forms (~1 day)

- [x] Review rules → `review_rule`; whiskers reads `/api/internal/rules` into the prompt
- [x] API keys → `api_key` (hashed, shown once) — read access to `/v1`
- [x] Integrations → `integration` (webhook targets) + error-ingest projects with DSNs + GitHub App status
- [ ] Saved queries → `saved_query`
- [x] Alert rules → `alert_rule` + evaluator in whiskers, delivered by studio

## C · Whiskers telemetry (~1–2 days)

- [x] Releases ← `event.release`; Regressions ← resolved issues that come back (also back in the inbox)
- [ ] Live logs ← OTLP/HTTP logs → `log_line` (daily partitions, BRIN) + live tail
- [ ] Traces + Services ← OTLP/HTTP traces → `span`, `service` rollup

## Acceptance

- [ ] No section renders sample data once its source has rows
- [ ] `bun run check-types`, `bun run fmt-lint`, `bun run test` clean after each item
- [ ] Each migration deployed and checked on both Coolify apps

## Known gaps

- `/v1/reviews` stops at the newest 100 rows; Pull requests, triage and counts inherit the cap.
- Issues are triaged under `project:<id>` by any signed-in user until projects gain an owner (B).

## Open questions

1. API keys: read access to `/v1` for scripts, or ingest keys for SDKs, or both?
2. Telemetry ingest: OTLP/HTTP JSON first, protobuf later?
3. Alert delivery: webhook (Slack/Discord-compatible) only, now that email is gone?
