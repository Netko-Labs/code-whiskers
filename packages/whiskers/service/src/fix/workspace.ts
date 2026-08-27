import {
  readFile as fsReadFile,
  writeFile as fsWriteFile,
  mkdir,
  mkdtemp,
  rm,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { createSandbox, dockerAvailable, type ExecResult } from '@code-whiskers/sandbox'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import type { PrRef } from '../review/github'

const BOT_NAME = 'code-whiskers[bot]'
const BOT_EMAIL = 'code-whiskers[bot]@users.noreply.github.com'

/**
 * The agent's window onto the PR checkout. With Docker available, reads,
 * writes and commands run inside a network-less sandbox mounted over the
 * clone; without it (e.g. Railway) the agent gets file access only — `exec`
 * is null and no shell ever runs on the host.
 */
export interface FixWorkspace {
  dir: string
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
  listFiles(): Promise<string[]>
  exec: ((command: string) => Promise<ExecResult>) | null
  destroy(): Promise<void>
}

/** Reject paths that could escape the checkout or break shell quoting in the sandbox. */
export function assertSafeRelPath(path: string): void {
  if (
    path.length === 0 ||
    path.startsWith('/') ||
    path.includes('..') ||
    path.includes("'") ||
    path.includes('\\') ||
    path.startsWith('.git/') ||
    path === '.git'
  ) {
    throw new Error(`unsafe path: ${path}`)
  }
}

async function git(dir: string | null, args: string[], authToken?: string): Promise<ExecResult> {
  // `git -c` config is per-invocation only — the token never lands on disk.
  const auth = authToken
    ? [
        '-c',
        `http.extraHeader=Authorization: Basic ${Buffer.from(`x-access-token:${authToken}`).toString('base64')}`,
      ]
    : []
  const proc = Bun.spawn(['git', ...auth, ...(dir ? ['-C', dir] : []), ...args], {
    stdout: 'pipe',
    stderr: 'pipe',
  })
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])
  return { code, stdout, stderr }
}

export async function clonePrBranch(
  { owner, repo }: PrRef,
  branch: string,
  token: string,
): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'whiskers-fix-'))
  const result = await git(
    null,
    ['clone', '--depth', '50', '--branch', branch, `https://github.com/${owner}/${repo}.git`, dir],
    token,
  )
  if (result.code !== 0) {
    await rm(dir, { recursive: true, force: true })
    throw new Error(`clone failed: ${result.stderr.trim().slice(0, 500)}`)
  }
  return dir
}

/** Stage everything; commit and push as the bot. Returns the pushed sha, or null when nothing changed. */
export async function commitAndPush(
  dir: string,
  branch: string,
  message: string,
  token: string,
): Promise<string | null> {
  await git(dir, ['add', '-A'])
  const staged = await git(dir, ['diff', '--cached', '--quiet'])
  if (staged.code === 0) return null

  const commit = await git(dir, [
    '-c',
    `user.name=${BOT_NAME}`,
    '-c',
    `user.email=${BOT_EMAIL}`,
    'commit',
    '-m',
    message,
  ])
  if (commit.code !== 0) throw new Error(`commit failed: ${commit.stderr.trim().slice(0, 500)}`)

  const push = await git(dir, ['push', 'origin', `HEAD:${branch}`], token)
  if (push.code !== 0) throw new Error(`push failed: ${push.stderr.trim().slice(0, 500)}`)
  return (await git(dir, ['rev-parse', 'HEAD'])).stdout.trim()
}

export async function openWorkspace(dir: string): Promise<FixWorkspace> {
  const listFiles = async () => {
    const result = await git(dir, ['ls-files'])
    return result.stdout.split('\n').filter(Boolean)
  }

  if (await dockerAvailable()) {
    const sandbox = await createSandbox({
      mounts: [{ host: dir, container: '/workspace' }],
      ttlMs: 15 * 60_000,
    })
    return {
      dir,
      readFile: (path) => {
        assertSafeRelPath(path)
        return sandbox.readFile(path)
      },
      writeFile: (path, content) => {
        assertSafeRelPath(path)
        return sandbox.writeFile(path, content)
      },
      listFiles,
      exec: (command) => sandbox.exec(command, { timeoutMs: whiskersEnvConfig.fix.execTimeoutMs }),
      destroy: () => sandbox.destroy(),
    }
  }

  return {
    dir,
    readFile: (path) => {
      assertSafeRelPath(path)
      return fsReadFile(join(dir, path), 'utf8')
    },
    writeFile: async (path, content) => {
      assertSafeRelPath(path)
      await mkdir(dirname(join(dir, path)), { recursive: true })
      await fsWriteFile(join(dir, path), content)
    },
    listFiles,
    exec: null,
    destroy: async () => {},
  }
}

export async function removeWorkspaceDir(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true })
}
