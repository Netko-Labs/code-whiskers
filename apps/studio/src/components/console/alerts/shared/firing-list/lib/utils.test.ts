import { describe, expect, test } from 'bun:test'
import type { AlertFiring } from '@/integrations/alerts-api'
import { firingTarget } from './utils'

const ORIGIN = 'https://whiskers.netko.dev'
const firing = (overrides: Partial<AlertFiring> = {}): AlertFiring => ({
  id: 'f1',
  ruleId: 'r1',
  ruleName: 'Checkout',
  installationId: 1,
  trigger: 'error_rate',
  subjectKind: 'project',
  subjectRef: '7',
  projectId: '7',
  title: '120 errors in 5 min in shop',
  text: 'Over the threshold of 100.',
  url: `${ORIGIN}/console/issues?scope=project%3A7`,
  status: 'delivered',
  deliveries: [],
  createdAt: new Date('2026-10-05T00:00:00Z'),
  ...overrides,
})

describe('firingTarget', () => {
  test('an issue opens its own page in the console', () => {
    expect(firingTarget(firing({ subjectKind: 'issue', subjectRef: 'i1' }), ORIGIN)).toEqual({
      kind: 'issue',
      issueId: 'i1',
    })
  })

  test('a same-origin link stays in the tab; a pull request opens GitHub', () => {
    expect(firingTarget(firing(), ORIGIN)).toEqual({
      kind: 'internal',
      href: '/console/issues?scope=project%3A7',
    })
    const review = firing({
      subjectKind: 'review',
      url: 'https://github.com/netko-labs/shop/pull/12',
    })
    expect(firingTarget(review, ORIGIN).kind).toBe('external')
  })

  test('no link, nowhere to go', () => {
    expect(firingTarget(firing({ url: null }), ORIGIN)).toEqual({ kind: 'none' })
  })
})
