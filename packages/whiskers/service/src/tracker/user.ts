import { createHash } from 'node:crypto'
import { type SentryEvent, SentryUserSchema } from '@code-whiskers/whiskers-domain'
import { AUTO_IP_ADDRESS } from './constants'

function present(value: string | number | null | undefined): string | undefined {
  if (value === null || value === undefined) return undefined
  const text = String(value)
  return text === '' ? undefined : text
}

/**
 * Who hit the error, hashed so the database counts people without holding who they are. The
 * 0006 migration backfills with the same rule in SQL — change both together.
 */
export function userKeyOf(event: SentryEvent): string | null {
  const parsed = SentryUserSchema.safeParse(event.user)
  if (!parsed.success) return null
  const { id, email, ip_address: ip } = parsed.data
  const raw = present(id) ?? present(email) ?? (ip === AUTO_IP_ADDRESS ? undefined : present(ip))
  return raw ? createHash('sha256').update(raw).digest('hex') : null
}
