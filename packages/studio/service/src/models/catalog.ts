import { createLogger } from '@code-whiskers/logger'
import {
  type CatalogModel,
  MODELS_DEV_URL,
  type REVIEWER_PROVIDERS,
} from '@code-whiskers/studio-domain'
import { CATALOG_TIMEOUT_MS, CATALOG_TTL_MS } from './constants'
import type { ModelCatalog } from './types'
import { catalogFrom } from './utils'

const logger = createLogger('studio-models')

let cached: { at: number; catalog: ModelCatalog } | null = null
let inflight: Promise<ModelCatalog | null> | null = null

async function fetchCatalog(): Promise<ModelCatalog | null> {
  try {
    const response = await fetch(MODELS_DEV_URL, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(CATALOG_TIMEOUT_MS),
    })
    if (!response.ok) throw new Error(`models.dev answered ${response.status}`)
    const catalog = catalogFrom(await response.json())
    cached = { at: Date.now(), catalog }
    return catalog
  } catch (error) {
    logger.warn({ err: String(error) }, 'models.dev unavailable; serving the last catalog')
    return cached?.catalog ?? null
  }
}

/** models.dev is ~5 MB, so studio fetches it rarely, keeps only the reviewer's providers, and shares one fetch. */
export async function getModelCatalog(
  provider: (typeof REVIEWER_PROVIDERS)[number],
): Promise<CatalogModel[]> {
  const isFresh = cached && Date.now() - cached.at < CATALOG_TTL_MS
  if (!isFresh) {
    inflight ??= fetchCatalog().finally(() => {
      inflight = null
    })
  }
  const catalog = isFresh ? cached?.catalog : await inflight
  return catalog?.[provider] ?? []
}
