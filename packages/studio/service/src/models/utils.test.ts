import { describe, expect, test } from 'bun:test'
import { catalogFrom } from './utils'

const MODELS_DEV = {
  anthropic: {
    models: {
      'claude-haiku-5-5': {
        id: 'claude-haiku-5-5',
        name: 'Claude Haiku 5.5',
        release_date: '2026-10-07',
        reasoning: true,
        tool_call: true,
        limit: { context: 1_000_000 },
        cost: {
          input: 0.1,
          output: 0.5,
          tiers: [{ input: 0.5, output: 2.5, tier: { type: 'context', size: 100_000 } }],
        },
      },
      'claude-old': {
        id: 'claude-old',
        name: 'Old',
        status: 'deprecated',
        tool_call: true,
        release_date: '2027-01-01',
      },
      'claude-no-tools': { id: 'claude-no-tools', tool_call: false },
      broken: { name: 'no id' },
    },
  },
  openrouter: {
    models: {
      'a/old': {
        id: 'a/old',
        tool_call: true,
        release_date: '2025-01-01',
        cost: { input: 1, output: 2, context_over_200k: { input: 2, output: 4 } },
      },
      'a/new': { id: 'a/new', tool_call: true, release_date: '2026-01-01' },
      'a/audio': { id: 'a/audio', tool_call: false, release_date: '2027-01-01' },
    },
  },
}

describe('catalogFrom', () => {
  const catalog = catalogFrom(MODELS_DEV)

  test('maps prices, context and the context tier', () => {
    expect(catalog.claude[0]).toEqual({
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
    })
    expect(catalog.openrouter.find((m) => m.id === 'a/old')?.tier).toEqual({
      contextOver: 200_000,
      inputCost: 2,
      outputCost: 4,
    })
  })

  test('only tool-capable models; newest first, deprecated last; junk skipped', () => {
    expect(catalog.claude.map((m) => m.id)).toEqual(['claude-haiku-5-5', 'claude-old'])
    expect(catalog.openrouter.map((m) => m.id)).toEqual(['a/new', 'a/old'])
    expect(catalog.openai).toEqual([])
  })

  test('an unexpected body is an empty catalog, not a throw', () => {
    expect(catalogFrom(null).claude).toEqual([])
    expect(catalogFrom({ anthropic: { models: 'nope' } }).claude).toEqual([])
  })
})
