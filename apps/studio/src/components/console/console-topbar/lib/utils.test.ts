import { describe, expect, test } from 'bun:test'
import { crumbsFor } from './utils'

const names = (id: string) => (id === 'p1' ? 'web' : undefined)

describe('crumbsFor', () => {
  test('sections resolve to their nav group', () => {
    expect(crumbsFor('/console/pull-requests', names)).toEqual([
      { label: 'Code review' },
      { label: 'Pull requests' },
    ])
  })

  test('the overview is one crumb', () => {
    expect(crumbsFor('/console/overview', names)).toEqual([{ label: 'Overview' }])
  })

  test('triage buckets', () => {
    expect(crumbsFor('/console/triage/assigned', names).at(-1)?.label).toBe('Assigned to me')
  })

  test('issues link back to the list and show a short id', () => {
    const crumbs = crumbsFor('/console/issues/0123456789abcdef', names)
    expect(crumbs[1]).toEqual({ label: 'Issues', section: 'issues' })
    expect(crumbs[2]).toEqual({ label: '01234567', isMono: true })
  })

  test('projects use the name when known, the id otherwise', () => {
    expect(crumbsFor('/console/projects/p1', names).at(-1)).toEqual({ label: 'web', isMono: false })
    expect(crumbsFor('/console/projects/zzzzzzzzzz', names).at(-1)?.isMono).toBe(true)
    expect(crumbsFor('/console/projects/new', names).at(-1)?.label).toBe('New project')
  })

  test('unknown paths have no trail', () => {
    expect(crumbsFor('/console', names)).toEqual([])
    expect(crumbsFor('/console/nope', names)).toEqual([])
  })
})
