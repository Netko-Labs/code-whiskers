# Console — porting "Code Whiskers Console.dc.html"

Source: Claude Design project `741c426a` → file `Code Whiskers Console.dc.html`.
Target: `apps/studio`, routes under `/console`.

Decisions taken with Juan up front:
- **Full parity** — triage flow *and* all 17 section views.
- **Wire whiskers `/v1` now** for issues + reviews; fixtures for everything the DB
  does not store (logs, traces, org, billing, and all rich detail).
- **Light / Dark / System** via `next-themes`; sign-in stays dark on purpose.

## Acceptance criteria

- [x] `/console` renders the shell: dark rail (collapsed) ↔ dark sidebar (open), 5 nav groups,
      org switcher, notifications popover, user menu with the theme segmented control.
- [x] `/console/triage/{inbox,assigned,snoozed}` renders list column + detail pane, with the
      three detail modes (error / review / log) matching the prototype's structure.
- [x] All 17 section views render at `/console/{section}` with their own stats, tabs, columns,
      rows and footer.
- [x] Fix drawer, toast (with Undo), assign popover, review comment box all behave as designed.
- [x] Issues + reviews come from `/v1`; sample data is clearly labelled when the DB is empty.
- [x] `bun run check-types`, `bun run fmt-lint`, `bun run test` all clean.
- [x] ≤300 lines/file, ≤3 hooks/component, barrels re-export only, no inline types in `.tsx`.

## Steps

### 1 · Foundation
- [x] Console tokens in `packages/shared/ui/src/styles/globals.css` (surface/hairline/faint tiers +
      theme-aware severity inks).
- [x] `next-themes` provider in `root-document.tsx`; drop the hardcoded `class="dark"`.
- [x] Add `zustand` to `apps/studio`.
- [x] `integrations/whiskers/` — typed `/v1` client + query options.

### 2 · Shell & navigation
- [x] `routes/console.tsx` (layout + auth guard), `console/index.tsx` (redirect).
- [x] `components/console/console-shell/`, `console-nav/` (+ rail, org switcher, notifications,
      user menu), `use-console-store.ts`.

### 3 · Triage
- [x] `routes/console/triage.$bucket.tsx`, list column, detail header/banner/assistant.
- [x] Error detail (stack / breadcrumbs / log context / tags), review detail, log detail.
- [x] Fix drawer + toast.

### 4 · Sections
- [x] `routes/console/$section.tsx` + generic section view.
- [x] 17 section definitions under `components/console/section/lib/values/`.

### 5 · Verify
- [x] typecheck / lint / tests.
- [x] Run studio, screenshot light + dark.

## Done

All acceptance criteria met and verified in the running app (light + dark): shell, triage with the
three detail modes, all 17 section views, fix drawer, toast, theme picker. `check-types`,
`fmt-lint` and `test` are clean.

## Open questions
- Brand severity palette (`#FF4D4D / #FFB020 / #2EE59D / #5B9BFF` in `docs/brand.md`) does **not**
  match the console design (`#E7000B / #F59E0B / #16A34A / #2B7FFF`). Console tokens are added
  alongside the brand ones rather than overwriting them — needs reconciling in `docs/brand.md`.

- Nav open/collapsed state is in-memory only — it resets on reload. The prototype behaves the same;
  worth persisting if it annoys.
- `/v1` has no logs, traces, org or billing data, so those sections stay fixture-only. Triage falls
  back to the sample set and labels itself when the API returns nothing or is unreachable.
