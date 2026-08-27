export interface SandboxMount {
  host: string
  container: string
}

export interface SandboxOptions {
  image?: string
  ttlMs?: number
  memory?: string
  cpus?: string
  network?: 'none' | 'bridge'
  mounts?: SandboxMount[]
}

export interface ExecResult {
  code: number
  stdout: string
  stderr: string
}

export interface Sandbox {
  id: string
  exec(command: string, opts?: { timeoutMs?: number }): Promise<ExecResult>
  writeFile(path: string, content: string): Promise<void>
  readFile(path: string): Promise<string>
  destroy(): Promise<void>
}

const LABEL = 'code-whiskers-sandbox'
const DEFAULT_IMAGE = 'oven/bun:1-alpine'
const DEFAULT_TTL_MS = 10 * 60_000
const WORKDIR = '/workspace'

async function docker(args: string[], stdin?: string, timeoutMs?: number): Promise<ExecResult> {
  const proc = Bun.spawn(['docker', ...args], {
    stdin: stdin === undefined ? 'ignore' : new TextEncoder().encode(stdin),
    stdout: 'pipe',
    stderr: 'pipe',
  })
  const timer = timeoutMs ? setTimeout(() => proc.kill(), timeoutMs) : undefined
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])
  if (timer) clearTimeout(timer)
  return { code, stdout, stderr }
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
    ...(opts.mounts ?? []).flatMap((m) => ['-v', `${m.host}:${m.container}`]),
    '-w',
    WORKDIR,
    image,
    'sleep',
    String(ttlSeconds),
  ])
  if (run.code !== 0) throw new Error(`sandbox create failed: ${run.stderr.trim()}`)
  const id = run.stdout.trim()

  await docker(['exec', id, 'mkdir', '-p', WORKDIR])

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
