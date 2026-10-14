import {
  type CatalogModel,
  MODELS_DEV_PROVIDER,
  type ModelsDevModel,
  ModelsDevModelSchema,
  REVIEWER_PROVIDERS,
} from '@code-whiskers/studio-domain'
import type { ModelCatalog } from './types'

function tierOf(cost: ModelsDevModel['cost']): CatalogModel['tier'] {
  const tier = cost.tiers?.find((entry) => entry.tier.type === 'context')
  if (tier) {
    return {
      contextOver: tier.tier.size,
      inputCost: tier.input ?? null,
      outputCost: tier.output ?? null,
    }
  }
  const over = cost.context_over_200k
  return over
    ? { contextOver: 200_000, inputCost: over.input ?? null, outputCost: over.output ?? null }
    : null
}

export function toCatalogModel(model: ModelsDevModel): CatalogModel {
  return {
    id: model.id,
    name: model.name || model.id,
    releaseDate: model.release_date ?? null,
    context: model.limit.context ?? null,
    inputCost: model.cost.input ?? null,
    outputCost: model.cost.output ?? null,
    tier: tierOf(model.cost),
    isReasoning: model.reasoning,
    hasTools: model.tool_call,
    isDeprecated: model.status === 'deprecated',
  }
}

/** Newest first, deprecated last. */
function byRecency(a: CatalogModel, b: CatalogModel): number {
  if (a.isDeprecated !== b.isDeprecated) return a.isDeprecated ? 1 : -1
  return (b.releaseDate ?? '').localeCompare(a.releaseDate ?? '')
}

function modelsOf(body: unknown, source: string): CatalogModel[] {
  const provider = (body as Record<string, { models?: unknown } | undefined> | null)?.[source]
  const models = provider?.models
  if (!models || typeof models !== 'object') return []
  return Object.values(models)
    .flatMap((entry) => {
      const parsed = ModelsDevModelSchema.safeParse(entry)
      return parsed.success ? [toCatalogModel(parsed.data)] : []
    })
    .sort(byRecency)
}

/** Tool calling marks the chat models: it drops audio, embedding and utility entries, and the agent needs it. */
export function catalogFrom(body: unknown): ModelCatalog {
  const entries = REVIEWER_PROVIDERS.map((provider) => {
    const models = modelsOf(body, MODELS_DEV_PROVIDER[provider]).filter((model) => model.hasTools)
    return [provider, models] as const
  })
  return Object.fromEntries(entries) as ModelCatalog
}
