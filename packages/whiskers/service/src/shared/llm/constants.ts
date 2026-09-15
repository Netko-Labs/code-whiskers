// OpenRouter picks the fastest upstream for the model; fallbacks keep a single slow
// or rate-limited provider from stalling a review.
export const OPENROUTER_ROUTING = { sort: 'throughput', allow_fallbacks: true } as const
export const LLM_CONCURRENCY = 4
