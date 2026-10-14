import { type ReviewerSettings, ReviewerSettingsSchema } from '@code-whiskers/studio-domain'
import type { InstanceReviewer, ReviewerCredentialPresence } from '@/integrations/studio-api'
import type { ReviewerCredentialState, ReviewerDraft } from './types'
import { CREDENTIAL_PROVIDERS, FIELD_LABEL, INHERITED_SETTINGS } from './values'

export function draftFrom(settings: ReviewerSettings = INHERITED_SETTINGS): ReviewerDraft {
  return {
    provider: settings.provider ?? '',
    model: settings.model ?? '',
    verifyModel: settings.verifyModel ?? '',
    mentionModel: settings.mentionModel ?? '',
    effort: settings.effort ?? '',
    maxTurns: settings.maxTurns?.toString() ?? '',
    maxBudgetUsd: settings.maxBudgetUsd?.toString() ?? '',
  }
}

const orNull = (value: string): string | null => value.trim() || null
const numberOrNull = (value: string): number | null => (value.trim() ? Number(value) : null)

/** The draft as studio takes it, or the first field it would refuse. */
export function parseDraft(
  draft: ReviewerDraft,
): { settings: ReviewerSettings; error: null } | { settings: null; error: string } {
  const parsed = ReviewerSettingsSchema.safeParse({
    provider: orNull(draft.provider),
    model: orNull(draft.model),
    verifyModel: orNull(draft.verifyModel),
    mentionModel: orNull(draft.mentionModel),
    effort: orNull(draft.effort),
    maxTurns: numberOrNull(draft.maxTurns),
    maxBudgetUsd: numberOrNull(draft.maxBudgetUsd),
  })
  if (parsed.success) return { settings: parsed.data, error: null }
  const issue = parsed.error.issues[0]
  const field = issue?.path[0]
  const label =
    typeof field === 'string' && field in FIELD_LABEL
      ? FIELD_LABEL[field as keyof ReviewerDraft]
      : 'Settings'
  return { settings: null, error: `${label}: ${issue?.message ?? 'invalid'}` }
}

export function credentialState(
  credential: ReviewerCredentialPresence,
  reviewer: InstanceReviewer | undefined,
): ReviewerCredentialState {
  if (credential.isSet) return 'stored'
  const onWorker = reviewer?.credentials.find((held) => held.name === credential.name)
  if (onWorker?.isSet) return 'env'
  const isUsed =
    reviewer && CREDENTIAL_PROVIDERS[credential.name].some((p) => p === reviewer.provider)
  return isUsed ? 'needed' : 'unset'
}
