import {
  REVIEWER_PROVIDERS,
  type ReviewerSettings,
  ReviewerSettingsSchema,
} from '@code-whiskers/studio-domain'
import type {
  CatalogModel,
  InstanceReviewer,
  ReviewerCredentialPresence,
  ReviewerProvider,
} from '@/integrations/studio-api'
import type { ReviewerCredentialState, ReviewerDraft, ReviewerTextFieldSpec } from './types'
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

export function asProvider(value: string | undefined): ReviewerProvider | null {
  return REVIEWER_PROVIDERS.find((provider) => provider === value) ?? null
}

export function catalogProviderOf(
  spec: ReviewerTextFieldSpec,
  activeProvider: ReviewerProvider | null,
): ReviewerProvider | null {
  if (!spec.catalog) return null
  return spec.catalog === 'review' ? activeProvider : spec.catalog
}

export function matchesModel(model: CatalogModel, query: string): boolean {
  const needle = query.trim().toLowerCase()
  return !needle || `${model.id} ${model.name}`.toLowerCase().includes(needle)
}

function formatTokens(count: number): string {
  return count >= 1_000_000 ? `${count / 1_000_000}M` : `${Math.round(count / 1000)}k`
}

function formatPrice(input: number | null, output: number | null): string | null {
  if (input === null || output === null) return null
  return `$${input} / $${output}`
}

/** Context, then USD per million tokens in / out, then the dearer rate past a context size. */
export function modelSummary(model: CatalogModel): string {
  const price = formatPrice(model.inputCost, model.outputCost)
  const tier = model.tier && formatPrice(model.tier.inputCost, model.tier.outputCost)
  return [
    model.context && `${formatTokens(model.context)} context`,
    price && `${price} per M`,
    model.tier && tier && `${tier} past ${formatTokens(model.tier.contextOver)}`,
    model.isDeprecated && 'deprecated',
  ]
    .filter(Boolean)
    .join(' · ')
}
