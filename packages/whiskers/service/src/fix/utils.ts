import type { LlmFix } from '@code-whiskers/whiskers-domain'

const REGEX_SPECIALS = /[.*+?^${}()|[\]\\]/g

/** True when `body` @-mentions the bot handle (word-bounded, case-insensitive). */
export function isBotMention(body: string, handle: string): boolean {
  const escaped = handle.replace(REGEX_SPECIALS, '\\$&')
  return new RegExp(`@${escaped}(?![\\w-])`, 'i').test(body)
}

/** 1-indexed numbered window around [start, end] the model can anchor a fix to. */
export function numberedExcerpt(source: string, start: number, end: number, context = 30): string {
  const lines = source.split('\n')
  const from = Math.max(1, start - context)
  const to = Math.min(lines.length, end + context)
  return lines
    .slice(from - 1, to)
    .map((line, i) => `${from + i}: ${line}`)
    .join('\n')
}

/** Explanation plus, when the fix carries one, a committable ```suggestion block. */
export function buildFixReply(fix: LlmFix): string {
  if (!fix.suggestion) return fix.explanation
  return `${fix.explanation}\n\n\`\`\`suggestion\n${fix.suggestion.replace(/\n+$/, '')}\n\`\`\``
}
