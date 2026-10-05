import { describe, expect, test } from 'bun:test'
import { IconInbox } from '@tabler/icons-react'
import { isNavActive, navKey, navPath } from './utils'

const issues = {
  label: 'Issues',
  icon: IconInbox,
  to: '/console/$section',
  params: { section: 'issues' as const },
}
const project = {
  label: 'web',
  icon: IconInbox,
  to: '/console/projects/$projectId',
  params: { projectId: 'p1' },
}

describe('nav paths', () => {
  test('keys and paths follow the params', () => {
    expect(navKey(issues)).toBe('section:issues')
    expect(navPath(project)).toBe('/console/projects/p1')
  })

  test('a nested route keeps its parent active, a sibling prefix does not', () => {
    expect(isNavActive(project, '/console/projects/p1')).toBe(true)
    expect(isNavActive(project, '/console/projects/p10')).toBe(false)
    expect(isNavActive(issues, '/console/issues')).toBe(true)
  })
})
