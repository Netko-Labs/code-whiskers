import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { LanguageModel } from 'ai'
import {
  OPENROUTER_REASONING,
  OPENROUTER_ROUTING,
  OPENROUTER_STRUCTURED_OUTPUTS,
} from './constants'

export function openrouterModel(
  id: string,
  apiKey = whiskersEnvConfig.openrouter.apiKey,
): LanguageModel {
  return createOpenRouter({ apiKey })(id, {
    provider: OPENROUTER_ROUTING,
    reasoning: OPENROUTER_REASONING,
    structuredOutputs: OPENROUTER_STRUCTURED_OUTPUTS,
  })
}
