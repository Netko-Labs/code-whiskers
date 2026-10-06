import { describe, expect, test } from 'bun:test'
import { dockerAvailable } from '@code-whiskers/sandbox'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'

// A Linux `claude` (e.g. from `npm pack @anthropic-ai/claude-agent-sdk-linux-arm64`) opts in.
const binary = process.env.CLAUDE_SANDBOX_TEST_BINARY
const isRunnable = Boolean(binary) && (await dockerAvailable())

describe.if(isRunnable)('claude in the Docker sandbox', () => {
  test('runs behind the egress proxy and reports a refused token as permanent', async () => {
    process.env.CLAUDE_CODE_OAUTH_TOKEN = `sk-ant-oat01-${'x'.repeat(48)}`
    const { createReviewProvider, testReviewer } = await import('../src/review')
    const provider = createReviewProvider({
      ...whiskersEnvConfig,
      review: {
        ...whiskersEnvConfig.review,
        provider: 'claude',
        model: 'claude-opus-5-5',
        sandbox: 'docker',
        sandboxExecutable: binary,
      },
    })
    expect((await provider.status()).sandbox).toBe('docker')
    const result = await testReviewer(provider)
    expect(result.isOk).toBe(false)
    expect(result.error).toContain('claude setup-token')
  }, 180_000)
})
