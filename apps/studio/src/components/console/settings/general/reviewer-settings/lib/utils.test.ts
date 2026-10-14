import { describe, expect, test } from 'bun:test'
import type { InstanceReviewer } from '@/integrations/studio-api'
import { credentialState, draftFrom, parseDraft } from './utils'

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
  })
})
