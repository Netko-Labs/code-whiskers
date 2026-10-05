import { setting } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { eq } from 'drizzle-orm'
import { DEFAULT_INSTANCE_NAME, INSTANCE_NAME_KEY } from './constants'
import type { InstanceSettingsRecord } from './types'

export const getInstanceSettings = async (): Promise<InstanceSettingsRecord> => {
  const [row] = await db
    .select({ value: setting.value, updatedAt: setting.updatedAt })
    .from(setting)
    .where(eq(setting.key, INSTANCE_NAME_KEY))
    .limit(1)
  const name = typeof row?.value === 'string' && row.value.trim() ? row.value : null
  return { name: name ?? DEFAULT_INSTANCE_NAME, updatedAt: name ? (row?.updatedAt ?? null) : null }
}
