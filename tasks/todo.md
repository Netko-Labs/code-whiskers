# Reviewer settings in the UI

Provider, models, agent knobs and API keys move from worker env to studio (Settings → General → AI reviewer).
Env keeps only what the UI cannot own: DB, auth, GitHub App, INTERNAL_TOKEN, ENCRYPTION_KEY, URLs, Sentry.

- [x] studio-domain: reviewer values + `ReviewerSettingsSchema` / `ReviewerCredentialSchema`
- [x] studio-service: settings view (presence only), internal read (decrypts), update settings, set/clear credential
- [x] studio-api: `GET|PATCH /api/instance/reviewer/settings`, `PUT /api/instance/reviewer/credentials`, `GET /api/internal/reviewer`
- [x] whiskers: resolve reviewer = studio settings over env fallback (60s cache); provider memoized per fingerprint
- [x] whiskers: credentials reach claude env, single-shot specs, mentions/fix OpenRouter model
- [x] whiskers: `/internal/reviewer` + test drop the cache so the UI sees a save immediately
- [x] UI: editable reviewer panel + write-only credential rows
- [x] docs: README reviewer section, architecture, sample.env
- [x] check-types, fmt-lint, tests

Acceptance: with no REVIEW_* / provider keys in env, a review runs on what the UI saved; keys never leave studio
except to whiskers over `/api/internal/reviewer`; UI only ever sees presence.
