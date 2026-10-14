import { describe, expect, test } from 'bun:test'
import { assertProductionEnv } from './production'
import { mentionConfigFrom, reviewConfigFrom } from './review'

const PRODUCTION = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgres://x',
  WEB_BASE_URL: 'https://x',
  INTERNAL_TOKEN: 't',
} as const

describe('reviewConfigFrom', () => {
  test('defaults to openrouter and its model', () => {
    const config = reviewConfigFrom({})
    expect(config.provider).toBe('openrouter')
    expect(config.model).toBe('openai/gpt-6-luna')
    expect(config).toMatchObject({ effort: 'medium', maxTurns: 40, timeoutMs: 600_000 })
    expect(config.maxBudgetUsd).toBeUndefined()
  })

  test('each provider brings its own default model', () => {
    expect(reviewConfigFrom({ REVIEW_PROVIDER: 'claude' }).model).toBe('claude-haiku-5-5')
    expect(reviewConfigFrom({ REVIEW_PROVIDER: 'ai-gateway' }).model).toBe('openai/gpt-6-luna')
    expect(reviewConfigFrom({ REVIEW_PROVIDER: 'openai' }).model).toBe('gpt-6-luna')
  })

  test('agentic reviews are checked by a second model unless turned off', () => {
    expect(reviewConfigFrom({ REVIEW_PROVIDER: 'claude' }).verifyModel).toBe('claude-sonnet-5-5')
    expect(
      reviewConfigFrom({ REVIEW_PROVIDER: 'claude', REVIEW_VERIFY_MODEL: 'claude-opus-5-5' })
        .verifyModel,
    ).toBe('claude-opus-5-5')
    expect(
      reviewConfigFrom({ REVIEW_PROVIDER: 'claude', REVIEW_VERIFY_MODEL: 'off' }).verifyModel,
    ).toBeUndefined()
    expect(reviewConfigFrom({ REVIEW_PROVIDER: 'openrouter' }).verifyModel).toBeUndefined()
  })

  test('REVIEW_MODEL overrides the active provider and agent knobs parse as numbers', () => {
    const config = reviewConfigFrom({
      REVIEW_PROVIDER: 'claude',
      REVIEW_MODEL: 'claude-sonnet-5',
      REVIEW_AGENT_EFFORT: 'high',
      REVIEW_AGENT_MAX_TURNS: '12',
      REVIEW_AGENT_TIMEOUT_MS: '90000',
      REVIEW_AGENT_MAX_BUDGET_USD: '1.5',
      CLAUDE_CODE_EXECUTABLE: '/opt/claude',
    })
    expect(config).toMatchObject({
      model: 'claude-sonnet-5',
      effort: 'high',
      maxTurns: 12,
      timeoutMs: 90_000,
      maxBudgetUsd: 1.5,
      claudeExecutable: '/opt/claude',
    })
  })

  test('a blank provider is unset; a misspelt one refuses to boot', () => {
    expect(reviewConfigFrom({ REVIEW_PROVIDER: ' ' }).provider).toBe('openrouter')
    expect(() => reviewConfigFrom({ REVIEW_PROVIDER: 'anthropic' })).toThrow()
    expect(() => reviewConfigFrom({ REVIEW_AGENT_EFFORT: 'extreme' })).toThrow()
  })
})

describe('mentionConfigFrom', () => {
  const modelOf = (env: NodeJS.ProcessEnv) => mentionConfigFrom(env).model

  test('defaults to openrouter and follows REVIEW_MODEL only while reviews run there too', () => {
    expect(mentionConfigFrom({}).provider).toBe('openrouter')
    expect(modelOf({ REVIEW_MODEL: 'x/y' })).toBe('x/y')
    expect(modelOf({ REVIEW_PROVIDER: 'claude', REVIEW_MODEL: 'claude-x' })).toBe(
      'openai/gpt-6-luna',
    )
    expect(modelOf({ REVIEW_PROVIDER: 'claude', OPENROUTER_MODEL: 'a/b' })).toBe('a/b')
  })

  test('MENTION_PROVIDER picks another provider with its own default, or MENTION_MODEL', () => {
    expect(mentionConfigFrom({ MENTION_PROVIDER: 'claude' })).toEqual({
      provider: 'claude',
      model: 'claude-haiku-5-5',
    })
    const sameAsReview = {
      MENTION_PROVIDER: 'claude',
      REVIEW_PROVIDER: 'claude',
      REVIEW_MODEL: 'c',
    }
    expect(modelOf(sameAsReview)).toBe('c')
    expect(modelOf({ MENTION_PROVIDER: 'openai', MENTION_MODEL: 'gpt-x' })).toBe('gpt-x')
    expect(modelOf({ MENTION_PROVIDER: 'openai', OPENROUTER_MODEL: 'a/b' })).toBe('gpt-6-luna')
    expect(() => mentionConfigFrom({ MENTION_PROVIDER: 'anthropic' })).toThrow()
  })
})

describe('assertProductionEnv', () => {
  test('a provider credential missing from env is no warning: studio may hold it', () => {
    expect(assertProductionEnv({ ...PRODUCTION, REVIEW_PROVIDER: 'claude' })).toEqual([])
  })

  test('development never warns', () => {
    expect(assertProductionEnv({ REVIEW_PROVIDER: 'claude' })).toEqual([])
  })
})
