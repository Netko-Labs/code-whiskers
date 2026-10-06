import { GIT_TIMEOUT_MS } from './constants'
import type { ExecResult, GitOptions } from './types'

/**
 * Credentials and per-call config travel via GIT_CONFIG_* env vars — never
 * argv (visible in /proc) and never the on-disk config. Hooks and fsmonitor
 * are always disabled: a checkout's `.git` is agent-adjacent, and the host
 * must not execute anything from it.
 */
export async function git(
  dir: string | null,
  args: string[],
  opts: GitOptions = {},
): Promise<ExecResult> {
  const configs: Array<[string, string]> = [
    ['core.hooksPath', '/dev/null'],
    ['core.fsmonitor', 'false'],
  ]
  if (opts.authToken) {
    const basic = Buffer.from(`x-access-token:${opts.authToken}`).toString('base64')
    configs.push(['http.extraHeader', `Authorization: Basic ${basic}`])
  }
  if (opts.noSymlinks) configs.push(['core.symlinks', 'false'])

  // Minimal env — the service's own secrets (API keys, app key) have no
  // business inside git subprocesses, and inherited GIT_* vars could
  // redirect or instrument the clone.
  const env: Record<string, string | undefined> = {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
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
