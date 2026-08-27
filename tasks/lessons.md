# Lessons

Failure modes observed in production and the rules they produced.

## Silent async failures are undiagnosable

A hung provider socket left review runs pending forever with zero log output;
the only symptom was "nothing happened". Rules: every LLM call carries an
`AbortSignal.timeout`, every git subprocess a kill timer, and the pipeline
logs `review started` / `review completed` / `review failed` — a background
job may never depend on nothing going wrong to stay observable.

## Provider timeouts are routine, not exceptional

`z-ai/glm-5.3-flash` via OpenRouter timed out on ~half of review calls in one
afternoon. Rules: transient failures (timeout/429/5xx) get one retry with
backoff, never blanket retries that mask 4xx; failures surface to the user as
a PR comment (deduped per head) and a neutral check-run conclusion, never
only in server logs. Model choice is an availability decision, not just a
cost decision.

## An agent's own actions echo back as events

Bot fix pushes fire `synchronize`, bot replies fire comment webhooks. Every
consumer needs self-filters (`user.type === 'Bot'`, `isBotLogin` on the
sender) or the loop feeds itself.

## Review-bot findings converge — until they don't

Severity and count shrank over rounds on real issues, then later rounds began
reshaping earlier findings and self-withdrawing mid-argument. Rule: when each
fix draws only reshaped or speculative findings, stop pushing, document the
deferrals once, and ship.
