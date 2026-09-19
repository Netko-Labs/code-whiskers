# Architecture

Two databases, one rule.

> **studio owns what a human creates, configures or owns. whiskers owns what machines
> produce at volume.**

The test for any table: *if this database vanished, would a human have to re-enter
something?* Yes → studio. It just re-accumulates → whiskers.

Studio is the source of truth. Whiskers is a worker: webhooks, LLM reviews, ingest,
rollups, scheduled jobs. They talk over HTTP, never over each other's tables.

## Boundary contract

1. **No foreign keys across databases.** Whiskers stores `installation_id`,
   `repository_id` and `project_id` as plain values. Referential integrity across a
   network boundary is a lie; whiskers rows referencing a deleted studio row are
   reaped by a job, not by a constraint.
2. **Neither app opens the other's connection.** Studio reads whiskers through
   `/v1/*`. Whiskers reads studio through `/api/internal/*`.
3. **Auth is the existing JWT/JWKS handshake.** Studio mints at `GET /api/auth/token`;
   whiskers verifies against `/api/auth/jwks` with `jose`. No shared secret. The
   whiskers→studio direction uses a service token minted the same way.
4. **Whiskers caches studio config** (watched repos, review rules, project keys) with a
   short TTL. A webhook must not block on a studio round trip per event.

```
                    studio (source of truth)                whiskers (worker)
                 ┌──────────────────────────┐            ┌────────────────────┐
  human ────────▶│ identity, connections,   │──/v1/*────▶│ reviews, findings, │
                 │ rules, projects, triage, │◀─internal──│ issues, events,    │
                 │ keys, billing            │            │ logs, spans, jobs  │
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
| `public_key` | text | what SDKs send as `sentry_key` |
| `created_at` | timestamp | |

Whiskers caches `(id, public_key)` — ingest cannot round-trip per event.

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

**`triage_state`** — the console's resolve / approve / assign / snooze. Human decisions
*about* machine output, so they live on the human side and reference whiskers by id.

| column | type | note |
| --- | --- | --- |
| `id` | uuid PK | |
| `installation_id` | bigint | |
| `item_kind` | enum | `issue` \| `review` \| `log` |
| `item_ref` | text | the whiskers row id — no FK |
| `status` | enum | `open` \| `resolved` \| `snoozed` \| `tracked` \| `approved` \| `dismissed` |
| `assignee_user_id` | text | nullable |
| `snoozed_until` | timestamp | nullable |
| `note` | text | why it was dismissed |
| `updated_by` `updated_at` | | |

Unique on `(installation_id, item_kind, item_ref)`.

### Commercial

**`subscription`** — `installation_id` PK, `plan`, `seats_used`, `seats_included`,
`renews_at`, `payment_ref`, `status`.

**`usage_counter`** — `(installation_id, meter, period_start)` PK, `meter`
(`events` \| `log_lines` \| `spans` \| `reviews`), `used`, `included`, `updated_at`.

**Decision: whiskers pushes rollups into studio.** Billing stays readable and correct
when whiskers is down, the console reads quota alongside everything else it reads from
studio, and the write cost is one row per meter per period per installation — trivial.
Whiskers keeps raw counts locally and pushes a rollup on a schedule.

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

**`issue`** — `id`, `project_id`, `fingerprint`, `title`, `level`, `event_count`,
`user_count`, `first_seen`, `last_seen`, `last_release`. Unique on
`(project_id, fingerprint)`. Note there is **no `status`** — resolution is
`triage_state` in studio.

**`event`** — partitioned by `received_at`. `id`, `issue_id`, `project_id`, `event_id`,
`level`, `message`, `environment`, `release`, `payload` jsonb, `received_at`.

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
| Usage & quota | `usage_counter` | raw counts, pushed |
| Billing | `subscription` | — |

## Migration path from today

1. `project` moves studio-ward; whiskers keeps a cached copy for ingest.
2. `issue.status` drops in favour of `triage_state`.
3. Whiskers gains `installation_id` and `repository_id` on `review`.
4. Studio gains the GitHub, rules, access, triage and commercial tables.
5. `/api/internal/*` appears on studio for the whiskers→studio direction.
