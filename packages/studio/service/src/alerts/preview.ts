import {
  type AlertPreview,
  type AlertPreviewResult,
  organization,
} from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { eq } from 'drizzle-orm'
import { isInstallationMember } from '../queries/github'
import { previewInWhiskers } from '../whiskers'

/** How often a draft would have fired over the last week; whiskers counts its own data. */
export const previewAlertRule = async (
  userId: string,
  draft: AlertPreview,
): Promise<AlertPreviewResult | 'forbidden' | 'unavailable'> => {
  if (!(await isInstallationMember(userId, draft.installationId))) return 'forbidden'
  const [org] = await db
    .select({ login: organization.login })
    .from(organization)
    .where(eq(organization.installationId, draft.installationId))
    .limit(1)
  if (!org) return 'forbidden'
  const result = await previewInWhiskers({
    triggers: draft.triggers,
    projectIds: draft.projectIds,
    environment: draft.environment,
    minLevel: draft.minLevel,
    release: draft.release,
    threshold: draft.threshold,
    windowMinutes: draft.windowMinutes,
    actionIntervalMinutes: draft.actionIntervalMinutes,
    owner: org.login.toLowerCase(),
  })
  return result ?? 'unavailable'
}
