import type { ChunkRetryPolicy } from './types'

/**
 * Measured on 30 production reviews: the latency distribution is bimodal — a
 * chunk either answers in tens of seconds or stalls outright. 180s nursed every
 * stall for three minutes before the single retry stalled for three more, which
 * is why 7 of 9 failures landed at ~363s. Abandon a stall fast; the caller has
 * three attempts and splits the chunk on the first timeout.
 */
export const SINGLE_SHOT_TIMEOUT_MS = 90_000

export const SINGLE_SHOT_RETRY: ChunkRetryPolicy = { maxAttempts: 3, splitsOnTimeout: true }

// Analogous to OPENROUTER_REASONING / OPENROUTER_STRUCTURED_OUTPUTS for OpenAI-served models.
export const OPENAI_PROVIDER_OPTIONS = {
  openai: { reasoningEffort: 'medium', strictJsonSchema: false },
} as const

/** Enough for the probe to prove a structured answer comes back; nothing in it is worth a finding. */
export const PROBE_DIFF = `diff --git a/greeting.ts b/greeting.ts
--- a/greeting.ts
+++ b/greeting.ts
@@ -1,3 +1,3 @@
 export function greet(name: string): string {
-  return 'Hello ' + name
+  return \`Hello \${name}\`
 }
`
