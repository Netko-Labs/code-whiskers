import { COMMAND_WORDS } from './constants'
import type { ParsedMention } from './types'

const REGEX_SPECIALS = /[.*+?^${}()|[\]\\]/g
const FINDING_TITLE = /^\*\*[^*]+\*\*\s+—\s+(.+)$/m

/**
 * `@code-whiskers fix`, `review` and `ignore` are commands; anything else after the mention is a
 * question. Only the first word counts, so "why does this fix fail?" stays a question.
 */
export function parseMention(body: string, handle: string): ParsedMention {
  const escaped = handle.replace(REGEX_SPECIALS, '\\$&')
  const after = body.split(new RegExp(`@${escaped}\\b`, 'i'))[1] ?? ''
  const text = after.trim()
  const first =
    text
      .split(/\s+/)[0]
      ?.toLowerCase()
      .replace(/[.,:;!?]+$/, '') ?? ''
  const command = COMMAND_WORDS[first]
  return command
    ? { command, text: text.slice(first.length).trim() }
    : { command: 'question', text: text || body.trim() }
}

export function findingTitleOf(body: string): string | null {
  return FINDING_TITLE.exec(body)?.[1]?.trim() ?? null
}
