# Dashboard directions

Five throwaway HTML prototypes for the Code Whiskers dashboard. Open any file directly in a browser
(they share `_shared.css` + `_cat.svg`, no build). Each one answers the same question — *what did
the cat do, what needs me* — with a different spine.

| # | File | Spine | Signature |
| --- | --- | --- | --- |
| 01 | `01-ledger.html` | The day as a diff | git-log feed: `+` landed, `−` went away, `!` wants a human |
| 02 | `02-blocks.html` | One screen, three surfaces | sidebar + bento: verdict bar, issue sparklines, PR list, log tail |
| 03 | `03-queue.html` | Reviews grouped by what happens next | Needs a human / Reviewing / Approved + inline diff suggestion |
| 04 | `04-incidents.html` | Errors against the deploy timeline | dashed deploy markers over the event histogram; cards say *which release* |
| 05 | `05-terminal.html` | `whiskers status` in the browser | tmux-style panes, prompt lines as section headers, `=^.^=` |

## Shared rules

- Dark-first: ink `#09090B`, card `#171717`, hairline `#262626`, text `#FAFAFA`, muted `#A3A3A3`, ash `#737373`.
- Inter for the interface, JetBrains Mono for evidence (paths, hashes, timestamps, log lines).
- Severity colors only for signal: error `#FF4D4D`, warning `#FFB020`, resolved `#2EE59D`, info `#5B9BFF`. Never decorative.
- Copy is in the cat's voice: short, factual, occasionally dry (“Nothing before 09:00. The cat was asleep.”).

## References (Mobbin)

- Plain — inbox-style queue, grouped by next action: https://mobbin.com/screens/4b396c6e-917b-4dcf-bea8-0587c3dd4b1e
- Railway — dense dark ops surfaces, mono evidence: https://mobbin.com/screens/6ceaafe5-ccad-4d9d-92dd-cefcac41a9d0 · https://mobbin.com/screens/411620e7-9ff6-4062-934b-9d0d31784174
- Devin — agent activity as a narrative feed: https://mobbin.com/screens/dc731bba-9505-4b45-a889-7480c1bedd45
- Supabase — sidebar + bento overview, log explorer: https://mobbin.com/screens/3826235e-4127-417b-b432-deb5599443f4 · https://mobbin.com/screens/186221ca-f0df-493e-8064-cfb5c32e742e
- Canny — status-grouped lists with counts: https://mobbin.com/screens/a303ea36-f685-46d1-9d37-8e7941d97d82
- fal — terminal-adjacent dashboard, tabular mono: https://mobbin.com/screens/3786699a-7b92-4f81-9545-737fd5edfcff

## Recommendation

Ship **03 Queue** as the reviews surface and **04 Incidents** as the issues surface; they are the two
screens people will actually live in. **02 Blocks** is the safe overview if one landing page is
needed. 01 and 05 are the brand-forward options — great for a marketing page or an “activity” tab,
too opinionated as the daily driver.
