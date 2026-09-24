import { describe, expect, test } from 'bun:test'
import type { WhiskersProject } from '@/integrations/whiskers'
import { isInScope, resolveScope, UNSCOPED } from './utils'

function project(id: string, repository: string | null): WhiskersProject {
  return {
    id,
    name: `app-${id}`,
    repository,
    publicKey: 'key',
    createdAt: new Date(0),
    issues: 0,
    lastEventAt: null,
  }
}

const PROJECTS = [project('1', 'Acme/Web'), project('2', null), project('3', 'acme/web')]

describe('resolveScope', () => {
  test('no value reads everything', () => {
    expect(resolveScope(null, PROJECTS)).toEqual(UNSCOPED)
  })

  test('a repository reads every project linked to it, whatever the case', () => {
    const scope = resolveScope('acme/web', PROJECTS)
    expect(scope.repository).toBe('acme/web')
    expect(scope.projectIds).toEqual(['1', '3'])
    expect(scope.label).toBe('web')
  })

  test('a repository nothing links to reads no project', () => {
    expect(resolveScope('acme/api', PROJECTS).projectIds).toEqual([])
  })

  test('a project reads that project and inherits its repository', () => {
    const scope = resolveScope('project:1', PROJECTS)
    expect(scope.projectIds).toEqual(['1'])
    expect(scope.repository).toBe('Acme/Web')
    expect(scope.label).toBe('app-1')
  })
})

describe('isInScope', () => {
  const scope = resolveScope('acme/web', PROJECTS)

  test('matches a review by repository', () => {
    expect(isInScope(scope, { repository: 'ACME/web' })).toBe(true)
    expect(isInScope(scope, { repository: 'acme/api' })).toBe(false)
  })

  test('matches an error by its linked project', () => {
    expect(isInScope(scope, { projectId: '3' })).toBe(true)
    expect(isInScope(scope, { projectId: '2' })).toBe(false)
  })

  test('everything is in the unscoped view', () => {
    expect(isInScope(UNSCOPED, { projectId: '2', repository: null })).toBe(true)
  })
})
