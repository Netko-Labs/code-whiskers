import {
  readFile as fsReadFile,
  writeFile as fsWriteFile,
  lstat,
  mkdir,
  mkdtemp,
  realpath,
  rm,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, sep } from 'node:path'
import { createSandbox, dockerAvailable, type ExecResult } from '@code-whiskers/sandbox'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import type { PrRef } from '../review/github'
import { GIT_TIMEOUT_MS, SANDBOX_TTL_MS } from './constants'
import { isProtectedPath } from './utils'

const BOT_NAME = 'code-whiskers[bot]'
const BOT_EMAIL = 'code-whiskers[bot]@users.noreply.github.com'

/**
 * The agent's window onto the PR checkout. With Docker available, reads,
 * writes and commands run inside a network-less sandbox mounted over the
 * clone (with `.git` shielded behind an empty mount so container-side
 * tampering can't plant hooks the host would execute); without Docker
 * (e.g. Railway) the agent gets file access only — `exec` is null and no
 * shell ever runs on the host.
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

/** Write guard: everything in assertSafeRelPath plus the protected-path denylist. */
export function assertSafeWritePath(path: string): void {
  assertSafeRelPath(path)
  if (isProtectedPath(path)) throw new Error(`protected path: ${path}`)
}

interface GitOptions {
  authToken?: string
  noSymlinks?: boolean
  identity?: boolean
}

/**
 * Credentials and per-call config travel via GIT_CONFIG_* env vars — never
 * argv (visible in /proc) and never the on-disk config. Hooks and fsmonitor
 * are always disabled: the checkout's `.git` is agent-adjacent, and the host
 * must not execute anything from it.
 */
async function git(dir: string | null, args: string[], opts: GitOptions = {}): Promise<ExecResult> {
  const configs: Array<[string, string]> = [
    ['core.hooksPath', '/dev/null'],
    ['core.fsmonitor', 'false'],
  ]
  if (opts.authToken) {
    const basic = Buffer.from(`x-access-token:${opts.authToken}`).toString('base64')
    configs.push(['http.extraHeader', `Authorization: Basic ${basic}`])
  }
  if (opts.noSymlinks) configs.push(['core.symlinks', 'false'])
  if (opts.identity) configs.push(['user.name', BOT_NAME], ['user.email', BOT_EMAIL])

  const env: Record<string, string | undefined> = {
    ...process.env,
    GIT_CONFIG_COUNT: String(configs.length),
  }
  configs.forEach(([key, value], i) => {
    env[`GIT_CONFIG_KEY_${i}`] = key
    env[`GIT_CONFIG_VALUE_${i}`] = value
  })

  const proc = Bun.spawn(['git', ...(dir ? ['-C', dir] : []), ...args], {
    env,
    stdout: 'pipe',
    stderr: 'pipe',
  })
  const timer = setTimeout(() => proc.kill(), GIT_TIMEOUT_MS)
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])
  clearTimeout(timer)
  return { code, stdout, stderr }
}

export async function clonePrBranch(
  { owner, repo }: PrRef,
  branch: string,
  token: string,
): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'whiskers-fix-'))
  // symlinks off: a committed symlink must materialize as a plain file, never
  // as a live link the host-fallback fs tools could traverse out of the tree.
  const result = await git(
    null,
    ['clone', '--depth', '50', '--branch', branch, `https://github.com/${owner}/${repo}.git`, dir],
    { authToken: token, noSymlinks: true },
  )
  if (result.code !== 0) {
    await rm(dir, { recursive: true, force: true })
    throw new Error(`clone failed: ${result.stderr.trim().slice(0, 500)}`)
  }
  return dir
}

/**
 * Stage everything; refuse the push outright if any staged path is protected
 * (the sandbox `run` tool can write files without going through writeFile);
 * then commit and push as the bot with hooks disabled. Returns the pushed
 * sha, or null when nothing changed.
 */
export async function commitAndPush(
  dir: string,
  branch: string,
  message: string,
  token: string,
): Promise<string | null> {
  await git(dir, ['add', '-A'])
  // --no-renames: rename detection would report only the destination path,
  // letting `mv .github/workflows/x.yml elsewhere` slip past the denylist.
  const staged = await git(dir, ['diff', '--cached', '--name-only', '--no-renames'])
  const stagedPaths = staged.stdout.split('\n').filter(Boolean)
  if (stagedPaths.length === 0) return null

  const blocked = stagedPaths.filter(isProtectedPath)
  if (blocked.length > 0) {
    throw new Error(`refusing to push protected paths: ${blocked.join(', ')}`)
  }

  const commit = await git(dir, ['commit', '--no-verify', '-m', message], { identity: true })
  if (commit.code !== 0) throw new Error(`commit failed: ${commit.stderr.trim().slice(0, 500)}`)

  const push = await git(dir, ['push', '--no-verify', 'origin', `HEAD:${branch}`], {
    authToken: token,
  })
  if (push.code !== 0) throw new Error(`push failed: ${push.stderr.trim().slice(0, 500)}`)
  return (await git(dir, ['rev-parse', 'HEAD'])).stdout.trim()
}

async function assertInsideRoot(root: string, target: string): Promise<void> {
  const real = await realpath(target)
  if (real !== root && !real.startsWith(root + sep)) throw new Error(`unsafe path: ${target}`)
}

export async function openWorkspace(dir: string): Promise<FixWorkspace> {
  const listFiles = async () => {
    const result = await git(dir, ['ls-files'])
    return result.stdout.split('\n').filter(Boolean)
  }

  if (await dockerAvailable()) {
    // An empty mount shadows /workspace/.git so container-side writes can
    // never reach the real git dir the host later runs commit/push against.
    const gitShield = await mkdtemp(join(tmpdir(), 'whiskers-gitshield-'))
    const sandbox = await createSandbox({
      mounts: [
        { host: dir, container: '/workspace' },
        { host: gitShield, container: '/workspace/.git' },
      ],
      network: 'none',
      ttlMs: SANDBOX_TTL_MS,
    })
    return {
      dir,
      readFile: (path) => {
        assertSafeRelPath(path)
        return sandbox.readFile(path)
      },
      writeFile: (path, content) => {
        assertSafeWritePath(path)
        return sandbox.writeFile(path, content)
      },
      listFiles,
      exec: (command) => sandbox.exec(command, { timeoutMs: whiskersEnvConfig.fix.execTimeoutMs }),
      destroy: async () => {
        await sandbox.destroy()
        await rm(gitShield, { recursive: true, force: true })
      },
    }
  }

  const root = await realpath(dir)
  return {
    dir,
    readFile: async (path) => {
      assertSafeRelPath(path)
      await assertInsideRoot(root, join(dir, path))
      return fsReadFile(join(dir, path), 'utf8')
    },
    writeFile: async (path, content) => {
      assertSafeWritePath(path)
      const target = join(dir, path)
      const existing = await lstat(target).catch(() => null)
      if (existing?.isSymbolicLink()) throw new Error(`unsafe path: ${path}`)
      await mkdir(dirname(target), { recursive: true })
      await assertInsideRoot(root, dirname(target))
      await fsWriteFile(target, content)
    },
    listFiles,
    exec: null,
    destroy: async () => {},
  }
}

export async function removeWorkspaceDir(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true })
}
