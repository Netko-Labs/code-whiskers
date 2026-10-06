import type { ReviewerStatus } from '@code-whiskers/whiskers-domain'

/** Presence only: the value is never read past a truthiness check, never logged, never returned. */
export function credentialPresence(
  names: readonly string[],
  env: NodeJS.ProcessEnv = process.env,
): ReviewerStatus['credentials'] {
  return names.map((name) => ({ name, isSet: Boolean(env[name]) }))
}

export function hasCredential(
  names: readonly string[],
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return names.some((name) => Boolean(env[name]))
}
