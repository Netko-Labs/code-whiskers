import { describe, expect, test } from 'bun:test'
import { existsSync } from 'node:fs'
import { NOBODY_UID, probeJail } from '@code-whiskers/sandbox'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'

// Opt-in: Linux with Landlock, and a Linux `claude` to jail (the docker test uses the same binary).
const binary = process.env.CLAUDE_JAIL_TEST_BINARY
const isRunnable = Boolean(binary && existsSync(binary)) && (await probeJail(NOBODY_UID)).isUsable

describe.if(isRunnable)('claude in the Landlock jail', () => {
  test('reaches the API only through the proxy and reports a refused token as permanent', async () => {
    process.env.CLAUDE_CODE_OAUTH_TOKEN = `sk-ant-oat01-${'x'.repeat(48)}`
    const { createReviewProvider, testReviewer } = await import('../src/review')
    const provider = createReviewProvider({
      ...whiskersEnvConfig,
      review: {
        ...whiskersEnvConfig.review,
        provider: 'claude',
        model: 'claude-opus-5-5',
        sandbox: 'jail',
        claudeExecutable: binary,
      },
    })
    const status = await provider.status()
    expect(status.sandbox).toBe('jail')
    expect(status.isolation?.jail?.landlockAbi).toBeGreaterThanOrEqual(4)
    const result = await testReviewer(provider)
    expect(result.isOk).toBe(false)
    expect(result.error).toContain('claude setup-token')
  }, 180_000)
})
