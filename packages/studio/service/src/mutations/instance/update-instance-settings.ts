import { type InstanceSettings, setting } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { INSTANCE_NAME_KEY, type InstanceSettingsRecord } from '../../queries/instance'

export const updateInstanceSettings = async (
  userId: string,
  input: InstanceSettings,
): Promise<InstanceSettingsRecord> => {
  const updatedAt = new Date()
  await db
    .insert(setting)
    .values({ key: INSTANCE_NAME_KEY, value: input.name, updatedBy: userId, updatedAt })
    .onConflictDoUpdate({
      target: setting.key,
      set: { value: input.name, updatedBy: userId, updatedAt },
    })
  return { name: input.name, updatedAt }
}
