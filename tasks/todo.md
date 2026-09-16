# code-whiskers — two-app topology (2026-09-15)

Studio owns the public host `whiskers.netko.dev` and forwards the whiskers surfaces to the
worker over Coolify's internal network. Realtime is gone.

## Code
- [x] delete `apps/realtime`, `packages/realtime/*`, `packages/configs/realtime-config`, the
      realtime generator template, studio's todos/chat/home demo pages and the realtime client
- [x] `WHISKERS_URL` in studio config; `forwardToWhiskers` in `packages/studio/api/src/shared`
- [x] studio routes: `/webhooks/$` (POST), `/v1/$` (GET), `/api/:projectId/envelope|store`
- [x] `/` redirects to `/sign-in`
- [x] docs: CLAUDE.md, README, sample envs
- [x] check-types, fmt-lint, test, studio build

## Coolify
- [ ] studio domain → `https://whiskers.netko.dev`; `BASE_URL`/`CORS`/`TRUSTED_ORIGINS` follow;
      `WHISKERS_URL=http://<whiskers uuid>:3002`; drop `VITE_REALTIME_URL`
- [ ] whiskers: no public domain; `WEB_BASE_URL`/`CORS` → `https://whiskers.netko.dev`
- [ ] redeploy both; GitHub App webhook URL unchanged

## Acceptance
- `https://whiskers.netko.dev/sign-in` renders; `/api/health` 200; `/v1/overview` returns whiskers data
- reopening a PR still produces a code-whiskers review (webhook now enters via studio)
