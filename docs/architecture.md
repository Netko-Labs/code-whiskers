# Architecture

Two databases, one rule.

> **studio owns what a human creates, configures or owns. whiskers owns what machines
> produce at volume.**

The test for any table: *if this database vanished, would a human have to re-enter
something?* Yes → studio. It just re-accumulates → whiskers.

Studio is the source of truth. Whiskers is a worker: webhooks, LLM reviews, ingest,
rollups, scheduled jobs. They talk over HTTP, never over each other's tables.

**CodeWhiskers is a self-hosted tool, not a service.** One team runs one instance against
their own GitHub installations. That is a design constraint, not a footnote:

- **There is no billing, no plan, no seat count, no quota tier.** Limits are operator
  settings, not entitlements.
- **Footprint is a feature.** The whole thing must run on a modest box next to its own
  Postgres. A design that needs a ClickHouse cluster to show a log chart is a design
  that does not get installed.
- **Defaults matter more than ceilings.** Tune for a team of ten with a handful of
  repos; make the numbers configurable for anyone larger.
- **`installation_id` is a dimension, not a tenant.** An instance may watch several
  GitHub orgs; it is not multi-tenant isolation and should not be built like it.

## Boundary contract

1. **No foreign keys across databases.** Whiskers stores `installation_id`,
   `repository_id` and `project_id` as plain values. Referential integrity across a
   network boundary is a lie; whiskers rows referencing a deleted studio row are
   reaped by a job, not by a constraint.
2. **Neither app opens the other's connection.** Studio reads whiskers through
   `/v1/*`. Whiskers reads studio through `/api/internal/*`, and announces what changed
   through `POST /api/internal/events` — a refetch hint, never the data. Studio pushes it to
   open consoles over `/realtime`; the browser then reads through `/v1` as before. The one
   exception to "whiskers only reads" is the **issue lifecycle mirror** below.
3. **Auth differs by direction.** Studio→whiskers is the existing JWT/JWKS handshake:
   studio mints at `GET /api/auth/token`, whiskers verifies against `/api/auth/jwks`
   with `jose`, no shared secret. Whiskers→studio is a shared `INTERNAL_TOKEN`,
   compared in constant time — whiskers has no keypair studio could verify against,
   and minting one for a single-operator tool is ceremony without a threat behind it.
   An unset token leaves `/api/internal/*` closed rather than open. Studio's server-side
   writes into whiskers (`/internal/*`, never forwarded publicly) present the same token.
4. **Whiskers caches studio config** (watched repos, review rules, project keys) with a
   short TTL. A webhook must not block on a studio round trip per event.

```
                    studio (source of truth)                whiskers (worker)
                 ┌──────────────────────────┐            ┌────────────────────┐
  human ────────▶│ identity, connections,   │──/v1/*────▶│ reviews, findings, │
                 │ rules, projects, triage, │◀─internal──│ issues, events,    │
                 │ keys, settings           │            │ logs, spans, jobs  │
                 └──────────────────────────┘            └────────────────────┘
                          studio-db                            whiskers-db
```

## studio-db

### Identity — exists

`user` `session` `account` `verification` `jwks` — better-auth owns these.

### GitHub connection

Keyed by installation: an org we can see but are not installed on has nothing to show.

**`organization`**

| column | type | note |
| --- | --- | --- |
| `installation_id` | bigint PK | GitHub App installation |
| `login` `name` `avatar_url` | text | |
| `account_type` | enum | `User` \| `Organization` |
| `synced_at` | timestamp | |

**`organization_member`** — `(installation_id, user_id)` PK. Which signed-in users see
which installation; written by the sync on login.

**`repository`**

| column | type | note |
| --- | --- | --- |
| `id` | bigint PK | GitHub repo id |
| `installation_id` | bigint | |
| `owner` `name` `language` `default_branch` | text | |
| `is_private` `is_watched` | boolean | `is_watched` gates reviewing |
| `pushed_at` `synced_at` | timestamp | |

### Ingest identity

**`project`** — moved out of whiskers. A human creates a DSN; whiskers only validates it.

| column | type | note |
| --- | --- | --- |
| `id` | text PK | DSN path segment |
| `installation_id` | bigint | |
| `name` | text | |
| `repository` | text null | `owner/name`; its errors, logs and spans show under that repository |
| `public_key` | text null | legacy single key, copied into `project_key` by whiskers 0007; read by nothing |
| `created_at` | timestamp | |

**`project_key`** — a project's client keys; each enabled one is a DSN.

| column | type | note |
| --- | --- | --- |
| `id` | uuid PK | |
| `project_id` | text FK → project, cascade | |
| `public_key` | text unique | what SDKs send as `sentry_key`, OTLP as a bearer |
| `label` | text | `Default` for the migrated key |
| `is_enabled` | boolean | any enabled key ingests; a disabled one 401s |
| `created_at` `last_used_at` | timestamp | `last_used_at` written at most once a minute per key |

The last enabled key cannot be deleted (disabling it is allowed: that pauses ingest). Project ids
come from `project_id_seq` — Sentry SDKs need a numeric id, and a sequence never hands out a deleted
project's id again. Deleting a project cascades its keys, issues, events, logs and spans in
whiskers, then whiskers posts `POST /api/internal/projects/deleted` and studio drops the
`triage_state` / `triage_comment` / `triage_activity` rows under `project:<id>` (best effort: if
studio is down they stay orphaned, harmless since the id is never reused). Project-scoped alert
rules are left for a human to remove.

Today the tables live in whiskers (ingest checks the key on every event). The console's
`?scope=owner/name` reads reviews by repository and telemetry by every project linked to it;
`?scope=project:<id>` covers a project with no repository.

Ingest reads the project's keys from its own database on each envelope; no studio round trip.

### Rules

**`review_rule`** — prose, not config. Whiskers quotes the rule it applied.

| column | type | note |
| --- | --- | --- |
| `id` | uuid PK | |
| `installation_id` | bigint | |
| `body` | text | the rule, in English |
| `scope` | text | glob or `*` |
| `effect` | enum | `blocker` \| `suggestion` \| `filter` \| `tone` |
| `author_user_id` | text | |
| `is_muted` | boolean | |
| `created_at` | timestamp | |

**`alert_rule`** — thresholds over errors, logs and traces.

| column | type | note |
| --- | --- | --- |
| `id` | uuid PK | |
| `installation_id` | bigint | |
| `name` `condition` | text | e.g. `p95(/v2/ingest) > 500ms` |
| `window_seconds` `occurrences` | integer | `5m × 3` |
| `notify` | jsonb | channels, escalation targets |
| `state` | enum | `armed` \| `firing` \| `muted` |

**`saved_query`** — `id`, `installation_id`, `name`, `surface`
(`logs` \| `traces` \| `issues`), `query`, `shared_with` jsonb, `created_by`,
`last_run_at`. An alert rule may reference one.

### Access

**`integration`** — `id`, `installation_id`, `kind`
(`github` \| `slack` \| `pagerduty` \| `otel` \| `linear` \| `gitlab`), `status`,
`scope` jsonb, `connected_by`, `connected_at`.

**`api_key`** — `id`, `installation_id`, `name`, `prefix` (shown in the UI),
`hash` (never the key), `scope` jsonb, `environment`, `created_by`, `last_used_at`,
`rotated_at`, `revoked_at`.

### Triage decisions

**`triage_state`** — the console's resolve / archive / approve / assign / snooze. Human decisions
*about* machine output, so they live on the human side and reference whiskers by id.

| column | type | note |
| --- | --- | --- |
| `id` | uuid PK | |
| `installation_id` | bigint | |
| `item_kind` | enum | `issue` \| `review` \| `log` |
| `item_ref` | text | the whiskers row id — no FK |
| `status` | enum | `open` \| `resolved` \| `archived` \| `snoozed` \| `tracked` \| `approved` \| `dismissed` — issues use `open` / `resolved` / `archived` |
| `assignee_user_id` | text | nullable |
| `snoozed_until` | timestamp | nullable; reviews and logs |
| `resolve_mode` | text | issues: `now` \| `next_release` |
| `archive_mode` `archive_value` | text | issues: `forever` \| `until` (ISO time) \| `events` \| `users` (count) |
| `mirrored_at` | timestamp | issues: when whiskers took the decision; null = not yet |
| `note` | text | why it was dismissed |
| `updated_by` `updated_at` | | |

Unique on `(scope, item_kind, item_ref)`.

**`triage_activity`** — `id`, `scope`, `item_kind`, `item_ref`, `kind` (`resolved` \|
`unresolved` \| `archived` \| `regressed` \| `unarchived` \| `assigned` \| `commented`),
`actor_user_id` (null = whiskers), `data` jsonb, `created_at`. The item's timeline;
`triage_comment` keeps comment bodies, and `GET /api/triage/activity` merges the two.

#### The issue lifecycle mirror

An issue is `unresolved`, `resolved` (now, or in the next release) or `archived` (forever, until a
time, or until N more events / distinct users). Studio decides; whiskers has to *act* on the
decision at ingest, where a studio round trip per event is not an option. So whiskers keeps a
mirror on `issue`, and the two sides talk both ways with `INTERNAL_TOKEN`:

```
 console ──POST /api/triage/issues/lifecycle (scope project:<id>)──▶ studio authorizes
                                                  │  write-through (bulk, ≤100 ids + projectId)
                                                  ▼
                                   whiskers POST /internal/issues/lifecycle → issue.status…
                                                  │  only that project's ids come back
                                                  ▼
                                   studio: triage_state + triage_activity for those ids
 SDK event ──▶ whiskers ingest: resolved + recurrence → unresolved (`regressed_at`)
                                archived + condition met → unresolved
                                  │
                                  ▼
               studio POST /api/internal/issues/transition → triage_state `open`,
                                system activity, realtime `issues`
```

Resolve-in-next-release records the issue's latest release; an event regresses it only when its
release differs *and* first reached the project after the resolve. Whiskers updates only
`issue.project_id = projectId`, so an id from another project changes nothing on either side. A
write-through that fails cannot check the ids: studio records the whole selection under the
authorized scope with `mirrored_at` null, the response says `mirrored: false`, and a sweep every
five minutes pushes every unmirrored issue decision bound to its row's project (whiskers ignores
mismatches; the sweep also carried the decisions made before the mirror existed).

### Instance settings

No billing tables. A self-hosted instance has an operator, not a customer.

**`setting`** — `key` PK, `value` jsonb, `updated_by`, `updated_at`. One row per knob:
raw log retention days, rollup retention days, ingest rate cap, review concurrency,
default review model. These are the things a plan tier would have decided for you.

**`usage_rollup`** — `(meter, period_start)` PK, `meter`
(`events` \| `log_lines` \| `spans` \| `reviews`), `count`, `bytes`, `updated_at`.

**Decision: whiskers pushes rollups into studio.** Not for billing — so the operator can
see ingest volume against their configured retention and disk, and so that view still
works when the worker is wedged. Cost is one row per meter per period. Whiskers keeps
raw counts locally and pushes on a schedule.

## whiskers-db

### Code review

**`review`** — `id`, `installation_id`, `repository_id`, `pr_number`, `head_sha`,
`title`, `author`, `additions`, `deletions`, `status`
(`pending` \| `running` \| `completed` \| `failed`), `verdict`
(`approve` \| `request_changes` \| `comment`), `summary`, `model`, `created_at`,
`completed_at`.

**`finding`** — `id`, `review_id` (FK, same DB), `file`, `line`, `severity`, `category`,
`title`, `body`, `suggestion`, `created_at`.

### Errors

**`issue`** — `id`, `project_id`, `fingerprint`, `title`, `level`, `culprit`, `event_count`,
`user_count`, `first_seen`, `last_seen`, `last_release`. Unique on
`(project_id, fingerprint)`. The lifecycle columns — `status` (`unresolved` \| `resolved` \|
`archived`), `resolved_in_release`, `resolved_at`, `archived_until`, `archive_until_events`,
`archive_until_users` (target totals), `regressed_at` — are a **mirror** of studio's
`triage_state`, never decided here except by a recurrence. Badges (`new`, `regressed`,
`spiking`) are derived per read, never stored.

**`event`** — partitioned by `received_at`. `id`, `issue_id`, `project_id`, `event_id`,
`level`, `message`, `environment`, `release`, `user_key` (sha256 of the SDK's user id, else
email, else IP — counts people without holding who they are), `payload` jsonb, `received_at`.
Unique on `(project_id, event_id)` so SDK retries are stored once.

**`release`** — `id`, `project_id`, `version`, `deployed_at`, `deployed_by`,
`crash_free_rate`, `adoption`, `new_issue_count`, `regression_count`.

**`regression`** — `id`, `issue_id`, `resolved_at`, `reopened_at`, `suspect_sha`,
`suspect_pr`. Written when an issue fires after a `triage_state` resolve.

### Telemetry

**`log_line`** — partitioned daily. `ts`, `project_id`, `level`, `service`, `message`,
`trace_id`, `attributes` jsonb.

**`span`** — partitioned daily. `trace_id`, `span_id`, `parent_span_id`, `project_id`,
`service`, `name`, `duration_ms`, `status`, `ts`, `attributes` jsonb.

**`service`** — rollup. `(project_id, name)` PK, `p95_ms`, `throughput_per_day`,
`error_rate`, `version`, `owner_team`, `last_seen`.

### Work

**`job`** — `id`, `kind` (`review` \| `fix` \| `sync` \| `rollup` \| `reap`), `ref`,
`status`, `attempts`, `scheduled_at`, `started_at`, `finished_at`, `error`.

## Telemetry at volume, on Postgres

The design's own numbers: **1.2M events/day** and **18.4M log lines/day**. At ~200 bytes
a row that is ~3.7 GB/day of raw logs. Postgres handles this — but only if the hot path
never scans raw data and the indexes stay small.

Self-hosting makes this a hard constraint rather than a cost optimisation: the operator
installing this has one box and one Postgres, and every extra service is a reason not to
install. Everything below stays inside the database they already run.

**Four rules, all vanilla Postgres:**

1. **Daily partitions** on `log_line`, `span` and `event`. Retention is
   `DROP PARTITION`, not `DELETE` — no vacuum storm, no bloat.
2. **BRIN, not btree, on the timestamp.** A BRIN index over a naturally time-ordered
   column is kilobytes where a btree is ~10% of table size. This is the single biggest
   memory win available.
3. **Dashboards read rollups, never raw.** A `log_rollup_1m` keyed by
   `(project_id, service, level, minute)` answers every chart in the console. Raw is
   only touched when a human opens a specific trace or searches a window.
4. **Short raw retention, long rollup retention.** 7 days raw, 90 days rolled up. Raw
   footprint stays ~26 GB; rollups are megabytes.

**If that stops being enough**, the ladder — cheapest first, ClickHouse last:

| Step | What | Cost |
| --- | --- | --- |
| 1 | **TimescaleDB** — hypertables, native compression, continuous aggregates | still Postgres, no new service; 10–20× compression |
| 2 | **Parquet on object storage + DuckDB** for cold reads | embedded, ~100 MB RSS, no cluster |
| 3 | **Quickwit** — object-storage-native log search | one binary, far lighter than a CH cluster |
| 4 | ClickHouse | only if 1–3 genuinely fail |

Timescale is the natural first move because nothing above the driver changes.

## Feature → home

| Console surface | studio | whiskers |
| --- | --- | --- |
| Triage inbox / assigned / snoozed | `triage_state` | `review` `issue` `log_line` |
| Pull requests | `repository` | `review` `finding` |
| Repositories | `repository` `organization` | review counts |
| Codebase map | `repository` ownership | `finding` `span` risk |
| Review rules | `review_rule` | — |
| Issues / Regressions | `triage_state` | `issue` `event` `regression` |
| Releases | — | `release` |
| Alert rules | `alert_rule` | evaluation in `job` |
| Live logs / Traces / Services | `saved_query` | `log_line` `span` `service` |
| Saved queries | `saved_query` | — |
| Members | `user` `organization_member` | — |
| Integrations | `integration` | — |
| API keys | `api_key` | — |
| Instance | `setting` `usage_rollup` | raw counts, pushed |

## Migration path from today

0. ~~Drop the billing and quota surfaces from the console.~~ Done: `Billing` deleted,
   `Usage & quota` is now `Instance`. Sixteen sections, and the numbers on it are disk,
   retention, ingest rate and queue depth — still fixtures until `setting` and `usage_rollup`
   exist.
1. `project` moves studio-ward; whiskers keeps a cached copy for ingest.
2. ~~`issue.status` drops in favour of `triage_state`.~~ Superseded: `triage_state` decides,
   and `issue.status` became its mirror (whiskers 0006, studio 0011) so ingest can reopen.
3. Whiskers gains `installation_id` and `repository_id` on `review`.
4. ~~Studio gains the GitHub, rules, access and triage tables.~~ Done (migrations 0003–0010):
   `organization`, `organization_member`, `repository`, `triage_state`, `triage_comment`,
   `review_rule`, `api_key`, `integration`, `alert_rule`, `saved_query`. No commercial tables —
   this is a self-hosted tool.
5. ~~`/api/internal/*` appears on studio.~~ Done: `GET /api/internal/suppressions?scope=`
   returns what a human dismissed, resolved or snoozed; whiskers caches it for 60s and
   feeds it into the review preamble. An unreachable studio degrades to "nothing
   suppressed" rather than failing the review. Newest 200 only; past that studio sets
   `x-suppressions-truncated: true` and whiskers logs it. `POST /api/triage` only
   writes under an `owner/repo` scope the caller is a member of. Since then:
   `/api/internal/rules`, `/api/internal/repository` (is it watched?),
   `/api/internal/alert-rules` and `/api/internal/alert-rules/:id/fire|quiet` — whiskers
   evaluates alert conditions every minute and studio delivers them to webhooks.
6. Telemetry landed on Postgres as planned: `log_line` and `span` in whiskers (migration 0002),
   BRIN on time, deleted by age after `TELEMETRY_RETENTION_DAYS` (default 7) by an hourly
   pass. Ingest is OTLP/HTTP JSON at `/otlp/v1/logs|traces`, authenticated by the project's
   public key. No partitioning or rollups yet; that is the next step if volume asks for it.
