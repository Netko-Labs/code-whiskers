import { join } from 'node:path'
import { AGENT_PROXY_ENV, agentEnv } from '../agent'
import { hasCredential } from '../credentials'
import { CLAUDE_CREDENTIALS, CLAUDE_FIXED_ENV, CLAUDE_PASS_THROUGH } from './constants'

/**
 * Without a credential in env, a development worker borrows the operator's own Claude Code login
 * (its HOME and default config dir). Everything else runs with a fresh config dir and HOME.
 */
export function claudeEnv(
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
