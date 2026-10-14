import type {
  REVIEWER_PROVIDERS,
  ReviewerCredentialName,
  ReviewerSettings,
} from '@code-whiskers/studio-domain'
import type { ReviewerCredentialState, ReviewerField, ReviewerTextFieldSpec } from './types'

type Provider = (typeof REVIEWER_PROVIDERS)[number]

/** The worker's default without `MENTION_PROVIDER`; studio cannot see the worker's env value. */
export const DEFAULT_MENTION_PROVIDER: Provider = 'openrouter'

export const INHERITED_SETTINGS: ReviewerSettings = {
  provider: null,
  model: null,
  verifyModel: null,
  mentionProvider: null,
  mentionModel: null,
  effort: null,
  maxTurns: null,
  maxBudgetUsd: null,
}

export const FIELD_LABEL: Record<ReviewerField, string> = {
  provider: 'Provider',
  model: 'Model',
  verifyModel: 'Checker model',
  mentionProvider: 'Mention provider',
  mentionModel: 'Mention model',
  effort: 'Effort',
  maxTurns: 'Max turns',
  maxBudgetUsd: 'Max budget',
}

export const PROVIDER_LABEL: Record<Provider, string> = {
  openrouter: 'OpenRouter',
  'ai-gateway': 'Vercel AI Gateway',
  openai: 'OpenAI',
  claude: 'Claude Agent SDK',
}

export const MODEL_FIELDS: ReviewerTextFieldSpec[] = [
  {
    field: 'model',
    label: 'Model',
    description: 'Raises the findings',
    placeholder: 'Provider default',
    inputMode: 'text',
    catalog: 'review',
  },
  {
    field: 'verifyModel',
    label: 'Checker model',
    description: 'Re-reads each finding before it posts; Claude reviews only',
    placeholder: 'claude-sonnet-5-5',
    inputMode: 'text',
    catalog: 'claude',
    offLabel: 'Off: findings post unchecked',
  },
]

export const MENTION_MODEL_FIELD: ReviewerTextFieldSpec = {
  field: 'mentionModel',
  label: 'Mention model',
  description: 'Empty follows the review model on the same provider, else the provider default',
  placeholder: 'Provider default',
  inputMode: 'text',
  catalog: 'mention',
}

export const LIMIT_FIELDS: ReviewerTextFieldSpec[] = [
  {
    field: 'maxTurns',
    label: 'Max turns',
    description: 'Tool calls an agent run may take before it must answer',
    placeholder: '40',
    inputMode: 'numeric',
  },
  {
    field: 'maxBudgetUsd',
    label: 'Max budget (USD)',
    description: 'Per agent run; the run fails rather than overspend',
    placeholder: 'No cap',
    inputMode: 'decimal',
  },
]

export const CREDENTIAL_LABEL: Record<ReviewerCredentialName, string> = {
  OPENROUTER_API_KEY: 'OpenRouter',
  AI_GATEWAY_API_KEY: 'Vercel AI Gateway',
  OPENAI_API_KEY: 'OpenAI',
  ANTHROPIC_API_KEY: 'Anthropic',
}

export const CREDENTIAL_USE: Record<ReviewerCredentialName, string> = {
  OPENROUTER_API_KEY: 'Reviews and @mention replies on OpenRouter',
  AI_GATEWAY_API_KEY: 'Reviews and @mention replies through the AI Gateway',
  OPENAI_API_KEY: 'Reviews and @mention replies straight on OpenAI',
  ANTHROPIC_API_KEY: 'Claude reviews, the finding checker and @mention replies',
}

export const CREDENTIAL_BADGE: Record<
  ReviewerCredentialState,
  { label: string; tone: 'resolved' | 'neutral' | 'warning' }
> = {
  stored: { label: 'Stored', tone: 'resolved' },
  env: { label: 'From env', tone: 'neutral' },
  needed: { label: 'Needed', tone: 'warning' },
  unset: { label: 'Not set', tone: 'neutral' },
}

export const CREDENTIAL_PROVIDERS: Record<ReviewerCredentialName, readonly Provider[]> = {
  OPENROUTER_API_KEY: ['openrouter'],
  AI_GATEWAY_API_KEY: ['ai-gateway'],
  OPENAI_API_KEY: ['openai'],
  ANTHROPIC_API_KEY: ['claude'],
}
