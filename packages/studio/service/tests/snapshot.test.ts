import { describe, expect, test } from 'bun:test'
import type { Octokit } from 'octokit'
import { fetchGithubSnapshot } from '../src/github/snapshot'

const INSTALLATIONS = [
  { id: 1, account: { login: 'netko', type: 'Organization', avatar_url: 'a', name: 'Netko' } },
  { id: 2, account: { login: 'juan', type: 'User', avatar_url: 'b' } },
  { id: 3, account: null },
]

const repo = (id: number, owner: string) => ({
  id,
  name: `repo-${id}`,
  owner: { login: owner },
  private: false,
  language: null,
  default_branch: 'main',
  pushed_at: null,
})

/** Stands in for `octokit.paginate`, which already flattens every page. */
const fakeOctokit = (reposByInstallation: Record<number, unknown[] | Error>) =>
  ({
    paginate: async (route: string, params: Record<string, number>) => {
      if (route === 'GET /user/installations') return INSTALLATIONS
      const repos = reposByInstallation[params.installation_id ?? -1]
      if (repos instanceof Error) throw repos
      return repos ?? []
    },
  }) as unknown as Octokit

describe('fetchGithubSnapshot', () => {
  test('keeps every page of repositories', async () => {
    const many = Array.from({ length: 250 }, (_, i) => repo(i + 1, 'netko'))
    const snapshot = await fetchGithubSnapshot(fakeOctokit({ 1: many, 2: [] }))
    expect(snapshot.repositories).toHaveLength(250)
    expect(snapshot.organizations.map((o) => o.installationId)).toEqual([1, 2])
  })

  test('a failed listing keeps the installation but never marks it prunable', async () => {
    const snapshot = await fetchGithubSnapshot(
      fakeOctokit({ 1: new Error('502'), 2: [repo(9, 'juan')] }),
    )
    expect(snapshot.organizations.map((o) => o.installationId)).toEqual([1, 2])
    expect(snapshot.listedInstallationIds).toEqual([2])
    expect(snapshot.repositories.map((r) => r.id)).toEqual([9])
  })

  test('an empty listing still counts as listed, so its repositories can go', async () => {
    const snapshot = await fetchGithubSnapshot(fakeOctokit({ 1: [], 2: [] }))
    expect(snapshot.listedInstallationIds).toEqual([1, 2])
    expect(snapshot.repositories).toEqual([])
  })
})
