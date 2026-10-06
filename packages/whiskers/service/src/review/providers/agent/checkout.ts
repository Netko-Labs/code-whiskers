import { chmod, realpath, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { type ExecResult, mkdtempShared } from '@code-whiskers/sandbox'
import { git } from '../../../shared/git'
import { readToken } from '../../github'
import type { ReviewCommit } from '../types'
import { AGENT_CONFIG_PATHS } from './constants'
import type { CheckoutDir } from './types'

async function must(step: string, result: Promise<ExecResult>): Promise<void> {
  const { code, stderr } = await result
  if (code !== 0) throw new Error(`checkout ${step} failed: ${stderr.trim().slice(0, 300)}`)
}

async function asCheckout(dir: string): Promise<CheckoutDir> {
  // The sandbox user may not be the owner of a 0700 mkdtemp.
  await chmod(dir, 0o755)
  return {
    dir,
    root: await realpath(dir),
    destroy: () => rm(dir, { recursive: true, force: true }),
  }
}

/**
 * The PR head, shallow, with a read-only token: no `.git` (nothing for an agent to mine or a host
 * git to execute), symlinks as plain files, and harness config a PR could plant removed.
 */
export async function openCheckout({ owner, repo, headSha }: ReviewCommit): Promise<CheckoutDir> {
  const token = await readToken(owner, repo)
  const dir = await mkdtempShared('whiskers-review-')
  try {
    await must('init', git(dir, ['init', '-q']))
    await must(
      'fetch',
      git(
        dir,
        [
          'fetch',
          '-q',
          '--depth',
          '1',
          '--no-tags',
          `https://github.com/${owner}/${repo}.git`,
          headSha,
        ],
        { authToken: token },
      ),
    )
    await must('checkout', git(dir, ['checkout', '-q', 'FETCH_HEAD'], { noSymlinks: true }))
    await Promise.all(
      ['.git', ...AGENT_CONFIG_PATHS].map((path) =>
        rm(join(dir, path), { recursive: true, force: true }),
      ),
    )
    return await asCheckout(dir)
  } catch (error) {
    await rm(dir, { recursive: true, force: true })
    throw error
  }
}

/** An empty working directory, for a probe that must not need GitHub. */
export async function emptyCheckout(): Promise<CheckoutDir> {
  return asCheckout(await mkdtempShared('whiskers-probe-'))
}
