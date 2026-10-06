# Design system

The contract for every console screen. Brand rules (`docs/brand.md`) still win; code style and
folders follow `docs/conventions.md`. Direction: Sentry's evidence, PostHog's breadth, Linear's
calm. Dark-first with full light parity, dense but airy, hairlines over boxes, one accent (ink /
paper), chromatic color only for severity or data, mono for evidence, motion that explains a
state change and then gets out of the way.

## Tokens

All tokens live in `packages/shared/ui/src/styles/tokens.css` (values) and `motion.css` (motion).
They resolve by theme; a component never picks a hex. Use the Tailwind names below.

### Color

| Use | Class | Notes |
| --- | --- | --- |
| Shell ground behind the sidebar and panel | `bg-canvas` | the sidebar is `bg-sidebar` (= canvas) |
| Page / panel surface | `bg-background` | the inset panel and every page |
| Raised box, popover, dialog | `bg-card`, `bg-popover` | dark: one step lighter than background |
| Row hover / selected | `bg-surface-hover`, `bg-surface-selected` | translucent, work on any ground |
| Band / code chip / group header | `bg-surface-subtle`, `bg-muted` | |
| Every border | `border-border` | 1px hairline; `rule-soft` for row dividers, `rule-strong` for emphasis |
| Text | `text-foreground`, `text-body`, `text-muted-foreground`, `text-faint` | primary → hint |
| Severity fill (dots, rules, bars) | `bg-severity-{error,warning,resolved,info}` | never a filled card |
| Severity text | `text-severity-{name}-ink` | contrast-safe in both themes |
| Charts | `chart-1` … `chart-5` | the five system blues; an error series alone may be red |
| Focus | `ring` (blue) | via `focus-ring` utilities, never custom outlines |

`ink`, `paper`, `fog`, `hairline`, `ash` and `ink-*` are fixed brand constants for surfaces that
are dark (or light) in both themes, e.g. code panes. A pane that is dark regardless of theme
carries the `dark` class so tokens inside it resolve dark (toasts, log and stack panes).

### Type

| Step | Class | Use |
| --- | --- | --- |
| Display 44/48 | `text-display font-bold` | marketing, sign-in |
| Heading 30/36 | `text-heading font-bold` | rare: dashboard hero numbers |
| Title 20/28 | `text-title font-semibold` | page titles (`PageHeader`) |
| UI 13/20 | `text-ui` | console body, rows, menus — the default |
| Nav 12/16 | `text-nav` | sidebar rows, workspace switcher, search button, user menu — a step under the page |
| Small 11/16 | `text-2xs` | labels, meta, column headers, hints |

Inter for product, JetBrains Mono (`font-mono`) for evidence: ids, shas, paths, stack frames,
counts and ages in tables. Numbers that line up use `tabular-nums`. Sentence case everywhere.

### Density, radii, elevation

- Spacing tokens: `h-row` (36px list row), `h-row-compact` (30px), `h-topbar` (44px),
  `w-sidebar` (240px), `w-rail` (52px), `px-gutter` (24px page gutter).
- Radius base 8px: `rounded-md` controls, `rounded-lg` menus/inputs, `rounded-xl` panels and
  dialogs. Pills `rounded-full`.
- Elevation: `shadow-raised` (buttons, toggles), `shadow-panel` (the inset page panel),
  `shadow-overlay` (popovers, menus, dialogs, toasts). Depth is a hairline plus a soft shadow.

## Motion

Tokens: `--motion-fast` 120ms, `--motion-base` 180ms, `--motion-slow` 240ms; easings
`ease-out-quart` (default for transitions) and `ease-out-expo` (entrances).

| Utility | Use |
| --- | --- |
| `animate-enter` | fade in: crumbs, counts, swapped content |
| `animate-enter-up` | 4px rise: empty states, toasts, page content |
| `animate-enter-scale` | 97% → 100%: chips, badges appearing |
| `animate-enter-right` | detail panes sliding in |
| `stagger` (on a parent) | children rise one by one, 24ms apart, capped at 12 |
| `shimmer` / `<Skeleton>` | loading placeholders |
| `animate-live` | the ring behind `LiveDot` |
| `animate-highlight` | a row that just arrived over realtime |
| `animate-draw` | sparkline stroke drawing in |
| `hover-lift` | clickable cards: 1px lift + raised shadow |
| `duration-fast` / `duration-base` / `duration-slow` | with `transition-*` |

Rules: motion explains a change (arrived, moved, opened); 120–240ms, ease-out, no bounce, no
loops except waiting states (`shimmer`, `LiveDot`, the cat in empty states). Alerts arrive, they
don't shake. Route changes cross-fade the page panel only (View Transitions, path changes only;
search-param changes never animate). Reduced motion zeroes every token: nothing moves, fades
become instant, `useCountUp` jumps, `EmptyState` keeps the cat still. It comes from the OS
setting or from Settings → Account → Motion, which sets `data-motion="reduce"` on `<html>`
(`useMotionPreference`, restored by the shell with `useStoredMotion`); read it with
`usePrefersReducedMotion`, never `matchMedia` directly. Never add an animation
library; CSS and `@/shared/motion` (`useCountUp`, `usePrefersReducedMotion`) cover it.

## Shell

`components/console/console-shell`: the sidebar sits on the canvas, the route renders inside an
inset panel (`rounded-xl border shadow-panel`) with a 44px top bar. Below `lg` the icon rail is
the only nav.

- **Sidebar** (`console-nav`): workspace switcher (GitHub installations; "Connect GitHub" when
  none), search button (⌘K), `NAV_PRIMARY` (Overview, then the inbox buckets), collapsible `NAV_GROUPS`, a live
  Projects group, account menu (theme, shortcuts, sign out). `[` folds it to the rail.
- **Top bar** (`console-topbar`): breadcrumbs derived from the URL (`crumbsFor`), a page-actions
  slot, notifications, help. Pages put buttons there with `<TopbarActions>`:

  ```tsx
  import { TopbarActions } from '@/components/console'
  <TopbarActions><Button size="sm" variant="outline">Share</Button></TopbarActions>
  ```

- **Command menu** (`command-palette`): issues by title (whiskers search) or pasted id, every nav
  page, every project, actions. **Shortcuts sheet** (`shortcuts-sheet`) opens on `?`.
- Adding a page: add its item to `NAV_GROUPS` (`shared/console-data/values/nav-groups.ts`) and it
  appears in the sidebar, palette and breadcrumbs. A `g` jump goes in `GO_TARGETS`
  (`components/console/lib/values.ts`), which also feeds the shortcuts sheet.

## Components

Shared UI lives in `apps/studio/src/components/shared/*`; import through each barrel.
Low-level primitives (Button, DropdownMenu, Dialog, Tooltip, Skeleton, Kbd, Command…) come from
`@code-whiskers/ui/components/*`; icons from `@tabler/icons-react` at `stroke={1.75}`.

### Page — `@/components/shared/page`

`Page` (the route's scroll container), `PageBody` (`width="default" | "narrow" | "full"`),
`PageHeader` (title, description, icon, meta, actions, tabs), `PageTabs`, `Panel` (hairline box
with optional header), `Section` (unboxed heading + content), `KeyValueList`/`KeyValue` (detail
rail), `SettingRow` (one setting inside a flush `Panel`: label + description left, control right,
`htmlFor` ties the label to it), skeletons `PageHeaderSkeleton`, `PanelSkeleton`, `KeyValueSkeleton`.

```tsx
<Page>
  <PageHeader
    title="Releases"
    description="What each release brought in"
    actions={<Button size="sm">New alert</Button>}
    tabs={<PageTabs label="Release filter" items={tabs} />}
  />
  <PageBody>…</PageBody>
</Page>
```

### Toolbar — `@/components/shared/toolbar`

`Toolbar` (sticky row under the header), `ToolbarSpacer`, `ToolbarSearch` (controlled; `/`
focuses it), `FilterMenu` (multi-select facet), `FilterChips`/`FilterChip` (applied filters,
removable), `SortMenu`. `TOOLBAR_BUTTON` styles any extra trigger the same way.

```tsx
<Toolbar>
  <FilterMenu label="Level" options={levels} selected={level} onToggle={toggleLevel} />
  <FilterChips chips={chips} onClearAll={clear} />
  <ToolbarSpacer />
  <ToolbarSearch value={q} onValueChange={setQ} placeholder="Search issues…" />
  <SortMenu value={sort} options={SORTS} onValueChange={setSort} />
</Toolbar>
```

### Lists — `@/components/shared/data-list`

`DataList` (roving focus: ↑↓ / j k / Home End; stagger on mount), `DataRow` (36px; `render` makes
it a link or button; `isSelected`; `tone` draws the 1px severity rule; `density`), row parts
`DataRowLead`, `DataRowTitle`, `DataRowDescription`, `DataRowMeta` (mono evidence),
`DataRowTrail`, `DataRowActions` (hover/focus only), `DataListHeader` (column labels),
`DataGroupHeader` (Linear group band, foldable), `DataListSkeleton`.

```tsx
<DataList label="Issues">
  {issues.map((issue) => (
    <DataRow
      key={issue.id}
      tone={issue.level === 'error' ? 'error' : 'neutral'}
      isSelected={issue.id === selectedId}
      render={<Link to="/console/issues/$issueId" params={{ issueId: issue.id }} />}
    >
      <DataRowLead><SeverityDot tone="error" /></DataRowLead>
      <DataRowTitle>{issue.title}</DataRowTitle>
      <DataRowDescription>{issue.culprit}</DataRowDescription>
      <DataRowTrail>
        <Sparkline values={issue.trend} variant="bars" width={64} height={16} />
        <DataRowMeta>{issue.eventCount.toLocaleString()}</DataRowMeta>
      </DataRowTrail>
    </DataRow>
  ))}
</DataList>
```

### Split view — `@/components/shared/split-view`

`SplitView list={…} detail={selected ? <Detail /> : null}`: resizable list + detail
(react-resizable-panels). The list keeps its identity when the detail opens; the detail slides
in. Use for inbox-style triage; full pages for anything linkable on its own.

### States — `@/components/shared/empty-state`

`EmptyState` (`expression`, `title`, `description`, one `action`, one quieter `secondary`,
`size="page" | "inline"`, or an `illustration` instead of the cat) and `ErrorState` (`onRetry`).

```tsx
<EmptyState
  title="No releases reported"
  description="Set release in Sentry.init and every event carries it."
  action={<Link to="/console/projects/new" className={buttonVariants({ size: 'sm' })}>Set up a project</Link>}
/>
```

### Numbers — `@/components/shared/stats`

`StatGrid` (one box divided by hairlines; `stagger`s in), `StatCard` (`label`, `value` number or
string, `format`, `hint`, `delta { label, tone }`, `trend`, `isLoading`), `Sparkline` (plain SVG,
`line` or `bars`, colors follow `tone`; cheap enough per row), `CountUp` (rolls to new values),
`formatCompact`, `formatInteger`. Use recharts (`@code-whiskers/ui/components/chart`) only for
real charts with axes.

### Status — `@/components/shared/status`

`SeverityDot` (`tone`, `isPulsing`, `label` makes it readable), `StatusBadge` (hairline pill,
color in the dot, ink text; `isPulsing` for a state still in progress), `LiveDot` (pulsing "Live" / grey "Paused"). `Tone` is
`'error' | 'warning' | 'resolved' | 'info' | 'neutral'`; `TONE_DOT`, `TONE_INK`, `TONE_RULE`,
`TONE_STROKE` map it to classes. The older console vocabularies (`ConsoleSeverity`,
`PillTone` in `console/shared/console-ui`) still exist for legacy screens; new code uses `Tone`.

### Keys — `@/components/shared/kbd`

`Shortcut keys={['mod', 'k']}` (`mod` = ⌘ / Ctrl), `isCombo(event, 'mod+k')`, `keyLabel`. Global
keys are handled by the shell: ⌘K, `?`, `[`, `g` + key. Page keys use `useDocumentKeydown` from
`@/shared/dom-events` and must bail on `isTyping(event.target)` and on modifiers.

## Page anatomy

- **List page**: `Page` → `PageHeader` (title, one-line evidence in `meta`, primary action) →
  `Toolbar` (filters left, search/sort right) → `DataList` or table → footer line in `text-2xs
  text-faint`. Loading: `DataListSkeleton`. Empty: `EmptyState` with the next step. Filtered to
  nothing: inline `EmptyState` "No matches" (never the setup prompt).
- **Detail page**: top bar crumbs lead back; `PageHeader` with the entity title, mono id in
  `meta`, actions on the right (or `TopbarActions` for secondary ones) → two columns at `@5xl`:
  evidence left (`Section`s, code in dark panes), context right (`KeyValueList`, activity).
- **Settings page**: `PageBody width="narrow"` → stacked `Section`s or `Panel`s, one form each,
  save buttons inside the section they save. Destructive zone last, its button `variant="destructive"`.
  Instance and account settings live under `/console/settings/<tab>` (`components/console/settings`):
  a 220px rail (`SETTINGS_NAV` in `shared/console-data`; a scrolling tab row below `md`) beside
  the page. A tab is `SettingsPage` → `Panel isFlush` of `SettingRow`s (what it is left, control or
  value right). Forms validate inline with the domain's zod schema (`formError`), the error under
  the field in `text-severity-error-ink`; Save appears only when the value is dirty, Escape reverts.
  Safe writes are optimistic (rename, revoke) and roll back with a toast; every save toasts.
  Env-driven values are read-only with the variable named in the description. Rail entries that
  live elsewhere (Projects, Notifications) carry an arrow. Secrets are shown once in a dialog with
  copy and a "won't be shown again" line.
- **Dashboard**: `PageHeader` → `StatGrid` of 4 `StatCard`s (with `trend`) → `Panel`s in a
  2-column grid (`grid gap-4 lg:grid-cols-2`), each a chart or a short `DataList` with a "View all"
  link in `actions`.
- **Triage (split)**: `SplitView` with a dense list left and the detail right; `j/k` move, `e`/`s`
  act, the URL (`?sel=`) owns the selection.

### Overview (`/console/overview`, the console's landing page)

`components/console/overview`. Greeting `PageHeader` with the `ScopePicker` and a 24h/7d/30d
segmented control (`?range=`, links, never animates) → `StatGrid` of eight `StatCard`s (ranged
numbers carry a sparkline from `/v1/overview`; "right now" numbers — blocking reviews, alerts
firing — come from the same live lists as the inbox, so both always agree) → an "Errors over
time" recharts area (events in `chart-1`, new issues in `severity-error`) beside the live
activity feed (`/api/triage/activity/recent` + finished reviews; entries newer than the page
arriving over realtime get `animate-highlight` once) → "Needs attention" (`DataList`, loudest
first: firing alerts, regressions, spikes, blocking reviews, new issues) with the compact setup
card beside it. An instance with no review and no error event yet shows only the setup steps,
the next one as the primary action.

### Inbox (`/console/triage/$bucket`)

Linear's inbox. The inbox bucket holds only what needs a human: new, regressed or spiking issues,
reviews that request changes or failed, log patterns active this hour, firing alerts
(`needsAttention` in `shared/console-data`; the sidebar count uses the same rule). Assigned and
Snoozed show anything assigned or snoozed. Rows are two lines (title, then why it is here) in
Today / This week / Earlier bands inside one `DataList`. `e` resolves an issue (the issue detail
owns it), marks a review or log pattern done (`archived`; it returns when the item moves again),
or mutes an alert; `s` snoozes; `enter` opens the item in full. A triaged row folds away in
place (`useLeavingRows`, 180ms) and the selection moves to the row that took its place.

## Empty, loading and error

1. Every query-backed surface has three states: skeleton while the first answer is pending,
   `EmptyState` when the source has nothing, `ErrorState` when it failed. No spinners for content
   (a `Spinner` is only for in-flight buttons).
2. Never invent data. An empty database must render every page sensibly: say what will appear
   and the one action that makes it appear (connect GitHub, set up a project, send a test event).
3. Skeletons mirror the real layout (row height, column widths) so nothing jumps.
4. One cat per screen: the expression lives in the empty state; chrome carries no cat. `idle` for
   empty, `sleeping` for nothing-to-do and "no matches", `confused` for failures and missing
   permissions.

## Accessibility

Every interactive element is reachable by keyboard and shows `focus-ring` (or `focus-ring-inset`
inside rows). Lists use `DataList`'s roving focus; dialogs and menus come from the ui package
(focus trapped, Escape closes). Icon-only buttons carry `aria-label`. Color never carries meaning
alone: a severity dot sits next to words or a `label`. Both themes are checked for every screen.

## Copy

From `docs/brand.md`: say what happened, where, and what to do, then stop. Evidence first
("3 events in checkout.ts:42"), sentence case, no exclamation marks, no emoji, no "I noticed",
ellipsis only for pending ("Reviewing…"). Empty states get one dry line at most. Buttons are
verbs ("Set up a project", not "Get started"). Numbers are real or absent; blank beats a fake zero.

## Where things go

- New feature screens: `apps/studio/src/components/console/{feature}/` (component module:
  `.tsx` at the root, internals in `lib/`, hooks in `lib/hooks/`, types in `lib/types.ts`,
  barrel `index.ts`). Route files stay thin.
- Something two features share: `components/shared/{module}/` (cross-app: `packages/shared/ui`).
- Console-wide coordination state: `components/console/use-console-store.ts` (narrow selectors,
  `getState()` in handlers). Server state stays in React Query.
- Gotchas: `DataRow`'s `render` element receives `className`, `data-slot` and `children` by
  `cloneElement`, so pass a bare `<Link …/>`; `SplitView` sizes are percent strings or pixel
  numbers; `TopbarActions` renders nothing until the shell mounts; `CatExpression` in an
  `EmptyState` uses `--background` as its paper, so place it on the page background.
- New token names (a `--text-*`, `--shadow-*` or `--spacing-*` key in `tokens.css`) must also be
  registered in `cn` (`packages/shared/ui/src/lib/utils.ts`): tailwind-merge otherwise reads
  `text-<token>` as a colour and drops it beside `text-foreground`, falling back to 16px.

## Code review

`components/console/code-review/` owns the Code review group; each page has its own static route
under `routes/console/` (they win over `$section`):

- `/console/pull-requests` — one row per pull request, read from its newest push. `repo`,
  `verdict` (comma lists), `mine` and `sort` live in the URL; the search box filters as you type.
  Rows re-key when a push lands over realtime and play `animate-highlight` once.
- `/console/reviews/$reviewId` — any push's review id; the page shows the whole pull request as of
  that push (`GET /v1/reviews/:id/pull-request`), with the push timeline on the right.
- `/console/repositories`, `/console/codebase-map`, `/console/review-rules`.

Finding status on the review page is derived, never stored: **open** (reported by the push the
page reads), **dismissed** (studio triage), **resolved** (an earlier push's finding that a later
complete full read no longer reports), **outdated** (not re-reported, but only delta or partial
reads came after). Whiskers drops findings a human answered on GitHub before saving, so "answered"
is not shown. Shared pieces: `shared/review-model` (pure logic), `VerdictBadge`, `SeverityCounts`.

## References

Mobbin screens used for the direction:

- Linear sidebar, workspace switcher and grouped issue list —
  [fd1b4d88](https://mobbin.com/screens/fd1b4d88-f021-49a3-98af-4cd3a87e1d29),
  [ef923b0e](https://mobbin.com/screens/ef923b0e-9a40-4fdd-80f2-f3aafb4f36ce)
- Linear issue detail with a properties rail —
  [f00cc4fb](https://mobbin.com/screens/f00cc4fb-4083-43fc-a0fb-703a6c4ef771)
- Linear command and action menus —
  [f71cec1e](https://mobbin.com/screens/f71cec1e-a119-485b-9164-969169030e1a),
  [f1e8745b](https://mobbin.com/screens/f1e8745b-81b7-4a78-85e1-a325f4843f42)
- Sentry releases table with sparklines and filter bar —
  [fc242c04](https://mobbin.com/screens/fc242c04-1347-4292-b719-e6584955cd7d)
- Sentry issue feed skeleton and search tokens —
  [f53e7f03](https://mobbin.com/screens/f53e7f03-0407-4886-8122-49a7a9fe53e5)
- Linear inbox list and grouped bands (overview/inbox pass) —
  [ed670cda](https://mobbin.com/screens/ed670cda-0527-4716-a1a6-0159f12c4f42),
  [e4104890](https://mobbin.com/screens/e4104890-7660-4557-851b-57b499125ea4)
- Overview: greeting header (Mintlify)
  [31bc9279](https://mobbin.com/screens/31bc9279-f1e6-449c-9143-583e558609b4), stat row over a
  chart (Browserbase) [654392d0](https://mobbin.com/screens/654392d0-9063-4db4-8987-6b7fc6742537),
  history feed (Railway) [fca24d24](https://mobbin.com/screens/fca24d24-ab3c-4dec-a5d3-e90b18e90af1)
- Linear settings rail and row-style setting groups —
  [fea37c46](https://mobbin.com/screens/fea37c46-ab06-4d46-86c7-333ffb0db455),
  [fc41ba13](https://mobbin.com/screens/fc41ba13-34f5-429c-8f96-d37e18311c2d)
- Vercel inline token create and the shown-once secret dialog —
  [6f1b5ef1](https://mobbin.com/screens/6f1b5ef1-935e-413b-9aec-89f70ac8e04e),
  [d6fa2659](https://mobbin.com/screens/d6fa2659-7f0a-4cc2-81fc-2f5b16f13265)
- Vercel connected accounts as rows with a trailing action —
  [fe7d7e6e](https://mobbin.com/screens/fe7d7e6e-ad12-48be-bc7f-d3e6ec6297c7)
- Inset content panel beside a canvas sidebar (AirOps) —
  [7add224e](https://mobbin.com/screens/7add224e-bafe-4c01-80f9-1e86514011d0)
- GitHub files-changed review and PR conversation (code review pages) —
  [e9bad011](https://mobbin.com/screens/e9bad011-d5c5-4e8d-b56f-4fba2ffde691),
  [f187fa83](https://mobbin.com/screens/f187fa83-44e8-4edb-bcb5-1c49f24cae9f)
- Vercel deployments list and deployment detail (push timeline, verdict dots) —
  [e9576405](https://mobbin.com/screens/e9576405-bcef-419a-922a-8fb84b044a54),
  [ff81f1e9](https://mobbin.com/screens/ff81f1e9-25b1-46f9-8448-31fa40a77e4b)
- Alert rule editor as a vertical WHEN → IF → THEN card stack with hairline connectors, a live
  summary and per-destination tests (incident.io workflow editor and test run, Braintrust alert
  dialog), empty rule list as templates (Better Stack) —
  [51b7433b](https://mobbin.com/screens/51b7433b-9f3c-4217-9a61-bb0b371324b1),
  [d67a6d08](https://mobbin.com/screens/d67a6d08-8e89-432d-9114-47b5a2c588fa),
  [f148dcc8](https://mobbin.com/screens/f148dcc8-7973-4726-9e87-fcafd4aedc4f),
  [462ef360](https://mobbin.com/screens/462ef360-9160-4fe2-b78b-90942bd9504e),
  [f24e911c](https://mobbin.com/screens/f24e911c-677f-408e-bb54-fc13a33a6881)
