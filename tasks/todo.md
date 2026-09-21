# Self-hosted console, internal API, GitHub sync

Three asks, in dependency order. Each lands as its own commit.

## 1 · Console sections that assume a business we don't have

- [ ] Delete `Billing` — invoices, plans, a Visa ending 4402. Fiction for a self-hosted tool.
- [ ] `Usage & quota` → **Instance**: disk, retention, ingest rate against the operator's own
      caps, worker queue depth. No overage rates, no included allowances.
- [ ] Drop `billing` from `SectionView`, `SECTIONS`, and the nav group.
- [ ] 16 sections, not 17.

## 2 · GitHub sync — fill the tables from e26307f

- [ ] `syncGithubInstallations(userId)` in studio service: read the user's GitHub token from
      better-auth `account`, call `/user/installations` and `/user/installations/{id}/repositories`.
- [ ] Upsert `organization`, `organization_member`, `repository`.
- [ ] Run it on sign-in; expose `GET /api/orgs` + `GET /api/repositories` for the console.
- [ ] Org switcher and Repositories read real data, fixtures only until the first sync.

## 3 · `/api/internal/*` — the whiskers → studio direction

- [ ] `triage_state` table + migration (studio). Spec'd in docs/architecture.md, never built.
- [ ] Console writes dismissals/resolutions there instead of only the zustand store.
- [ ] `GET /api/internal/suppressions?repo=` on studio, service-JWT authenticated.
- [ ] Whiskers fetches it in `runReview`, caches briefly, and feeds it into `buildPrContext`
      so a dismissal actually silences the finding.

## Acceptance

- [ ] `bun run check-types`, `bun run fmt-lint`, `bun run test` clean after each.
- [ ] A dismissal in the console survives a reload and reaches the next review.
- [ ] Console shows real orgs and repos for a signed-in GitHub user.
