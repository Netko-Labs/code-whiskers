import type {
  LlmReview,
  ReviewerStatus,
  ReviewProviderId,
  WhiskersConfig,
} from '@code-whiskers/whiskers-domain'
import type { generateObject, LanguageModel } from 'ai'
import type { TokenTally } from '../../shared/llm'

export type ReviewConfig = WhiskersConfig['review']

/** The commit a review reads; an agentic provider checks it out, a single-shot one ignores it. */
export type ReviewCommit = {
  owner: string
  repo: string
  headSha: string
}

/** How a failed chunk is retried: an agent run is too slow to retry three times or to halve. */
export type ChunkRetryPolicy = {
  maxAttempts: number
  splitsOnTimeout: boolean
}

/** One review's provider state (a checkout, a sandbox), released by `close`; answers are ungrounded. */
export interface ReviewSession {
  retry: ChunkRetryPolicy
  review(diff: string, context: string, tokens: TokenTally): Promise<LlmReview>
  close(): Promise<void>
}

export interface ReviewProvider {
  id: ReviewProviderId
  model: string
  isAgentic: boolean
  chunkChars: number | undefined
  concurrency: number | undefined
  open(target: ReviewCommit): Promise<ReviewSession>
  probe(tokens: TokenTally): Promise<LlmReview>
  status(): Promise<ReviewerStatus>
}

export type ProviderFailureKind = 'transient' | 'permanent'

export type ProviderFailureOptions = {
  kind: ProviderFailureKind
  retryAtMs?: number
  cause?: unknown
}

export type ProviderOptions = NonNullable<Parameters<typeof generateObject>[0]['providerOptions']>

export type SingleShotSpec = {
  id: ReviewProviderId
  model: string
  languageModel: () => LanguageModel
  providerOptions: ProviderOptions | undefined
  credentials: readonly string[]
}
