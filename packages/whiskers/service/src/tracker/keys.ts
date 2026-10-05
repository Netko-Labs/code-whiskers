import { randomBytes, timingSafeEqual } from 'node:crypto'
import type { KeyCheck, KeyDeletion } from './types'

export const newPublicKey = (): string => randomBytes(16).toString('hex')

function isSameKey(stored: string, presented: string): boolean {
  if (stored.length !== presented.length) return false
  return timingSafeEqual(Buffer.from(stored), Buffer.from(presented))
}

/** Any enabled key of the project authenticates; a disabled key is as good as an unknown one. */
export function enabledKeyMatching<T extends KeyCheck>(
  keys: readonly T[],
  presented: string | undefined,
): T | undefined {
  if (!presented) return undefined
  return keys.find((key) => key.isEnabled && isSameKey(key.publicKey, presented))
}

/** A project keeps at least one key that ingests: the last enabled one cannot be deleted. */
export function keyDeletionOf(keys: readonly KeyCheck[], keyId: string): KeyDeletion {
  const target = keys.find((key) => key.id === keyId)
  if (!target) return 'missing'
  if (!target.isEnabled) return 'allowed'
  return keys.some((key) => key.id !== keyId && key.isEnabled) ? 'allowed' : 'last-enabled'
}
