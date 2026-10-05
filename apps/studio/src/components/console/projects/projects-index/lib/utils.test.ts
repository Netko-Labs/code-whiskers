import { describe, expect, test } from 'bun:test'
import type { WhiskersProject } from '@/integrations/whiskers'
import { enabledKeys, filterProjects, projectTotals, sortProjects } from './utils'

const project = (id: string, patch: Partial<WhiskersProject> = {}): WhiskersProject => ({
  id,
  name: `app-${id}`,
  repository: null,
  createdAt: new Date('2026-10-01T00:00:00Z'),
  keys: [],
  issues: 0,
  lastEventAt: null,
  ...patch,
})

describe('sortProjects', () => {
  test('recently heard from first, silent ones newest first', () => {
    const sorted = sortProjects([
      project('1', { createdAt: new Date('2026-09-01') }),
      project('2', { lastEventAt: new Date('2026-10-04') }),
      project('3', { createdAt: new Date('2026-10-02') }),
      project('4', { lastEventAt: new Date('2026-10-05') }),
    ])
    expect(sorted.map((p) => p.id)).toEqual(['4', '2', '3', '1'])
  })
})

describe('filterProjects', () => {
  test('matches name, repository or id', () => {
    const projects = [project('12', { repository: 'netko/web' }), project('7', { name: 'api' })]
    expect(filterProjects(projects, 'NETKO').map((p) => p.id)).toEqual(['12'])
    expect(filterProjects(projects, 'api').map((p) => p.id)).toEqual(['7'])
    expect(filterProjects(projects, ' ')).toHaveLength(2)
  })
})

describe('projectTotals', () => {
  test('sums issues and counts projects that never sent an event', () => {
    const totals = projectTotals([
      project('1', { issues: 3 }),
      project('2', { issues: 4, lastEventAt: new Date() }),
    ])
    expect(totals).toEqual({ projects: 2, issues: 7, silent: 1 })
  })
})

describe('enabledKeys', () => {
  test('counts only keys that still ingest', () => {
    const key = (isEnabled: boolean) => ({
      id: String(isEnabled),
      publicKey: 'k',
      label: 'Default',
      isEnabled,
      createdAt: new Date(),
      lastUsedAt: null,
    })
    expect(enabledKeys(project('1', { keys: [key(true), key(false)] }))).toBe(1)
  })
})
