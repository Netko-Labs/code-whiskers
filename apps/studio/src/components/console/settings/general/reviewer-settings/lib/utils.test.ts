import { describe, expect, test } from 'bun:test'
import type { InstanceReviewer } from '@/integrations/studio-api'
import {
  asProvider,
  catalogProviderOf,
  credentialState,
  draftFrom,
  matchesModel,
  modelSummary,
  parseDraft,
} from './utils'
import { MODEL_FIELDS } from './values'

const reviewer = (provider: string, isSet: boolean): InstanceReviewer => ({
  provider,
  model: 'm',
  isAgentic: provider === 'claude',
  credentials: [{ name: 'ANTHROPIC_API_KEY', isSet }],
  executable: null,
  problems: [],
})
const presence = (isSet: boolean) => ({
  name: 'ANTHROPIC_API_KEY' as const,
  isSet,
  updatedAt: null,
})

describe('parseDraft', () => {
  test('empty fields inherit and numbers parse', () => {
    const draft = { ...draftFrom(), provider: 'claude', maxTurns: ' 12 ', model: '  ' }
    expect(parseDraft(draft).settings).toMatchObject({
      provider: 'claude',
      model: null,
      maxTurns: 12,
      maxBudgetUsd: null,
    })
  })

  test('names the field studio would refuse', () => {
    expect(parseDraft({ ...draftFrom(), maxTurns: 'lots' }).error).toStartWith('Max turns:')
  })

  test('round-trips saved settings', () => {
    const saved = parseDraft({ ...draftFrom(), effort: 'high', maxBudgetUsd: '0.5' }).settings
    expect(saved && draftFrom(saved)).toMatchObject({ effort: 'high', maxBudgetUsd: '0.5' })
  })
})

describe('credentialState', () => {
  test('stored beats env, env beats needed, unused keys are just unset', () => {
    expect(credentialState(presence(true), reviewer('claude', true))).toBe('stored')
    expect(credentialState(presence(false), reviewer('claude', true))).toBe('env')
    expect(credentialState(presence(false), reviewer('claude', false))).toBe('needed')
    expect(credentialState(presence(false), reviewer('openrouter', false))).toBe('unset')
    expect(credentialState(presence(false), reviewer('openrouter', false), 'claude')).toBe('needed')
  })
})

const haiku = {
  id: 'claude-haiku-5-5',
  name: 'Claude Haiku 5.5',
  releaseDate: '2026-10-07',
  context: 1_000_000,
  inputCost: 0.1,
  outputCost: 0.5,
  tier: { contextOver: 100_000, inputCost: 0.5, outputCost: 2.5 },
  isReasoning: true,
  hasTools: true,
  isDeprecated: false,
}

describe('model search', () => {
  test('the summary carries context, price and the dearer tier', () => {
    expect(modelSummary(haiku)).toBe('1M context · $0.1 / $0.5 per M · $0.5 / $2.5 past 100k')
  })

  test('matches id or name, any case', () => {
    expect(matchesModel(haiku, 'HAIKU 5')).toBe(true)
    expect(matchesModel(haiku, 'claude-haiku')).toBe(true)
    expect(matchesModel(haiku, 'opus')).toBe(false)
  })

  test('the review model follows the active provider; the others are fixed', () => {
    const providers = { review: 'openai', mention: 'claude' } as const
    expect(catalogProviderOf({ ...MODEL_FIELDS[0], catalog: 'review' }, providers)).toBe('openai')
    expect(catalogProviderOf({ ...MODEL_FIELDS[0], catalog: 'mention' }, providers)).toBe('claude')
    expect(catalogProviderOf({ ...MODEL_FIELDS[0], catalog: 'openrouter' }, providers)).toBe(
      'openrouter',
    )
    expect(
      catalogProviderOf({ ...MODEL_FIELDS[0], catalog: 'review' }, { review: null, mention: null }),
    ).toBeNull()
    expect(asProvider('ai-gateway')).toBe('ai-gateway')
    expect(asProvider('nope')).toBeNull()
  })
})
