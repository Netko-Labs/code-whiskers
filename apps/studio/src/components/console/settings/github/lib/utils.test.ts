import { describe, expect, test } from 'bun:test'
import type { Organization, Repository } from '@/integrations/studio-api'
import { latestSync, summarizeInstallations, syncMessage } from './utils'

const org = (installationId: number, syncedAt: string): Organization => ({
  installationId,
  login: `org-${installationId}`,
  name: null,
  avatarUrl: null,
  accountType: 'Organization',
  syncedAt: new Date(syncedAt),
})

const repo = (id: number, installationId: number, isWatched: boolean): Repository => ({
  id,
  installationId,
  owner: `org-${installationId}`,
  name: `repo-${id}`,
  isPrivate: false,
  isWatched,
  language: null,
  defaultBranch: 'main',
  pushedAt: null,
  syncedAt: new Date(),
})

describe('summarizeInstallations', () => {
  test('counts repositories and watched ones per installation', () => {
    const summary = summarizeInstallations({
      orgs: [org(1, '2026-10-01'), org(2, '2026-10-02')],
      repos: [repo(1, 1, true), repo(2, 1, false), repo(3, 2, true)],
    })
    expect(summary.map((s) => [s.org.installationId, s.repositories, s.watched])).toEqual([
      [1, 2, 1],
      [2, 1, 1],
    ])
  })
})

describe('syncMessage', () => {
  test('counts with the right plural, or says why nothing synced', () => {
    expect(syncMessage({ organizations: 1, repositories: 1 })).toBe(
      'Synced 1 installation, 1 repository',
    )
    expect(syncMessage({ organizations: 2, repositories: 30 })).toBe(
      'Synced 2 installations, 30 repositories',
    )
    expect(
      syncMessage({ organizations: 0, repositories: 0, skipped: 'no-github-account' }),
    ).toMatch(/No GitHub account/)
  })
})

describe('latestSync', () => {
  test('the newest sync, or null before any', () => {
    expect(latestSync([])).toBeNull()
    expect(latestSync([org(1, '2026-10-01'), org(2, '2026-10-03')])?.toISOString()).toBe(
      '2026-10-03T00:00:00.000Z',
    )
  })
})
