import { createOpenAI } from '@ai-sdk/openai'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { REVIEW_PROVIDER_CREDENTIALS, type WhiskersConfig } from '@code-whiskers/whiskers-domain'
import { createGateway } from 'ai'
import { openrouterModel } from '../../shared/llm'
import { OPENAI_PROVIDER_OPTIONS } from './constants'
import type { SingleShotSpec } from './types'

/** The three single-shot providers differ only here: which model factory, which options. */
export function singleShotSpec(
  id: 'openrouter' | 'ai-gateway' | 'openai',
  config: WhiskersConfig = whiskersEnvConfig,
): SingleShotSpec {
  const { model } = config.review
  const credentials = REVIEW_PROVIDER_CREDENTIALS[id]
  if (id === 'openai') {
    const openai = createOpenAI({ apiKey: config.openai.apiKey })
    return {
      id,
      model,
      languageModel: () => openai(model),
      providerOptions: OPENAI_PROVIDER_OPTIONS,
      credentials,
    }
  }
  if (id === 'ai-gateway') {
    const gateway = createGateway({ apiKey: config.aiGateway.apiKey })
    return {
      id,
      model,
      languageModel: () => gateway(model),
      providerOptions: OPENAI_PROVIDER_OPTIONS,
      credentials,
    }
  }
  return {
    id,
    model,
    languageModel: () => openrouterModel(model),
    providerOptions: undefined,
    credentials,
  }
}
