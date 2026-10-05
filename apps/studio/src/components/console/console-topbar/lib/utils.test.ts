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

  test('alerts pages, and a rule id reads as a rule', () => {
    expect(crumbsFor('/console/alerts', names).map((c) => c.label)).toEqual(['Errors', 'Alerts'])
    expect(crumbsFor('/console/alerts/destinations', names).at(-1)?.label).toBe('Destinations')
    expect(crumbsFor('/console/alerts/0b6f7c1e', names).at(-1)?.label).toBe('Rule')
  })

  test('triage buckets', () => {
    expect(crumbsFor('/console/triage/assigned', names).at(-1)?.label).toBe('Assigned to me')
  })

  test('issues link back to the list and show a short id', () => {
    const crumbs = crumbsFor('/console/issues/0123456789abcdef', names)
    expect(crumbs[1]).toEqual({ label: 'Issues', section: 'issues' })
    expect(crumbs[2]).toEqual({ label: '01234567', isMono: true })
  })

  test('a review links back to pull requests', () => {
    const crumbs = crumbsFor('/console/reviews/0123456789abcdef', names)
    expect(crumbs[1]).toEqual({ label: 'Pull requests', section: 'pull-requests' })
    expect(crumbs[2]).toEqual({ label: '01234567', isMono: true })
  })

  test('a release reads as its version, decoded and short when it is a sha', () => {
    expect(crumbsFor('/console/releases/web%401.4.0', names).at(-1)).toEqual({
      label: 'web@1.4.0',
      isMono: true,
    })
    expect(crumbsFor(`/console/releases/${'a'.repeat(40)}`, names).at(-1)?.label).toBe('aaaaaaa')
    expect(crumbsFor('/console/releases/%E0%A4%A', names).at(-1)?.label).toBe('%E0%A4%A')
  })

  test('projects use the name when known, the id otherwise', () => {
    expect(crumbsFor('/console/projects/p1', names).at(-1)).toEqual({ label: 'web', isMono: false })
    expect(crumbsFor('/console/projects/zzzzzzzzzz', names).at(-1)?.isMono).toBe(true)
    expect(crumbsFor('/console/projects/new', names).at(-1)?.label).toBe('New project')
  })

  test('the projects index stands alone; its children link back to it', () => {
    expect(crumbsFor('/console/projects', names)).toEqual([{ label: 'Projects' }])
    expect(crumbsFor('/console/projects/p1', names)[0]).toEqual({
      label: 'Projects',
      to: '/console/projects',
    })
  })

  test('settings tabs sit under Settings', () => {
    expect(crumbsFor('/console/settings/api-keys', names)).toEqual([
      { label: 'Settings', to: '/console/settings/general' },
      { label: 'API keys' },
    ])
  })

  test('unknown paths have no trail', () => {
    expect(crumbsFor('/console', names)).toEqual([])
    expect(crumbsFor('/console/nope', names)).toEqual([])
  })
})
