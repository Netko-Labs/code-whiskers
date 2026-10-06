import { describe, expect, test } from 'bun:test'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import type { LlmReview, WhiskersConfig } from '@code-whiskers/whiskers-domain'
import { retryDelayFor } from '../retry'
import { isEscapingPattern, isWithin, redactSecrets, reviewJsonSchema } from './agent'
import { ReviewProviderError } from './errors'
import { createReviewProvider } from './factory'
import { singleShotSpec } from './models'
import { gatewayCostUsd } from './single-shot'

type JsonObject = Record<string, unknown>

const withProvider = (provider: WhiskersConfig['review']['provider']): WhiskersConfig => ({
  ...whiskersEnvConfig,
  review: { ...whiskersEnvConfig.review, provider, model: 'some/model' },
})

describe('createReviewProvider', () => {
  test.each([
    ['openrouter', false],
    ['ai-gateway', false],
    ['openai', false],
    ['claude', true],
  ] as const)('%s builds its provider (agentic: %p)', (id, isAgentic) => {
    const provider = createReviewProvider(withProvider(id))
    expect(provider.id).toBe(id)
    expect(provider.isAgentic).toBe(isAgentic)
    expect(provider.model).toBe('some/model')
  })

  test('status reports credentials as booleans only', async () => {
    const status = await createReviewProvider(withProvider('openai')).status()
    expect(status.credentials).toEqual([{ name: 'OPENAI_API_KEY', isSet: expect.any(Boolean) }])
    for (const credential of status.credentials)
      expect(Object.keys(credential)).toEqual(['name', 'isSet'])
  })
})

describe('singleShotSpec', () => {
  test('openrouter keeps today’s model factory and no extra options', () => {
    expect(singleShotSpec('openrouter', withProvider('openrouter')).providerOptions).toBeUndefined()
  })

  test('openai and the gateway get reasoning and lenient structured output, never a key', () => {
    for (const id of ['openai', 'ai-gateway'] as const) {
      const config = {
        ...withProvider(id),
        openai: { apiKey: 'sk-proj-secret' },
        aiGateway: { apiKey: 'vck-secret' },
      }
      const { providerOptions } = singleShotSpec(id, config)
      expect(providerOptions).toEqual({
        openai: { reasoningEffort: 'medium', strictJsonSchema: false },
      })
      expect(JSON.stringify(providerOptions)).not.toContain('secret')
    }
  })

  test('the gateway’s reported cost lands in the tally, garbage counts as nothing', () => {
    expect(gatewayCostUsd({ gateway: { cost: '0.0123' } })).toBe(0.0123)
    expect(gatewayCostUsd({ gateway: { cost: 'n/a' } })).toBe(0)
    expect(gatewayCostUsd(undefined)).toBe(0)
  })
})

describe('retryDelayFor', () => {
  const now = 1_000_000

  test('rate limits wait for their reset, within reason', () => {
    const soon = new ReviewProviderError('limit', { kind: 'transient', retryAtMs: now + 300_000 })
    expect(retryDelayFor(soon, 0, now)).toBe(300_000)
    const later = new ReviewProviderError('limit', {
      kind: 'transient',
      retryAtMs: now + 5 * 3_600_000,
    })
    expect(retryDelayFor(later, 0, now)).toBeUndefined()
  })

  test('permanent provider failures and spent retries fail at once', () => {
    const dead = new ReviewProviderError('token expired', { kind: 'permanent' })
    expect(retryDelayFor(dead, 0, now)).toBeUndefined()
    expect(retryDelayFor(new Error('network'), 0, now)).toBe(30_000)
    expect(retryDelayFor(new Error('network'), 2, now)).toBeUndefined()
  })
})

describe('reviewJsonSchema', () => {
  test('draft-7, every field required, enums intact', () => {
    const schema = reviewJsonSchema() as JsonObject
    const findings = schema.properties as JsonObject
    const finding = (findings.findings as JsonObject).items as JsonObject
    const severity = (finding.properties as JsonObject).severity as JsonObject
    expect(String(schema.$schema)).toContain('draft-07')
    expect(schema.required).toEqual(['findings', 'summary', 'verdict'])
    expect(finding.required).toContain('evidence')
    expect(severity.enum).toEqual(['low', 'medium', 'high', 'critical'])
  })
})

describe('path helpers', () => {
  test('isWithin and isEscapingPattern', () => {
    expect(isWithin('/workspace', 'src/a.ts', 'posix')).toBe(true)
    expect(isWithin('/workspace', '/workspace/../etc/passwd', 'posix')).toBe(false)
    expect(isWithin('/workspace', '/workspacex/a', 'posix')).toBe(false)
    expect(isEscapingPattern('**/*.ts')).toBe(false)
    expect(isEscapingPattern('../**')).toBe(true)
    expect(isEscapingPattern('/etc/*')).toBe(true)
    expect(isEscapingPattern('~/.ssh/*')).toBe(true)
  })
})

describe('redactSecrets', () => {
  test('token-shaped strings never reach a posted finding', () => {
    const review: LlmReview = {
      summary: 'ok',
      verdict: 'approve',
      findings: [
        {
          file: 'a.ts',
          line: 1,
          severity: 'low',
          category: 'bug',
          title: 'leak',
          body: 'the key is sk-ant-oat01-abcdefghijklmnopqrstuvwxyz',
          suggestion: 'use ghp_abcdefghijklmnopqrstuvwxyz0123456789',
          evidence: 'const a = 1',
        },
      ],
    }
    const [finding] = redactSecrets(review).findings
    expect(finding?.body).toBe('the key is [redacted]')
    expect(finding?.suggestion).toBe('use [redacted]')
    expect(finding?.evidence).toBe('const a = 1')
  })
})
