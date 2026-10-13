import { COMMAND_WORDS, MEMORY_BODY_MAX, MEMORY_KIND_WORDS } from './constants'
import type { ParsedMention, RememberRequest } from './types'

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
  // Own keys only: `constructor` or `__proto__` must stay questions, not inherited "commands".
  const command = Object.hasOwn(COMMAND_WORDS, first) ? COMMAND_WORDS[first] : undefined
  return command
    ? { command, text: text.slice(first.length).trim() }
    : { command: 'question', text: text || body.trim() }
}

export function findingTitleOf(body: string): string | null {
  return FINDING_TITLE.exec(body)?.[1]?.trim() ?? null
}

/** `rule: money is integer cents` → a rule; no recognised kind word → context. */
export function parseRemember(text: string): RememberRequest | null {
  const match = /^([\w'-]+)\s*:?\s*([\s\S]*)$/.exec(text.trim())
  const word = match?.[1]?.toLowerCase() ?? ''
  const isKind = Object.hasOwn(MEMORY_KIND_WORDS, word)
  const kind = isKind ? MEMORY_KIND_WORDS[word] : 'context'
  const body = (isKind ? (match?.[2] ?? '') : text).replace(/^[:\s]+/, '').trim()
  if (!kind || body.length < 3) return null
  return { kind, body: body.slice(0, MEMORY_BODY_MAX) }
}
