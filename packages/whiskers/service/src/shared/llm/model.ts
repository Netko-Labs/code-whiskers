import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { LanguageModel } from 'ai'
import { OPENROUTER_ROUTING } from './constants'

const openrouter = createOpenRouter({ apiKey: whiskersEnvConfig.openrouter.apiKey })

export function openrouterModel(id = whiskersEnvConfig.openrouter.model): LanguageModel {
  return openrouter(id, { provider: OPENROUTER_ROUTING })
}
