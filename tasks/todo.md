# Self-hosted console, internal API, GitHub sync

Three asks, in dependency order. Each lands as its own commit.

## 1 · Console sections that assume a business we don't have

- [x] Delete `Billing` — invoices, plans, a Visa ending 4402. Fiction for a self-hosted tool.
- [x] `Usage & quota` → **Instance**: disk, retention, ingest rate against the operator's own
      caps, worker queue depth. No overage rates, no included allowances.
- [x] Drop `billing` from `SectionView`, `SECTIONS`, and the nav group.
- [x] 16 sections, not 17.

## 2 · GitHub sync — fill the tables from e26307f

- [x] `syncGithubInstallations(userId)` in studio service: read the user's GitHub token from
      better-auth `account`, call `/user/installations` and `/user/installations/{id}/repositories`.
- [x] Upsert `organization`, `organization_member`, `repository`.
- [x] Run it on sign-in; expose `GET /api/orgs` + `GET /api/repositories` for the console.
- [x] Org switcher and Repositories read real data, fixtures only until the first sync.

## 3 · `/api/internal/*` — the whiskers → studio direction

- [x] `triage_state` table + migration (studio). Spec'd in docs/architecture.md, never built.
- [x] Console writes dismissals/resolutions there instead of only the zustand store.
- [x] `GET /api/internal/suppressions?repo=` on studio, service-JWT authenticated.
- [x] Whiskers fetches it in `runReview`, caches briefly, and feeds it into `buildPrContext`
      so a dismissal actually silences the finding.

## Acceptance

- [x] `bun run check-types`, `bun run fmt-lint`, `bun run test` clean after each.
- [x] A dismissal in the console survives a reload and reaches the next review.
- [x] Console shows real orgs and repos for a signed-in GitHub user.

## Done — b0e399c, 3b57545, b263004

All three landed. Not yet exercised against production: the sync needs a GitHub sign-in (the
magic-link account has no GitHub token, so `octokitForUser` returns null and the console keeps the
sample orgs), and suppressions need `INTERNAL_TOKEN` set on both Coolify apps — unset, the surface
stays closed and whiskers reads nothing.
