import { describe, expect, test } from 'bun:test'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import type { StudioReviewer, WhiskersConfig } from '@code-whiskers/whiskers-domain'
import { applyStudioReviewer, fingerprintOf } from './settings'

const BASE: WhiskersConfig = {
  ...whiskersEnvConfig,
  review: {
    ...whiskersEnvConfig.review,
    provider: 'openrouter',
    model: 'env/model',
    verifyModel: undefined,
    maxTurns: 40,
  },
}
const ENV = { OPENROUTER_API_KEY: 'env-or-key', DATABASE_URL: 'postgres://never' }
const INHERIT: StudioReviewer['settings'] = {
  provider: null,
  model: null,
  verifyModel: null,
  mentionProvider: null,
  mentionModel: null,
  effort: null,
  maxTurns: null,
  maxBudgetUsd: null,
}
const studio = (
  settings: Partial<StudioReviewer['settings']>,
  credentials: Record<string, string> = {},
): StudioReviewer => ({ settings: { ...INHERIT, ...settings }, credentials })

describe('applyStudioReviewer', () => {
  test('no studio answer keeps the env config and only provider credentials from env', () => {
    const resolved = applyStudioReviewer(BASE, null, ENV)
    expect(resolved.config).toBe(BASE)
    expect(resolved.credentials).toEqual({ OPENROUTER_API_KEY: 'env-or-key' })
  })

  test('switching provider drops the env model for the new provider’s defaults', () => {
    const { config } = applyStudioReviewer(BASE, studio({ provider: 'claude' }), ENV)
    expect(config.review.provider).toBe('claude')
    expect(config.review.model).toBe('claude-haiku-5-5')
    expect(config.review.verifyModel).toBe('claude-sonnet-5-5')
    expect(config.review.maxTurns).toBe(40)
  })

  test('studio models and knobs win; verifyModel "off" skips the checker', () => {
    const settings: Partial<StudioReviewer['settings']> = {
      provider: 'claude',
      model: 'claude-x',
      verifyModel: 'off',
      maxTurns: 12,
    }
    const { config } = applyStudioReviewer(BASE, studio(settings), ENV)
    expect(config.review.model).toBe('claude-x')
    expect(config.review.verifyModel).toBeUndefined()
    expect(config.review.maxTurns).toBe(12)
  })

  test('studio keys override env, unknown names are dropped, and keys reach the clients', () => {
    const credentials = { OPENROUTER_API_KEY: 'ui-key', OPENAI_API_KEY: 'oa', DATABASE_URL: 'x' }
    const resolved = applyStudioReviewer(BASE, studio({}, credentials), ENV)
    expect(resolved.credentials).toEqual({ OPENROUTER_API_KEY: 'ui-key', OPENAI_API_KEY: 'oa' })
    expect(resolved.config.openrouter.apiKey).toBe('ui-key')
    expect(resolved.config.openai.apiKey).toBe('oa')
  })

  test('mentions follow the review model on openrouter unless studio names one', () => {
    const follows = applyStudioReviewer(BASE, studio({ model: 'ui/model' }), ENV)
    expect(follows.config.mention).toEqual({ provider: 'openrouter', model: 'ui/model' })
    const named = applyStudioReviewer(BASE, studio({ model: 'ui/model', mentionModel: 'm/x' }), ENV)
    expect(named.config.mention.model).toBe('m/x')
  })

  test('a mention provider of its own takes its default, or the review model when they match', () => {
    const own = applyStudioReviewer(BASE, studio({ mentionProvider: 'openai' }), ENV)
    expect(own.config.mention).toEqual({ provider: 'openai', model: 'gpt-6-luna' })
    const settings = {
      provider: 'claude' as const,
      model: 'claude-x',
      mentionProvider: 'claude' as const,
    }
    const shared = applyStudioReviewer(BASE, studio(settings), ENV)
    expect(shared.config.mention).toEqual({ provider: 'claude', model: 'claude-x' })
    const reviewOnly = applyStudioReviewer(BASE, studio({ provider: 'claude' }), ENV)
    expect(reviewOnly.config.mention).toEqual(BASE.mention)
  })
})

describe('fingerprintOf', () => {
  test('a rotated key rebuilds the provider', () => {
    const before = applyStudioReviewer(BASE, studio({}, { OPENROUTER_API_KEY: 'a' }), ENV)
    const after = applyStudioReviewer(BASE, studio({}, { OPENROUTER_API_KEY: 'b' }), ENV)
    expect(fingerprintOf(before)).not.toBe(fingerprintOf(after))
  })
})
