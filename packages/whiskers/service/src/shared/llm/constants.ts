// OpenRouter picks the fastest upstream for the model; fallbacks keep a single slow
// or rate-limited provider from stalling a review.
export const OPENROUTER_ROUTING = { sort: 'throughput', allow_fallbacks: true } as const
// Raised alongside the smaller chunk size so wall-clock stays flat with ~1.7x
// more chunks. First thing to lower again if 429s start appearing.
export const LLM_CONCURRENCY = 6
// Reasoning tokens bill as output but never reach the review; exclude keeps them off the wire.
export const OPENROUTER_REASONING = { effort: 'medium', exclude: true } as const
// OpenAI strict mode demands every property in `required`; the review schema defaults the
// fields cheap models drop, so strict rejects it outright with a 400 on every call.
export const OPENROUTER_STRUCTURED_OUTPUTS = { strict: false } as const
