import { db } from '@code-whiskers/whiskers-repository'
import { sql } from 'drizzle-orm'

const PING_TIMEOUT_MS = 2_000

export async function pingDatabase(): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), PING_TIMEOUT_MS)
  })
  return Promise.race([db.execute(sql`SELECT 1`), timeout])
    .then(() => true)
    .catch(() => false)
    .finally(() => clearTimeout(timer))
}
