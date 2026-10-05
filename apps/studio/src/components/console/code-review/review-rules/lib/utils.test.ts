import { describe, expect, test } from 'bun:test'
import type { ReviewRule } from '@/integrations/studio-api'
import { draftError, draftOf, newDraft, sortRules } from './utils'

function rule(id: string, effect: ReviewRule['effect'], isMuted = false): ReviewRule {
  return {
    id,
    installationId: 7,
    organization: 'acme',
    body: 'Money is integer cents',
    scope: '**',
    effect,
    isMuted,
    authorName: null,
    createdAt: new Date(0),
  }
}

describe('review rule drafts', () => {
  test('a new draft defaults to the first installation, everywhere, as a suggestion', () => {
    expect(newDraft([])).toMatchObject({ scope: '**', effect: 'suggestion', installationId: '' })
  })

  test('validation mirrors studio: a sentence, a short path, an installation', () => {
    const draft = { ...draftOf(rule('a', 'blocker')), id: undefined }
    expect(draftError(draft)).toBeNull()
    expect(draftError({ ...draft, body: 'ok' })).toMatch(/sentence/)
    expect(draftError({ ...draft, scope: 'x'.repeat(201) })).toMatch(/path/)
    expect(draftError({ ...draft, installationId: '' })).toMatch(/installation/)
  })

  test('blockers first, muted last', () => {
    const sorted = sortRules([
      rule('m', 'blocker', true),
      rule('s', 'suggestion'),
      rule('b', 'blocker'),
    ])
    expect(sorted.map((r) => r.id)).toEqual(['b', 's', 'm'])
  })
})
