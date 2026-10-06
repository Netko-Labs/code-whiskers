import { realpath } from 'node:fs/promises'
import { isAbsolute, join, posix, resolve, sep } from 'node:path'
import { type LlmReview, LlmReviewSchema } from '@code-whiskers/whiskers-domain'
import { z } from 'zod'
import { AGENT_BASE_ENV, REDACTED, SECRET_PATTERNS } from './constants'
import type { CheckoutDir, OutputTail } from './types'

/**
 * A fresh env from names: the base a process needs, the credentials it is allowed, and fixed
 * values. Everything else the worker holds stays out.
 */
export function agentEnv(
  source: NodeJS.ProcessEnv,
  passThrough: readonly string[],
  fixed: Record<string, string>,
): Record<string, string> {
  return { ...pickEnv(source, [...AGENT_BASE_ENV, ...passThrough]), ...fixed }
}

/** Only the named variables, for a process that must not see the rest. */
export function pickEnv(
  source: NodeJS.ProcessEnv,
  names: readonly string[],
): Record<string, string> {
  const env: Record<string, string> = {}
  for (const name of names) {
    const value = source[name]
    if (value) env[name] = value
  }
  return env
}

/** `target` resolved against `root` stays at or under `root`, by path alone. */
export function isWithin(
  root: string,
  target: string,
  flavour: 'host' | 'posix' = 'host',
): boolean {
  const resolved = flavour === 'posix' ? posix.resolve(root, target) : resolve(root, target)
  const separator = flavour === 'posix' ? '/' : sep
  return resolved === root || resolved.startsWith(root + separator)
}

/** A glob that could climb out of the search root: absolute, home-relative or with a `..` segment. */
export function isEscapingPattern(pattern: string): boolean {
  return isAbsolute(pattern) || pattern.startsWith('~') || pattern.split(/[\\/]/).includes('..')
}

let schema: Record<string, unknown> | undefined

/** The review contract as JSON Schema, for harnesses that enforce structured output themselves. */
export function reviewJsonSchema(): Record<string, unknown> {
  schema ??= z.toJSONSchema(LlmReviewSchema, { target: 'draft-7' }) as Record<string, unknown>
  return schema
}

function redact(text: string): string {
  return SECRET_PATTERNS.reduce((out, pattern) => out.replace(pattern, REDACTED), text)
}

/** Findings are posted publicly; a token an injected instruction coaxed out never is. */
export function redactSecrets(review: LlmReview): LlmReview {
  return {
    ...review,
    summary: redact(review.summary),
    findings: review.findings.map((finding) => ({
      ...finding,
      title: redact(finding.title),
      body: redact(finding.body),
      evidence: redact(finding.evidence),
      suggestion: finding.suggestion === null ? null : redact(finding.suggestion),
    })),
  }
}

/** The read-only guard's check: the path, symlinks resolved, stays inside the checkout. */
export function isInsideCheckout(checkout: CheckoutDir): (path: string) => Promise<boolean> {
  return async (path) => {
    const absolute = isAbsolute(path) ? path : join(checkout.root, path)
    const resolved = await realpath(absolute).catch(() => null)
    return resolved !== null && isWithin(checkout.root, resolved)
  }
}

/** The last `limit` characters written, for an error message that says why a process died. */
export function createTail(limit: number): OutputTail {
  let buffer = ''
  return {
    push: (text) => {
      buffer = (buffer + text).slice(-limit)
    },
    text: () => buffer.trim(),
  }
}
