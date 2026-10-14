import type {
  REVIEWER_PROVIDERS,
  ReviewerCredentialName,
  ReviewerSettings,
} from '@code-whiskers/studio-domain'
import type { ReviewerCredentialState, ReviewerField, ReviewerTextFieldSpec } from './types'

type Provider = (typeof REVIEWER_PROVIDERS)[number]

export const INHERITED_SETTINGS: ReviewerSettings = {
  provider: null,
  model: null,
  verifyModel: null,
  mentionModel: null,
  effort: null,
  maxTurns: null,
  maxBudgetUsd: null,
}

export const FIELD_LABEL: Record<ReviewerField, string> = {
  provider: 'Provider',
  model: 'Model',
  verifyModel: 'Checker model',
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
    description: 'Re-reads each finding before it posts; Claude only, "off" skips it',
    placeholder: 'claude-sonnet-5-5',
    inputMode: 'text',
    catalog: 'claude',
  },
  {
    field: 'mentionModel',
    label: 'Mention model',
    description: 'Answers @code-whiskers mentions and fix requests, always through OpenRouter',
    placeholder: 'Follows the review model on OpenRouter',
    inputMode: 'text',
    catalog: 'openrouter',
  },
]

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
  CLAUDE_CODE_OAUTH_TOKEN: 'Claude subscription token',
}

export const CREDENTIAL_USE: Record<ReviewerCredentialName, string> = {
  OPENROUTER_API_KEY: 'Reviews on OpenRouter, and every @mention reply',
  AI_GATEWAY_API_KEY: 'Reviews through the AI Gateway',
  OPENAI_API_KEY: 'Reviews straight on OpenAI',
  ANTHROPIC_API_KEY: 'Claude reviews, billed per token',
  CLAUDE_CODE_OAUTH_TOKEN: 'Claude reviews on a subscription; from `claude setup-token`',
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
  CLAUDE_CODE_OAUTH_TOKEN: ['claude'],
}
