import { TEST_ERROR_MESSAGE } from '../constants'
import type { CodeSnippet, InstallSnippets, Platform, PlatformId } from '../types'
import { PLATFORMS } from '../values'
import { dsnPartsOf } from './dsn'

const THROW_LATER = `setTimeout(() => {\n  throw new Error('${TEST_ERROR_MESSAGE}')\n})`
// A server process must not die to prove the DSN: an uncaught throw exits Node and Bun.
const CAPTURE = `Sentry.captureException(new Error('${TEST_ERROR_MESSAGE}'))`

const init = (code: string): CodeSnippet => ({ label: 'Initialize', code })
const verify = (code: string): CodeSnippet => ({ label: 'Throw a test error', code })

function jsInit(pkg: string, dsn: string): CodeSnippet {
  return init(`import * as Sentry from '${pkg}'\n\nSentry.init({\n  dsn: '${dsn}',\n})`)
}

function storeCurl(dsn: string): string {
  const { origin, publicKey, projectId } = dsnPartsOf(dsn)
  return [
    `curl -X POST '${origin}/api/${projectId}/store/' \\`,
    `  -H 'content-type: application/json' \\`,
    `  -H 'x-sentry-auth: Sentry sentry_version=7, sentry_key=${publicKey}' \\`,
    `  -d '{"message":"${TEST_ERROR_MESSAGE}","level":"error"}'`,
  ].join('\n')
}

function otlpEnv(dsn: string): string {
  const { origin, publicKey } = dsnPartsOf(dsn)
  return [
    `OTEL_EXPORTER_OTLP_ENDPOINT=${origin}/otlp`,
    'OTEL_EXPORTER_OTLP_PROTOCOL=http/json',
    `OTEL_EXPORTER_OTLP_HEADERS=Authorization=Bearer ${publicKey}`,
  ].join('\n')
}

type Body = Pick<InstallSnippets, 'init' | 'verify' | 'note'>

const BODIES: Record<PlatformId, (dsn: string) => Body> = {
  node: (dsn) => ({
    init: jsInit('@sentry/node', dsn),
    verify: verify(CAPTURE),
    note: 'Import it before anything else, e.g. as instrument.ts loaded with --import.',
  }),
  bun: (dsn) => ({ init: jsInit('@sentry/bun', dsn), verify: verify(CAPTURE), note: null }),
  browser: (dsn) => ({
    init: jsInit('@sentry/browser', dsn),
    verify: verify(THROW_LATER),
    note: 'Initialize before your app renders.',
  }),
  react: (dsn) => ({
    init: jsInit('@sentry/react', dsn),
    verify: verify(
      `<button onClick={() => {\n  throw new Error('${TEST_ERROR_MESSAGE}')\n}}>\n  Throw a test error\n</button>`,
    ),
    note: 'Initialize in main.tsx, before createRoot.',
  }),
  nextjs: (dsn) => ({
    init: jsInit('@sentry/nextjs', dsn),
    verify: verify(THROW_LATER),
    note: 'Put it in instrumentation-client.ts, and the same init in instrumentation.ts for the server.',
  }),
  'tanstack-start': (dsn) => ({
    init: jsInit('@sentry/tanstackstart-react', dsn),
    verify: verify(THROW_LATER),
    note: 'Initialize in client.tsx, and in the server entry for server functions.',
  }),
  python: (dsn) => ({
    init: init(`import sentry_sdk\n\nsentry_sdk.init(dsn="${dsn}")`),
    verify: verify('division_by_zero = 1 / 0'),
    note: null,
  }),
  go: (dsn) => ({
    init: init(
      `err := sentry.Init(sentry.ClientOptions{\n\tDsn: "${dsn}",\n})\nif err != nil {\n\tlog.Fatalf("sentry.Init: %s", err)\n}\ndefer sentry.Flush(2 * time.Second)`,
    ),
    verify: verify(`sentry.CaptureException(errors.New("${TEST_ERROR_MESSAGE}"))`),
    note: null,
  }),
  ruby: (dsn) => ({
    init: init(`Sentry.init do |config|\n  config.dsn = '${dsn}'\nend`),
    verify: verify(`Sentry.capture_exception(RuntimeError.new('${TEST_ERROR_MESSAGE}'))`),
    note: null,
  }),
  php: (dsn) => ({
    init: init(`\\Sentry\\init(['dsn' => '${dsn}']);`),
    verify: verify(`\\Sentry\\captureException(new \\Exception('${TEST_ERROR_MESSAGE}'));`),
    note: null,
  }),
  java: (dsn) => ({
    init: init(`Sentry.init(options -> {\n  options.setDsn("${dsn}");\n});`),
    verify: verify(`Sentry.captureException(new Exception("${TEST_ERROR_MESSAGE}"));`),
    note: null,
  }),
  dotnet: (dsn) => ({
    init: init(`SentrySdk.Init(options =>\n{\n    options.Dsn = "${dsn}";\n});`),
    verify: verify(`SentrySdk.CaptureException(new Exception("${TEST_ERROR_MESSAGE}"));`),
    note: null,
  }),
  sentry: (dsn) => ({
    init: init(`Sentry.init({ dsn: '${dsn}' })`),
    verify: { label: 'Or send one with curl, no SDK', code: storeCurl(dsn) },
    note: 'Any Sentry SDK works: pass the DSN to its init.',
  }),
  otlp: () => ({
    init: null,
    verify: null,
    note: 'OTLP carries logs and traces, which land in Live logs and Traces. Errors come in through a Sentry SDK.',
  }),
}

export function platformOf(id: PlatformId): Platform {
  return PLATFORMS.find((platform) => platform.id === id) ?? (PLATFORMS[0] as Platform)
}

/** Environment variable first, then the same DSN inline in the init call. */
export function snippetsFor(id: PlatformId, dsn: string): InstallSnippets {
  const platform = platformOf(id)
  const env = platform.envName
    ? { label: 'Environment', code: `${platform.envName}=${dsn}` }
    : { label: 'Environment', code: otlpEnv(dsn) }
  return { install: platform.install, env, ...BODIES[id](dsn) }
}

export function matchesPlatform(platform: Platform, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return `${platform.label} ${platform.keywords}`.toLowerCase().includes(needle)
}

export function isPlatformId(value: unknown): value is PlatformId {
  return PLATFORMS.some((platform) => platform.id === value)
}
