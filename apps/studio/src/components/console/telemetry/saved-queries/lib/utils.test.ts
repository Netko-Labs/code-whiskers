import { describe, expect, test } from 'bun:test'
import type { SavedQuery } from '@/integrations/studio-api'
import { destinationOf, summaryOf } from './utils'

const saved = (patch: Partial<SavedQuery>): SavedQuery => ({
  id: 'q1',
  name: 'View',
  section: 'live-logs',
  tab: 0,
  query: null,
  service: null,
  params: {},
  createdAt: new Date(0),
  ...patch,
})

describe('destinationOf', () => {
  test('a view with params restores the whole explorer search', () => {
    const destination = destinationOf(
      saved({ params: { levels: ['error'], attrs: { region: 'eu' }, range: '6h', live: true } }),
    )
    expect(destination).toEqual({
      section: 'live-logs',
      search: { levels: ['error'], attrs: { region: 'eu' }, range: '6h', live: true },
    })
    expect(summaryOf(destination)).toBe('level:error · region:eu · last 6 hours')
  })

  test('an old view is read through its tab, search and service', () => {
    expect(destinationOf(saved({ tab: 1, query: 'timeout', service: 'api' }))).toEqual({
      section: 'live-logs',
      search: { q: 'timeout', service: 'api', levels: ['error', 'fatal'] },
    })
    expect(destinationOf(saved({ section: 'traces', tab: 2 }))).toEqual({
      section: 'traces',
      search: { sort: 'slowest' },
    })
  })

  test('issue views keep their tab', () => {
    const destination = destinationOf(saved({ section: 'issues', tab: 2, query: 'crash' }))
    expect(destination).toEqual({
      section: 'issues',
      search: { tab: 2, q: 'crash', service: undefined },
    })
    expect(summaryOf(destination)).toBe('“crash”')
  })
})
