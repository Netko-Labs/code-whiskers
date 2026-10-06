import { type ChildProcessWithoutNullStreams, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DEFAULT_JAIL_LIMITS, JAIL_ENTRY_BUNDLED, PROBE_FLAG, PROBE_TIMEOUT_MS } from './constants'
import { jailIdentity } from './policy'
import { JailProbeSchema } from './schemas'
import type { JailPolicy, JailProbe, JailSpawnRequest } from './types'

/** A build ships the launcher next to the bundle; a source checkout runs it as TypeScript. */
export function jailEntry(mainDir: string = dirname(Bun.main)): string {
  const bundled = join(mainDir, JAIL_ENTRY_BUNDLED)
  return existsSync(bundled) ? bundled : fileURLToPath(new URL('./main.ts', import.meta.url))
}

/**
 * Bun with nothing to pick up from where it starts (no `.env`, no `bunfig.toml`, no install):
 * it runs as root until the jail drops it, so it must never start inside the checkout.
 */
function launcherArgv(extra: string[]): string[] {
  return ['--no-install', '--no-env-file', jailEntry(), ...extra]
}

/** The harness, jailed: the launcher applies the policy, then becomes `argv[0]` on the same stdio. */
export function spawnJailed({
  policy,
  argv,
  env,
  launcherCwd,
}: JailSpawnRequest): ChildProcessWithoutNullStreams {
  return spawn(process.execPath, launcherArgv([JSON.stringify(policy), ...argv]), {
    cwd: launcherCwd,
    env,
    stdio: ['pipe', 'pipe', 'pipe'],
  })
}

const unusable = (reason: string): JailProbe => ({
  isUsable: false,
  landlockAbi: null,
  canDropUid: false,
  hasSeccomp: false,
  reason,
})

/** An empty policy on a throwaway launcher: what this kernel and container let a child do. */
export async function probeJail(uid: number): Promise<JailProbe> {
  if (process.platform !== 'linux') return unusable('not Linux')
  const cwd = await mkdtemp(join(tmpdir(), 'whiskers-jail-probe-'))
  const policy: JailPolicy = {
    ...jailIdentity(uid),
    cwd,
    grants: [],
    connectPorts: [],
    limits: DEFAULT_JAIL_LIMITS,
    hasSeccomp: true,
  }
  try {
    const proc = Bun.spawn(
      [process.execPath, ...launcherArgv([PROBE_FLAG, JSON.stringify(policy)])],
      { cwd, env: { PATH: process.env.PATH ?? '' }, stdout: 'pipe', stderr: 'pipe' },
    )
    const timer = setTimeout(() => proc.kill(), PROBE_TIMEOUT_MS)
    const [stdout, stderr, code] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ])
    clearTimeout(timer)
    const verdict = lastVerdict(stdout)
    return (
      verdict ?? unusable(`the jail probe failed (exit ${code}): ${stderr.trim().slice(0, 300)}`)
    )
  } finally {
    await rm(cwd, { recursive: true, force: true })
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/** The probe reports after each stage; the last line it got out is how far this host lets it go. */
export function lastVerdict(stdout: string): JailProbe | null {
  const lines = stdout.split('\n').filter(Boolean).reverse()
  for (const line of lines) {
    const parsed = JailProbeSchema.safeParse(safeJson(line))
    if (parsed.success) return parsed.data
  }
  return null
}
