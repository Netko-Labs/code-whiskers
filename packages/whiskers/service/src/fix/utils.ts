import type { LlmFix } from '@code-whiskers/whiskers-domain'
import { PROTECTED_PATH_PATTERNS, REQUEST_BODY_LIMIT } from './constants'

const REGEX_SPECIALS = /[.*+?^${}()|[\]\\]/g

/**
 * True when `body` @-mentions the bot handle. The left lookbehind rejects
 * email addresses (`me@code-whiskers.io`); excluding `/` on the right rejects
 * npm-scope references (`@code-whiskers/logger`).
 */
export function isBotMention(body: string, handle: string): boolean {
  const escaped = handle.replace(REGEX_SPECIALS, '\\$&')
  return new RegExp(`(?<![\\w.@-])@${escaped}(?![\\w/-])`, 'i').test(body)
}

/** True for paths that never get a one-click suggestion (CI entrypoints, manifests, lockfiles). */
export function isProtectedPath(path: string): boolean {
  return PROTECTED_PATH_PATTERNS.some((pattern) => pattern.test(path))
}

/** Comment bodies feed LLM prompts; bound them so one paste can't blow the context. */
export function clampBody(body: string): string {
  return body.slice(0, REQUEST_BODY_LIMIT)
}

/**
 * True when `login` is the bot's own account — tolerant of the handle being
 * configured with or without the `[bot]` suffix and of case differences, so
 * the self-review skip can't silently no-op on a config-form mismatch.
 */
export function isBotLogin(login: string | null | undefined, handle: string): boolean {
  if (!login) return false
  const slug = handle.replace(/\[bot\]$/i, '').toLowerCase()
  // a misconfigured empty handle must never match anything
  if (!slug) return false
  const normalized = login.toLowerCase()
  return normalized === slug || normalized === `${slug}[bot]`
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
