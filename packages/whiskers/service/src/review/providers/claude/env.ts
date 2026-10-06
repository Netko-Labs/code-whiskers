import { join } from 'node:path'
import {
  AGENT_PROXY_ENV,
  agentEnv,
  CONTAINER_HOME,
  CONTAINER_PATH,
  pickEnv,
  type SandboxKind,
} from '../agent'
import { hasCredential } from '../credentials'
import { CLAUDE_CREDENTIALS, CLAUDE_FIXED_ENV, CLAUDE_PASS_THROUGH } from './constants'

/**
 * Without a credential in env, a development worker borrows the operator's own Claude Code login
 * (its HOME and default config dir). Everything else runs with a fresh config dir and HOME.
 */
export function hostClaudeEnv(
  configDir: string,
  isDev: boolean,
  source: NodeJS.ProcessEnv = process.env,
): Record<string, string> {
  const usesLocalLogin = isDev && !hasCredential(CLAUDE_CREDENTIALS, source)
  const isolation: Record<string, string> = usesLocalLogin
    ? { HOME: source.HOME ?? configDir }
    : { HOME: configDir, CLAUDE_CONFIG_DIR: join(configDir, '.claude') }
  return agentEnv(source, [...CLAUDE_PASS_THROUGH, ...AGENT_PROXY_ENV], {
    ...CLAUDE_FIXED_ENV,
    ...isolation,
  })
}

/** Inside the sandbox nothing of the host applies but the credential; the proxy comes from the runtime. */
export function containerClaudeEnv(
  source: NodeJS.ProcessEnv = process.env,
): Record<string, string> {
  return {
    ...pickEnv(source, CLAUDE_PASS_THROUGH),
    ...CLAUDE_FIXED_ENV,
    PATH: CONTAINER_PATH,
    HOME: CONTAINER_HOME,
    CLAUDE_CONFIG_DIR: `${CONTAINER_HOME}/.claude`,
  }
}

/** In the jail, like the container: the credential and fixed values; the runtime sets home and proxy. */
export function jailClaudeEnv(source: NodeJS.ProcessEnv = process.env): Record<string, string> {
  return { ...pickEnv(source, CLAUDE_PASS_THROUGH), ...CLAUDE_FIXED_ENV, PATH: CONTAINER_PATH }
}

/** Each runtime's view of the harness env: the worker's own HOME and proxy only on the host. */
export function claudeEnvFor(
  kind: SandboxKind,
  configDir: string,
  isDev: boolean,
): Record<string, string> {
  if (kind === 'docker') return containerClaudeEnv()
  if (kind === 'jail') return jailClaudeEnv()
  return hostClaudeEnv(configDir, isDev)
}

/** The SDK hands its spawner `string | undefined` values; only set ones cross into the container. */
export function definedEnv(env: Record<string, string | undefined>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).filter((entry): entry is [string, string] => entry[1] !== undefined),
  )
}
