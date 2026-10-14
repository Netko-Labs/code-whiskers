import type { CatalogModel, REVIEWER_PROVIDERS } from '@code-whiskers/studio-domain'

export type ModelCatalog = Record<(typeof REVIEWER_PROVIDERS)[number], CatalogModel[]>
