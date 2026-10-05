import { describe, expect, test } from 'bun:test'
import { deployTimelineOf, releaseEnvironmentsOf } from '../src/queries/releases/utils'
import {
  commitStatusOf,
  commitTargetOf,
  currentReleases,
  isSameFile,
  mapLimit,
  pairKey,
  prNumberFromMessage,
  shaInVersion,
  suspectMatchesOf,
} from '../src/releases'
import { SYNC_RETRY_MS } from '../src/releases/constants'
import { isReleaseTouchDue } from '../src/releases/touch'

const at = (iso: string) => new Date(iso)

describe('release commit targets', () => {
  test('a version that is, or ends in, a sha names its commit', () => {
    expect(shaInVersion('4f2a9c1')).toBe('4f2a9c1')
    expect(shaInVersion('web@4F2A9C1E0B')).toBe('4f2a9c1e0b')
    expect(shaInVersion('1.4.0')).toBeNull()
    expect(shaInVersion('web@1.4.0')).toBeNull()
  })

  test('its own repository and sha win over the project and the version', () => {
    const release = { version: 'abc1234', repository: null, commitSha: null }
    expect(commitTargetOf(release, 'acme/web')).toEqual({ repository: 'acme/web', sha: 'abc1234' })
    expect(
      commitTargetOf({ version: '2.0', repository: 'acme/api', commitSha: 'DEF5678' }, 'acme/web'),
    ).toEqual({ repository: 'acme/api', sha: 'def5678' })
    expect(commitTargetOf({ version: '2.0', repository: null, commitSha: null }, null)).toEqual({
      repository: null,
      sha: null,
    })
  })

  test('status says why commits are missing, and backs off after a failure', () => {
    const unsynced = { commitsSyncedAt: null }
    const ready = { repository: 'acme/web', sha: 'abc1234' }
    expect(commitStatusOf({ commitsSyncedAt: new Date() }, ready, undefined, 0)).toBe('synced')
    expect(commitStatusOf(unsynced, { repository: null, sha: 'abc1234' }, undefined, 0)).toBe(
      'no-repository',
    )
    expect(commitStatusOf(unsynced, { repository: 'acme/web', sha: null }, undefined, 0)).toBe(
      'no-commit',
    )
    expect(commitStatusOf(unsynced, ready, undefined, 0)).toBe('pending')
    expect(commitStatusOf(unsynced, ready, 1_000, 2_000)).toBe('failed')
    expect(commitStatusOf(unsynced, ready, 1_000, 1_000 + SYNC_RETRY_MS)).toBe('pending')
  })
})

describe('prNumberFromMessage', () => {
  test('squash and merge commits name their pull request', () => {
    expect(prNumberFromMessage('✨ feat(x): thing (#32)\n\nbody (#99)')).toBe(32)
    expect(prNumberFromMessage('Merge pull request #7 from acme/branch')).toBe(7)
    expect(prNumberFromMessage('fix: see #12 for context')).toBeNull()
  })
})

describe('suspect commits', () => {
  test('a frame and a changed file match on their trailing segments', () => {
    expect(isSameFile('app:///src/checkout/cart.ts', 'apps/web/src/checkout/cart.ts')).toBe(true)
    expect(isSameFile('webpack://web/./src/cart.ts', 'src/cart.ts')).toBe(true)
    expect(isSameFile('/srv/app/dist/cart.ts', 'apps/web/src/cart.ts')).toBe(false)
    expect(isSameFile('cart.ts', 'apps/web/src/cart.ts')).toBe(true)
    expect(isSameFile('', 'cart.ts')).toBe(false)
  })

  test('commits touching more of the stack rank first; untouched ones drop out', () => {
    const commits = [
      { sha: 'a', files: ['README.md'] },
      { sha: 'b', files: ['src/cart.ts'] },
      { sha: 'c', files: ['src/cart.ts', 'src/pay.ts'] },
    ]
    const frames = ['/app/src/cart.ts', '/app/src/pay.ts', '/app/src/cart.ts']
    expect(suspectMatchesOf(commits, frames)).toEqual([
      { sha: 'c', matchedFiles: ['src/cart.ts', 'src/pay.ts'] },
      { sha: 'b', matchedFiles: ['src/cart.ts'] },
    ])
  })
})

describe('current release per environment', () => {
  const candidates = [
    { id: 'r1', projectId: 'p', firstSeen: at('2026-01-01'), environments: ['production'] },
    {
      id: 'r2',
      projectId: 'p',
      firstSeen: at('2026-01-02'),
      environments: ['production', 'staging'],
    },
  ]

  test('without deploys the newest release seen in an environment runs there', () => {
    const current = currentReleases(candidates, [])
    expect(current.get(pairKey('p', 'production'))).toBe('r2')
    expect(current.get(pairKey('p', 'staging'))).toBe('r2')
  })

  test('a deploy says what runs, whatever the events say', () => {
    const current = currentReleases(candidates, [
      { projectId: 'p', environment: 'production', releaseId: 'r1' },
    ])
    expect(current.get(pairKey('p', 'production'))).toBe('r1')
    expect(current.get(pairKey('p', 'staging'))).toBe('r2')
  })

  test('environments list current ones first, with their newest deploy', () => {
    const deploy = (environment: string, iso: string) => ({
      id: iso,
      releaseId: 'r1',
      environment,
      deployedAt: at(iso),
      url: null,
      name: null,
    })
    const currents = new Map([[pairKey('p', 'staging'), 'r1']])
    expect(
      releaseEnvironmentsOf(
        { id: 'r1', projectId: 'p' },
        ['production'],
        [deploy('staging', '2026-01-01'), deploy('staging', '2026-01-03')],
        currents,
      ),
    ).toEqual([
      { name: 'staging', isCurrent: true, deployedAt: at('2026-01-03') },
      { name: 'production', isCurrent: false, deployedAt: null },
    ])
  })

  test('the deploy timeline marks the newest per environment active', () => {
    const entry = (id: string, releaseId: string, environment: string, iso: string) => ({
      id,
      releaseId,
      environment,
      deployedAt: at(iso),
      url: null,
      name: null,
      version: releaseId,
    })
    const timeline = deployTimelineOf(
      [
        entry('d1', 'r1', 'production', '2026-01-01'),
        entry('d2', 'r2', 'production', '2026-01-02'),
        entry('d3', 'r1', 'staging', '2026-01-01'),
      ],
      'r1',
    )
    expect(timeline.map((d) => [d.id, d.isActive, d.isThisRelease])).toEqual([
      ['d2', true, false],
      ['d1', false, true],
      ['d3', true, true],
    ])
  })
})

describe('release bookkeeping', () => {
  test('last_seen writes are throttled per release', () => {
    expect(isReleaseTouchDue('p\u0000v1', 0)).toBe(true)
    expect(isReleaseTouchDue('p\u0000v1', 30_000)).toBe(false)
    expect(isReleaseTouchDue('p\u0000v2', 30_000)).toBe(true)
    expect(isReleaseTouchDue('p\u0000v1', 60_000)).toBe(true)
  })

  test('mapLimit keeps order and never runs more than the limit at once', async () => {
    let running = 0
    let peak = 0
    const result = await mapLimit([5, 1, 3, 2], 2, async (n) => {
      running += 1
      peak = Math.max(peak, running)
      await Bun.sleep(n)
      running -= 1
      return n * 10
    })
    expect(result).toEqual([50, 10, 30, 20])
    expect(peak).toBe(2)
  })
})
