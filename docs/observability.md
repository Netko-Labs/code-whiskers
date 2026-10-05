# Observability (dogfooding)

code-whiskers reports its own errors to a code-whiskers project through the official Sentry SDKs:
studio's server and browser, and the whiskers worker. Errors only — no traces, logs, metrics or
sessions. Everything is off until its env is set; with nothing set there is no SDK init and no
network call. The code lives in `packages/shared/observability` (`.` pure config helpers,
`./server`, `./client`).

## Turning it on

1. In the console, **New project** (`/console/projects/new`) → platform **Bun** → name it (e.g.
   `code-whiskers`) → copy the DSN chip (`https://<client key>@whiskers.netko.dev/<projectId>`).
   One project for all three is fine: each event carries a `service` tag (`studio`, `whiskers`);
   browser events have none. A separate client key per app (project settings → Client keys) lets
   you cut one off without touching the others.
2. In Coolify:

   | App | Variable | Value | Build variable |
   | --- | --- | --- | --- |
   | studio | `SENTRY_DSN` | the DSN | no |
   | studio | `VITE_SENTRY_DSN` | the DSN (browser; may equal `SENTRY_DSN`) | **yes**, and also runtime (the tunnel allow-list reads it) |
   | studio | `SENTRY_ENVIRONMENT` | only when not `production` (e.g. `staging`) | yes |
   | whiskers | `SENTRY_DSN` | the DSN | no |
   | whiskers | `SENTRY_ENVIRONMENT` | as above | no |

3. Enable **Include Source Commit in Build** so `SOURCE_COMMIT` reaches the build and the browser
   events carry the release. Release is `SENTRY_RELEASE` ?? `SOURCE_COMMIT` ?? `dev`; environment is
   `SENTRY_ENVIRONMENT` ?? `production`/`development` from `NODE_ENV`.
4. Deploy and check `GET /api/health` (studio) or `/health` (whiskers): both report `release` and
   `environment`. A production boot with no DSN logs one `error reporting is off` warn; a malformed
   DSN logs a warn and is treated as unset — neither refuses to boot.

## What is reported

| Source | Seam |
| --- | --- |
| studio `/api/*` (Elysia) | error hook in `packages/studio/api/src/app.ts`, 5xx and unexpected only |
| studio server routes, SSR throws, server functions | `apps/studio/src/start.ts` middleware (not redirect/notFound) |
| studio browser | route boundaries (`defaultOnCatch`), global handlers, query/mutation errors the server never answered (`ResponseError` marks answered ones) |
| whiskers HTTP | error hook in `packages/whiskers/api/src/app.ts`, 5xx and unexpected only |
| whiskers background | review/mention crashes, terminal review failures, alert/reaction/retention loops, stale-review sweep |
| both servers | uncaught exceptions and unhandled rejections (SDK defaults) |

`reportError` reports the innermost `cause` (drizzle wrappers carry SQL params) once per error object.

## Feedback-loop guards

whiskers is the sink, so a fault in the ingest must never report itself into the ingest.

- `beforeSend` drops any event whose `path` tag is an ingest path (`/api/:id/envelope|store`,
  `/otlp/*`, `/v1/projects/:id/test-event`); studio also drops its forwarded paths (`/webhooks/*`,
  `/v1/*`) and `/api/monitor`.
- **Send test event** never goes through an SDK or the network: whiskers calls `ingestEvent`
  in-process with a synthetic event (`release`/`environment` `test`), so no guard sees it and a
  fault in it is not reported back into the ingest.
- No tracing (zero sample rate, no performance integrations, no trace headers on outgoing
  requests), logs and metrics dropped, no session tracking, no client reports.
- SDK capture and transport faults never throw into a request or loop; shutdown flush is bounded
  (2 s), last in studio's `close` hook and after `closeDb` on the worker's SIGTERM.

## Browser tunnel

The browser SDK posts to `POST /api/monitor` on studio's own origin, which forwards an envelope only
to an allowed DSN (`SENTRY_DSN`, `VITE_SENTRY_DSN`), caps bodies at 1 MiB and answers 404 when no DSN
is set. It is not behind `originGuard` (Elysia's `/api/*` only); the allow-list is its guard. With
`VITE_SENTRY_DSN` unset at build the bundle holds no SDK bytes; set, the SDK is a lazy chunk.

## Tests

`bun test` in `packages/shared/observability` runs the real SDK against an in-process sink:
off-by-default, one `event` item per error, the loop guard, the tunnel allow-list and cap.

## Not yet

OpenTelemetry traces and logs over OTLP are out of scope here; whiskers already ingests them.
