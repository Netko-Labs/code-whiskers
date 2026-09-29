import type { ReactionCommand, ReactionContent } from './types'

export const REACTION_COMMANDS: Record<ReactionContent, ReactionCommand> = {
  '-1': 'ignore',
  rocket: 'fix',
  confused: 'explain',
}

// GitHub sends no webhook for reactions; a minute is quick enough to feel like a button.
export const SCAN_INTERVAL_MS = 60_000
export const FIRST_SCAN_DELAY_MS = 20_000
export const ACTIVE_WINDOW_MS = 3 * 24 * 60 * 60 * 1000
export const PERMISSION_TTL_MS = 10 * 60 * 1000
export const TRUSTED_PERMISSIONS = new Set(['admin', 'maintain', 'write'])
export const EXPLAIN_PROMPT =
  'Explain why this finding holds, citing the code — or say plainly that it does not.'
export const MAX_ATTEMPTS = 3
export const REACTION_EMOJI: Record<ReactionContent, string> = {
  '-1': '👎',
  rocket: '🚀',
  confused: '😕',
}
