import { DOCKER_CLIENT_ENV } from './constants'
import type { ExecResult } from './types'

/** The docker CLI's own env; anything an agent needs is added per call, never inherited wholesale. */
export function dockerClientEnv(extra: Record<string, string> = {}): Record<string, string> {
  const env: Record<string, string> = {}
  for (const name of DOCKER_CLIENT_ENV) {
    const value = process.env[name]
    if (value) env[name] = value
  }
  return { ...env, ...extra }
}

export async function docker(
  args: string[],
  stdin?: string,
  timeoutMs?: number,
): Promise<ExecResult> {
  const proc = Bun.spawn(['docker', ...args], {
    stdin: stdin === undefined ? 'ignore' : new TextEncoder().encode(stdin),
    stdout: 'pipe',
    stderr: 'pipe',
    env: dockerClientEnv(),
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
