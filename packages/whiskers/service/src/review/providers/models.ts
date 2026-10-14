import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import {
  REVIEW_PROVIDER_CREDENTIALS,
  type ReviewProviderId,
  type WhiskersConfig,
} from '@code-whiskers/whiskers-domain'
import { createGateway, type LanguageModel } from 'ai'
import { openrouterModel } from '../../shared/llm'
import { OPENAI_PROVIDER_OPTIONS } from './constants'
import { envCredentials } from './settings'
import type { ReviewerCredentials, SingleShotSpec } from './types'

/** One plain AI SDK call per provider; Claude here is the Messages API, not the Agent SDK. */
export function languageModelOf(
  id: ReviewProviderId,
  model: string,
  config: WhiskersConfig,
  values: ReviewerCredentials,
): LanguageModel {
  if (id === 'openai') return createOpenAI({ apiKey: config.openai.apiKey })(model)
  if (id === 'ai-gateway') return createGateway({ apiKey: config.aiGateway.apiKey })(model)
  if (id === 'claude') return createAnthropic({ apiKey: values.ANTHROPIC_API_KEY ?? '' })(model)
  return openrouterModel(model, config.openrouter.apiKey)
}

/** The three single-shot providers differ only here: which model factory, which options. */
export function singleShotSpec(
  id: 'openrouter' | 'ai-gateway' | 'openai',
  config: WhiskersConfig = whiskersEnvConfig,
  values: ReviewerCredentials = envCredentials(),
): SingleShotSpec {
  const { model } = config.review
  const languageModel = languageModelOf(id, model, config, values)
  return {
    id,
    model,
    languageModel: () => languageModel,
    providerOptions: id === 'openrouter' ? undefined : OPENAI_PROVIDER_OPTIONS,
    credentials: REVIEW_PROVIDER_CREDENTIALS[id],
    values,
  }
}
