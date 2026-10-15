# CodeWhiskers brand

Source of truth: the Claude Design project
[CodeWhiskers](https://claude.ai/design/p/741c426a-5850-4698-bb48-ec9e5407aef6) (Brand Guidelines,
Logo, Expressions, Login). This file is the working summary; the code lives in
`packages/shared/ui/src/brand` and ships as `@code-whiskers/ui/brand`. Static assets (SVG masters,
favicons, app icons, bot avatar, the dashboard prototypes) live in `Netko-Labs/brand-assets` under
`code-whiskers/`; `bun run code-whiskers:sync ../code-whiskers` writes them into
`apps/studio/public/`.

## Idea

Code review, error tracking and logs for teams who'd rather ship. A senior reviewer who never gets
tired, never gets loud. Three traits: **calm** (no red walls, no sirens, no exclamation marks),
**precise** (file, line, count, time; copy reads like a good commit message), **curious** (the mouse is
the only personality; it sniffs, reads, notices, never lectures).

Three surfaces: **Review** (PR comments), **Watch** (production errors, Sentry-compatible), **Logs**
(search and correlation). One mouse across all three, and one ensō around them: the 360° view of what's going on in the code.

## Mark

The ensō mouse: a sumi-e mouse running through a vermilion ensō, the open brush circle. The ensō is
the 360° view; the whiskers are how the mouse senses the code. One drawing in every cut; cuts change
the frame and the scale, never the drawing.

| Cut | Use | Code | Asset |
| --- | --- | --- | --- |
| Icon | 64px and up: stores, OG images, marketing | `<CatMark cut="icon" />` | `apps/studio/public/icon.svg`, `icon-dark.svg`, `logo192.png`, `logo512.png` |
| Favicon | below 64px: tabs, sidebar header, wordmark lockup. The icon without whiskers | `<CatMark cut="favicon" />` | `apps/studio/public/favicon.svg` |
| Round | bot avatar on GitHub, Slack, in-app comments | `<CatMark cut="round" tone="dark" />` inside a circle | `apps/studio/public/avatar.svg` |

At 24px and below `CatMark` switches to the optical cut the 16px `favicon.ico` layer uses: heavier
ensō and tail, no face, no whiskers. The read at that size is a red ring with a dark mouse across it.

Wordmark is Inter 600, one word, capital C and W: **CodeWhiskers** — everywhere, prose included.
Never all-caps, never a custom letterform, never stacked with a tagline in-app. In terminals the mouse
is text: `<:3)~`. CLI name: `whiskers`. Package scope and repository stay kebab-case
(`@code-whiskers/*`) — those are identifiers, not the wordmark.

## Color

Ink and paper. Chromatic color means severity or data, with one exception: the mark.

The mascot has its own palette, washi, sumi and vermilion, set by `tone` on `CatMark` and
`CatExpression` (`ink`, `paper`, `accent` override any of them, CSS variables included). Vermilion
belongs to the ensō, the nose, the glyphs and a blush; it never colors UI chrome, and it is not
Error red.

| Mascot | Day (`tone="light"`) | Night (`tone="dark"`) |
| --- | --- | --- |
| Paper | `#F3EDE2` washi | `#0E0F14` |
| Ink | `#16161A` sumi | `#ECE7DD` |
| Accent | `#D9442C` vermilion | `#C8402A` |

UI tokens:

| Token | Hex | Tailwind | Use |
| --- | --- | --- | --- |
| Ink | `#09090B` | `ink` | text, primary buttons |
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
`dark` class so its severity tokens resolve to the dark column — the sign-in page and the
console's log, trace, stack and toast panes all do. The console sidebar follows the theme; its
tokens and layout live in `docs/design-system.md`.

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
- The mouse doesn't talk: no puns, no first-person "I noticed". The mascot expresses, the copy
  reports. One dry line is allowed in empty states and 404s.
- Mechanics: sentence case, no exclamation marks, no emoji, ellipsis only for pending ("Reviewing…").

## Expressions

`<CatExpression expression="…" animated />`. One per product state, never two at once. The ensō is
the status and stays put; the mouse carries the mood: pose, ear, tail, whiskers, eye, brow, mouth.

| Expression | State | Mouse | Ensō | Glyph |
| --- | --- | --- | --- | --- |
| `idle` | default, empty states | runs, blinks, tail sways | still | none |
| `reviewing` | reading a diff | lunges forward, focused lid, whiskers spread | a glint scans the rim | none |
| `thinking` | analysis running | lifts its head, eye wanders up, tail taps | draws itself on | three dots |
| `found` | issue found, a warning not a panic | rears up, ears perk, gasps | pulses outward | `!` pops |
| `approved` | LGTM, approval posted | leaps through, happy eye, smile, blush | closes the circle | check |
| `blocker` | production error, failing check | crouches, ears pinned, frowns, sweats | breaks into jittering arcs | `!!` |
| `sleeping` | nothing to review, paused, 404 | lies down and breathes | dims | z's float |
| `confused` | failed connection, missing permissions | head tilts, eye darts, wavy mouth | wobbles | `?` |

Sizes: 112px in empty states, 48px inline next to headings, 24px in toasts. Below 48px use the
static expression, and below 48px never animate; below 48px prefer the favicon cut. Face details
register from about 64px; below that, pose and the ensō carry the state. `crop` trims the frame to
the drawing (1010×800) for hero placements.

## Rules

1. The mascot uses its own palette only: ink, paper, vermilion. No gradients, no 3D.
2. One mouse per screen: icon in chrome, expression in empty states, not both.
3. Chromatic color only signals severity or data; vermilion lives inside the mark.
4. Backgrounds are flat. Depth is a hairline and a soft shadow.
5. Evidence in mono, product in Inter.
6. Sentence case. No exclamation marks. No emoji. No puns in product copy.
7. Looping motion belongs to waiting states only; anything else moves once, briefly, to explain a
   change (`docs/design-system.md` → Motion). Alerts arrive, they don't bounce.
8. Below 48px use the favicon cut; below 48px never animate.
9. Wordmark is Inter 600, never redrawn.
10. When in doubt, remove it. The brand is what's left.
