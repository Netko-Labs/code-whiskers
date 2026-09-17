# CodeWhiskers brand

Source of truth: the Claude Design project
[CodeWhiskers](https://claude.ai/design/p/741c426a-5850-4698-bb48-ec9e5407aef6) (Brand Guidelines,
Logo, Expressions, Login). This file is the working summary; the code lives in
`packages/shared/ui/src/brand` and ships as `@code-whiskers/ui/brand`.

## Idea

Code review, error tracking and logs for teams who'd rather ship. A senior reviewer who never gets
tired, never gets loud. Three traits: **calm** (no red walls, no sirens, no exclamation marks),
**precise** (file, line, count, time; copy reads like a good commit message), **curious** (the cat is
the only personality; it peeks, reads, notices, never lectures).

Three surfaces: **Review** (PR comments), **Watch** (production errors, Sentry-compatible), **Logs**
(search and correlation). One cat across all three.

## Mark

The diff cat: a box terminal with a face, a `−` line and a highlighted `+` line. One drawing, three
cuts, all ink or white, never colored, never gradient, never 3D.

| Cut | Use | Code | Asset |
| --- | --- | --- | --- |
| Icon | 64px and up: stores, OG images, marketing | `<CatMark cut="icon" />` | `apps/studio/public/icon.svg`, `icon-dark.svg`, `logo192.png`, `logo512.png` |
| Favicon | below 64px: tabs, sidebar header, wordmark lockup. Bigger eyes, no mouth, one `+` row | `<CatMark cut="favicon" />` | `apps/studio/public/favicon.svg` |
| Round | bot avatar on GitHub, Slack, in-app comments; white on ink or ink on fog | `<CatMark cut="round" tone="dark" />` inside a circle | `apps/studio/public/avatar.svg` |

Wordmark is Inter 600, one word, capital C and W: **CodeWhiskers** — everywhere, prose included.
Never all-caps, never a custom letterform, never stacked with a tagline in-app. In terminals the cat
is text: `=^.^=`. CLI name: `whiskers`. Package scope and repository stay kebab-case
(`@code-whiskers/*`) — those are identifiers, not the wordmark.

## Color

Ink and paper. Chromatic color means severity or data, nothing else.

| Token | Hex | Tailwind | Use |
| --- | --- | --- | --- |
| Ink | `#09090B` | `ink` | text, primary buttons, the cat |
| Paper | `#FFFFFF` | `paper` | background, cards |
| Fog | `#F5F5F5` | `fog` | muted fills, hover, code chips |
| Hairline | `#E5E5E5` | `hairline` | every border, removed diff lines |
| Ash | `#737373` | `ash` | secondary text, timestamps |

Severity is one name per meaning, two values per ground — the original palette was tuned for ink and
washes out on paper, so the light column is the console's. Tokens resolve by theme; nothing in code
picks a hex.

| Token | Light ground | Dark ground | Tailwind | Use |
| --- | --- | --- | --- | --- |
| Error | `#E7000B` | `#FF4D4D` | `severity-error` | blockers, unhandled exceptions, failing checks |
| Warning | `#F59E0B` | `#FFB020` | `severity-warning` | review suggestions, degraded, rate spikes |
| Resolved | `#16A34A` | `#2EE59D` | `severity-resolved` | approved, fixed, healthy; once per screen at most |
| Info | `#2B7FFF` | `#5B9BFF` | `severity-info` | links in logs, informational badges |

The fill values above are for dots, rules and bars. Severity *text* needs more contrast than a dot,
so it has its own token — `severity-{name}-ink`, `#B91C1C`/`#92400E`/`#166534`/`#1E40AF` on light
and `#FCA5A5`/`#FCD34D`/`#4ADE80`/`#93C5FD` on dark.

Dark ground (CLI, log views, the sign-in page): background `ink`, card/code `ink-card` `#171717`,
hairline `ink-hairline` `#262626`, removed line `ink-removed` `#404040`, muted text `ink-muted`
`#A3A3A3`, text `ink-text` `#FAFAFA`. A surface that is dark regardless of the app theme carries the
`dark` class so its severity tokens resolve to the dark column — the sign-in page, the console's
sidebar, and its log, trace and toast panes all do.

Severity is a dot or a 1px left rule on a row, never a filled card. Badge text stays ink; the color
sits in the dot. Blue is never branding, only focus and data. Charts use the five system blues; an
error series alone may use Error red. shadcn `--primary` is ink (light) / paper (dark).

## Type

Inter for the interface, JetBrains Mono for the evidence (paths, stack frames, log lines, diffs,
commands, counts in tables). Both load from `@fontsource-variable/*` in `globals.css`.

Scale: Display 44/48 700 · Heading 30/36 700 · Title 20/28 600 · Control 14/20 500 · Body 14/20
400 · Small 12/16 400 · Label 11 600 tracked 0.12em. Sentence case everywhere. Tight tracking above
20px, none below. Tables use `tabular-nums`.

## Voice

Say what happened, where, and what to do. Then stop.

- Evidence first: lead with the location or the number. Opinion comes second, one clause.
- Confident, not certain: "will throw" when it will, "may" when it may. Never "potential issue"
  as a blanket hedge.
- The cat doesn't talk: no puns, no first-person "I noticed". The mascot expresses, the copy
  reports. One dry line is allowed in empty states and 404s.
- Mechanics: sentence case, no exclamation marks, no emoji, ellipsis only for pending ("Reviewing…").

## Expressions

`<CatExpression expression="…" animated />`. One per product state, never two at once. Only eyes,
mouth, tail, the body rows and the marks change; ears flatten only for a blocker.

| Expression | State | Loop when `animated` |
| --- | --- | --- |
| `idle` | default, empty states | blink every 5s, tail sways |
| `reviewing` | reading a diff | eyes + caret scan the `+` row |
| `thinking` | analysis running | three dots pulse |
| `found` | issue found, a warning not a panic | head pops 6%, `!` rises in |
| `approved` | LGTM, approval posted | none |
| `blocker` | production error, failing check | 300ms shake |
| `sleeping` | nothing to review, paused, 404 | face breathes, z's float |
| `confused` | failed connection, missing permissions | none |

Sizes: 112px in empty states, 48px inline next to headings, 24px in toasts. Below 48px use the
static expression, and below 48px never animate; below 48px prefer the favicon cut. `crop` trims
the frame to the drawing (720×620) for hero placements.

## Rules

1. The cat is always ink or white.
2. One cat per screen: icon in chrome, expression in empty states, not both.
3. Chromatic color only signals severity or data.
4. Backgrounds are flat. Depth is a hairline and a soft shadow.
5. Evidence in mono, product in Inter.
6. Sentence case. No exclamation marks. No emoji. No puns in product copy.
7. Motion belongs to waiting states only. Alerts arrive, they don't bounce.
8. Below 48px use the favicon cut; below 48px never animate.
9. Wordmark is Inter 600, never redrawn.
10. When in doubt, remove it. The brand is what's left.
