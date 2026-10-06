import { spawn as spawnProcess } from 'node:child_process'
import { DEFAULT_IMAGE, DEFAULT_TTL_MS, DOCKER_CLIENT_ENV, LABEL, WORKDIR } from './constants'
import { docker, dockerClientEnv } from './docker'
import type { Sandbox, SandboxMount, SandboxOptions } from './types'

function mountArgs(mount: SandboxMount): string[] {
  return ['-v', `${mount.host}:${mount.container}${mount.readOnly ? ':ro' : ''}`]
}

/**
 * A disposable Docker container: no network by default, memory/cpu capped,
 * self-destructs after `ttlMs` even if the caller forgets `destroy()` —
 * `sleep` is PID 1 and `--rm` reaps the container when it exits.
 */
export async function createSandbox(opts: SandboxOptions = {}): Promise<Sandbox> {
  const image = opts.image ?? DEFAULT_IMAGE
  const ttlSeconds = Math.ceil((opts.ttlMs ?? DEFAULT_TTL_MS) / 1000)

  const run = await docker([
    'run',
    '-d',
    '--rm',
    '--label',
    `${LABEL}=1`,
    '--network',
    opts.network ?? 'none',
    '--memory',
    opts.memory ?? '512m',
    '--cpus',
    opts.cpus ?? '1',
    '--security-opt',
    'no-new-privileges',
    ...(opts.readOnlyRoot ? ['--read-only'] : []),
    ...(opts.tmpfs ?? []).flatMap((spec) => ['--tmpfs', spec]),
    ...(opts.user ? ['--user', opts.user] : []),
    ...(opts.mounts ?? []).flatMap(mountArgs),
    '-w',
    WORKDIR,
    image,
    'sleep',
    String(ttlSeconds),
  ])
  if (run.code !== 0) throw new Error(`sandbox create failed: ${run.stderr.trim()}`)
  const id = run.stdout.trim()

  if (!opts.readOnlyRoot) await docker(['exec', id, 'mkdir', '-p', WORKDIR])

  return {
    id,
    async exec(command, execOpts) {
      return docker(
        ['exec', '-w', WORKDIR, id, 'sh', '-c', command],
        undefined,
        execOpts?.timeoutMs ?? 60_000,
      )
    },
    async writeFile(path, content) {
      const result = await docker(
        [
          'exec',
          '-i',
          '-w',
          WORKDIR,
          id,
          'sh',
          '-c',
          `mkdir -p "$(dirname '${path}')" && cat > '${path}'`,
        ],
        content,
      )
      if (result.code !== 0) throw new Error(`sandbox write failed: ${result.stderr.trim()}`)
    },
    async readFile(path) {
      const result = await docker(['exec', '-w', WORKDIR, id, 'cat', path])
      if (result.code !== 0) throw new Error(`sandbox read failed: ${result.stderr.trim()}`)
      return result.stdout
    },
    spawn({ argv, env, workdir }) {
      // Names the docker CLI itself needs (HOME, PATH) go by value; the rest by name only.
      const shared = new Set<string>(DOCKER_CLIENT_ENV)
      const byName = Object.entries(env).filter(([name]) => !shared.has(name))
      const byValue = Object.entries(env).filter(([name]) => shared.has(name))
      return spawnProcess(
        'docker',
        [
          'exec',
          '-i',
          '-w',
          workdir ?? WORKDIR,
          ...byValue.flatMap(([name, value]) => ['-e', `${name}=${value}`]),
          ...byName.flatMap(([name]) => ['-e', name]),
          id,
          ...argv,
        ],
        { env: dockerClientEnv(Object.fromEntries(byName)), stdio: ['pipe', 'pipe', 'pipe'] },
      )
    },
    async destroy() {
      await docker(['rm', '-f', id])
    },
  }
}

/** Kill every sandbox this library ever started — stray-container janitor. */
export async function reapAll(): Promise<number> {
  const ps = await docker(['ps', '-q', '--filter', `label=${LABEL}=1`])
  const ids = ps.stdout.split('\n').filter(Boolean)
  if (ids.length > 0) await docker(['rm', '-f', ...ids])
  const networks = await docker(['network', 'ls', '-q', '--filter', `label=${LABEL}=1`])
  const networkIds = networks.stdout.split('\n').filter(Boolean)
  if (networkIds.length > 0) await docker(['network', 'rm', ...networkIds])
  return ids.length
}

export async function dockerAvailable(): Promise<boolean> {
  try {
    const info = await docker(['version', '--format', '{{.Server.Version}}'], undefined, 5_000)
    return info.code === 0
  } catch {
    return false
  }
}
