import * as Sentry from '@sentry/node'

const port = Number(Bun.env.PORT ?? 4899)
const apiBaseUrl = `http://127.0.0.1:${port}`
const dsn = `http://cw_pk_local_development@127.0.0.1:${port}/42`

const server = Bun.spawn(['bun', 'run', 'apps/whiskers/src/index.ts'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: String(port),
    DATABASE_URL:
      process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5434/whiskers',
  },
  stdout: 'inherit',
  stderr: 'inherit',
})

function assert(condition: unknown, message: string, context?: unknown): asserts condition {
  if (!condition) {
    console.error(`❌ ${message}`, context ?? '')
    process.exit(1)
  }
}

async function waitForHealth() {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const res = await fetch(`${apiBaseUrl}/health`)
      if (res.ok) return
    } catch {}
    await Bun.sleep(250)
  }
  throw new Error('server never became healthy')
}

try {
  await waitForHealth()

  Sentry.init({
    dsn,
    environment: 'e2e',
    release: 'code-whiskers-e2e@1.0.0',
  })
  Sentry.captureException(new Error('Code Whiskers SDK compatibility smoke error'))
  Sentry.captureMessage('Code Whiskers SDK compatibility smoke message', 'warning')
  const flushed = await Sentry.flush(5000)
  assert(flushed, 'Sentry SDK did not flush')

  // captureException twice more with the same error — must group into one issue
  Sentry.captureException(new Error('Code Whiskers SDK compatibility smoke error'))
  await Sentry.flush(5000)

  const overview = (await (await fetch(`${apiBaseUrl}/v1/overview`)).json()) as {
    summary: { events: number; issues: number }
  }
  assert(overview.summary.events >= 3, 'events were not ingested', overview)
  assert(overview.summary.issues >= 2, 'issues were not created', overview)

  const issues = (await (await fetch(`${apiBaseUrl}/v1/issues?projectId=42`)).json()) as Array<{
    title: string
    eventCount: number
  }>
  const smoke = issues.find((issue) => issue.title.includes('smoke error'))
  assert(smoke, 'smoke error issue missing', issues)
  assert(smoke.eventCount >= 2, 'duplicate errors did not group', smoke)

  const unauthorized = await fetch(`${apiBaseUrl}/api/42/store?sentry_key=wrong_key`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message: 'should be rejected' }),
  })
  assert(unauthorized.status === 401, 'wrong sentry_key was not rejected', unauthorized.status)

  console.log('✅ sentry sdk e2e passed', overview.summary)
} finally {
  server.kill()
}
