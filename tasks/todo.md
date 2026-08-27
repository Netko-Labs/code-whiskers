# code-whiskers — 360 code tool

Self-hosted BYOK: AI code review (PR approval) + Sentry-SDK-compatible error tracker.
LLM: Vercel AI SDK + @openrouter/ai-sdk-provider. Sandboxes: built from scratch
(eve's sandbox is framework-coupled; we steal its design: Docker, /workspace, TTL reap).

## Phase 1 — skeleton
- [x] Generate `whiskers` app group (headless Elysia, realtime-type)
- [x] Install deps: ai, @openrouter/ai-sdk-provider, octokit, parse-diff
- [x] `packages/shared/sandbox` — disposable Docker sandbox lib (from scratch)

## Phase 2 — review vertical
- [x] domain: review tables (repos, reviews, findings) + zod finding schema for generateObject
- [x] service: diff → parse-diff chunks → LLM findings → verdict (approve | request_changes)
- [x] service: octokit — fetch PR diff, post review w/ line comments, approve
- [x] api: POST /webhooks/github (HMAC verify, async process)

## Phase 3 — tracker vertical (sentry compat)
- [x] domain: projects, issues, events tables + envelope schemas
- [x] service: DSN key auth, envelope/store parse, fingerprint grouping
- [x] api: POST /api/:projectId/envelope + /store, GET /v1/overview, /v1/issues

## Phase 4 — verify
- [x] bun test units (chunking, grouping, sandbox lifecycle w/ docker guard)
- [x] e2e: @sentry/node against local server (port from old tests/sentry-sdk-e2e.ts)
- [x] check-types + fmt-lint clean

## Acceptance
- Sentry SDK captureException lands as grouped issue via envelope endpoint
- GitHub webhook on PR → findings stored → review posted (approve when clean)
- Sandbox: create → exec → destroy, TTL reaper, no container leaks
- BYOK: OPENROUTER_API_KEY + model from env, never committed

## Out of scope (later)
- pg-boss queue, GitLab, dashboards in studio, SLA policies, releases/sourcemaps

## Status 2026-08-27
Phases 1–4 done. Verified: unit (11 pass), sandbox lifecycle vs real Docker,
sentry e2e (@sentry/node -> envelope -> grouped issues, 401 on bad key),
LLM smoke vs OpenRouter (caught planted security+bug findings).
Unverified: postPrReview against a real GitHub PR (needs GITHUB_TOKEN + webhook).
