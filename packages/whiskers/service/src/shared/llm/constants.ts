// OpenRouter picks the fastest upstream for the model; fallbacks keep a single slow
// or rate-limited provider from stalling a review.
export const OPENROUTER_ROUTING = { sort: 'throughput', allow_fallbacks: true } as const
// Raised alongside the smaller chunk size so wall-clock stays flat with ~1.7x
// more chunks. First thing to lower again if 429s start appearing.
export const LLM_CONCURRENCY = 6
