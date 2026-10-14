import { join } from 'node:path'
import { AGENT_PROXY_ENV, agentEnv } from '../agent'
import { CLAUDE_FIXED_ENV, CLAUDE_PASS_THROUGH } from './constants'

/** A fresh config dir and HOME every run: API keys only, never a machine's Claude Code login. */
export function claudeEnv(
  configDir: string,
  source: NodeJS.ProcessEnv = process.env,
): Record<string, string> {
  return agentEnv(source, [...CLAUDE_PASS_THROUGH, ...AGENT_PROXY_ENV], {
    ...CLAUDE_FIXED_ENV,
    HOME: configDir,
    CLAUDE_CONFIG_DIR: join(configDir, '.claude'),
  })
}
