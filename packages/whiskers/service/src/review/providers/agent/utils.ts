import { isAbsolute, posix, resolve, sep } from 'node:path'
import {
  type LlmReview,
  LlmReviewSchema,
  type WhiskersConfig,
} from '@code-whiskers/whiskers-domain'
import { z } from 'zod'
import { AGENT_BASE_ENV, REDACTED, SECRET_PATTERNS } from './constants'
import type { SandboxAvailability, SandboxKind } from './types'

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

/**
 * Docker when it can work: a daemon, a Linux build of the harness to mount, and a credential in
 * env (a container cannot reach the host's keychain login). `docker` insists; `host` never tries.
 */
export function chooseSandbox(
  mode: WhiskersConfig['review']['sandbox'],
  { hasDocker, hasLinuxBinary, hasCredentialEnv }: SandboxAvailability,
): SandboxKind {
  const isPossible = hasDocker && hasLinuxBinary && hasCredentialEnv
  if (mode === 'host') return 'host'
  if (mode === 'docker' && !isPossible) {
    const missing = [
      !hasDocker && 'a Docker daemon',
      !hasLinuxBinary && 'a Linux harness binary (CLAUDE_CODE_SANDBOX_EXECUTABLE)',
      !hasCredentialEnv && 'a credential in env',
    ].filter(Boolean)
    throw new Error(`REVIEW_AGENT_SANDBOX=docker needs ${missing.join(', ')}`)
  }
  return isPossible ? 'docker' : 'host'
}
