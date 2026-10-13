---
name: whiskers-loop
description: Drive a pull request to mergeable with CodeWhiskers reviewing every push. Use when finishing a PR on a repository CodeWhiskers watches, or when asked to "get this PR to mergeable", "fix the review", or "run the whiskers loop".
---

# The CodeWhiskers loop

CodeWhiskers reviews every push and answers with a verdict. Needs the `code-whiskers` MCP server
(a review-loop API key: Settings → API keys → Review loop · MCP).

1. `get_pr_context` for the PR before changing code. Follow every rule; never touch what a
   don't-flag note covers just to please the reviewer.
2. Commit and push. Note the commit sha.
3. `wait_for_review(pr, sha)`. A push starts a review on its own; never ask for one.
4. Verdict `mergeable` → stop and tell the human it is ready. `needs_human` → stop and hand over
   with the reason. Otherwise `get_findings`.
5. For each blocker, change the code until its `done_when` holds. If the finding is wrong, call
   `reply_to_finding` with kind `disagree` and concrete evidence (file:line, a test). Do not argue
   twice; a separate checker rules on it next round.
6. Suggestions are optional: take the cheap ones, leave the rest.
7. Back to step 2. Stop after 5 rounds or when the same blockers survive 2 rounds in a row, and
   hand over with what you tried.

Never merge unless `merge_readiness` says this repository lets agents merge. If you learned how
part of the code works, `memory_write` it as one or two plain sentences scoped to its folder.
