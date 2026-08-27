import { z } from 'zod'

/**
 * Loose mirror of the Sentry event payload — SDKs vary wildly, so unknown keys
 * pass through into `payload` and only the fields we index are typed.
 */
export const SentryExceptionSchema = z.looseObject({
  type: z.string().optional(),
  value: z.string().optional(),
})

export const SentryEventSchema = z.looseObject({
  event_id: z.string().optional(),
  level: z.string().optional(),
  message: z.union([z.string(), z.looseObject({ formatted: z.string().optional() })]).optional(),
  logentry: z.looseObject({ message: z.string().optional() }).optional(),
  exception: z
    .union([
      z.looseObject({ values: z.array(SentryExceptionSchema).optional() }),
      z.array(SentryExceptionSchema),
    ])
    .optional(),
  environment: z.string().optional(),
  release: z.string().optional(),
  fingerprint: z.array(z.string()).optional(),
})
export type SentryEvent = z.infer<typeof SentryEventSchema>

export const EnvelopeItemHeaderSchema = z.looseObject({
  type: z.string(),
  length: z.number().optional(),
})
export type EnvelopeItemHeader = z.infer<typeof EnvelopeItemHeaderSchema>
