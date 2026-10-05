import { describe, expect, test } from 'bun:test'
import type { TriageActivity } from '@/integrations/studio-api'
import type { WhiskersEventDetail } from '@/integrations/whiskers'
import { activityView, crumbView, groupFrames, tagShares } from './utils'

type Frame = WhiskersEventDetail['frames'][number]

function frame(name: string, isInApp: boolean): Frame {
  return { file: `${name}.ts`, function: name, line: 1, column: 1, isInApp, context: null }
}

function entry(overrides: Partial<TriageActivity>): TriageActivity {
  return {
    id: '1',
    kind: 'resolved',
    actorUserId: 'u1',
    actorName: 'Ana',
    actorImage: null,
    data: null,
    body: null,
    createdAt: new Date(0),
    ...overrides,
  }
}

describe('groupFrames', () => {
  test('in-app frames stand alone; library runs fold into one group', () => {
    const groups = groupFrames([
      frame('a', true),
      frame('lib1', false),
      frame('lib2', false),
      frame('b', true),
      frame('lib3', false),
    ])
    expect(groups.map((group) => group.kind)).toEqual(['app', 'vendor', 'app', 'vendor'])
    const [, vendor] = groups
    expect(vendor?.kind === 'vendor' && vendor.frames).toHaveLength(2)
  })
})

describe('crumbView', () => {
  test('the type wins; the category decides when there is none', () => {
    const http = crumbView({
      timestamp: null,
      type: null,
      category: 'fetch',
      level: 'info',
      message: 'GET /x',
    })
    expect(http.label).toBe('fetch')
    expect(http.tone).toBe('muted')
    const failed = crumbView({
      timestamp: '1700000000',
      type: 'error',
      category: 'auth',
      level: 'error',
      message: 'boom',
    })
    expect(failed.tone).toBe('bad')
    expect(failed.time).not.toBe('')
  })
})

describe('tagShares', () => {
  test('values become shares of the key', () => {
    expect(
      tagShares([
        { value: 'Chrome', count: 3 },
        { value: 'Safari', count: 1 },
      ]).map((share) => share.percent),
    ).toEqual([75, 25])
    expect(tagShares([{ value: 'x', count: 0 }])[0]?.percent).toBe(0)
  })
})

describe('activityView', () => {
  test('a person resolving in the next release, with the release it waits on', () => {
    const view = activityView(
      entry({ data: { mode: 'next_release', release: 'a1b2c3d4e5f6a7b8' } }),
    )
    expect(view.who).toBe('Ana')
    expect(view.text).toBe('resolved this in the next release (after a1b2c3d)')
  })

  test('system rows speak as CodeWhiskers', () => {
    const view = activityView(
      entry({
        kind: 'regressed',
        actorUserId: null,
        actorName: null,
        data: { eventId: 'e1', release: 'v2.0.0' },
      }),
    )
    expect(view.isSystem).toBe(true)
    expect(view.who).toBe('CodeWhiskers')
    expect(view.text).toBe('saw it again in v2.0.0 — regressed')
  })

  test('comments carry their body; archive reads its condition', () => {
    expect(activityView(entry({ kind: 'commented', body: 'on it' })).body).toBe('on it')
    expect(
      activityView(entry({ kind: 'archived', data: { mode: 'events', count: 100 } })).text,
    ).toBe('archived this until 100 more events')
  })
})
