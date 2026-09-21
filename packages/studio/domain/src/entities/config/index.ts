import { z } from 'zod'

const _protoSocialProviderSchema = z.object({
  enabled: z.boolean(),
  clientId: z.string(),
  clientSecret: z.string(),
})

const transformSocialProviderSchema = (data: z.infer<typeof _protoSocialProviderSchema>) => {
  if (!data.clientId || !data.clientSecret) {
    return undefined
  }
  return data
}

const _protoStudioConfigSchema = z.object({
  app: z.object({
    dev: z.boolean().default(false),
    port: z.number().default(3000),
    cors: z.array(z.string()).default(['https://studio.localhost', 'http://localhost:3000']),
    baseUrl: z.string().url(),
    sentryDsn: z.string().optional(),
    encryptionKey: z.string(),
  }),
  cache: z.object({
    url: z.string(),
  }),
  db: z.object({
    url: z.string(),
  }),
  whiskers: z.object({
    url: z.string().url(),
    internalToken: z.string().default(''),
  }),
  auth: z.object({
    secret: z.string().optional(),
    emailAndPassword: z.object({
      enabled: z.boolean(),
    }),
    trustedOrigins: z
      .array(z.string())
      .default(['https://studio.localhost', 'http://localhost:3000']),
    socialProviders: z.object({
      github: _protoSocialProviderSchema.transform(transformSocialProviderSchema).optional(),
      google: _protoSocialProviderSchema.transform(transformSocialProviderSchema).optional(),
      discord: _protoSocialProviderSchema.transform(transformSocialProviderSchema).optional(),
    }),
  }),
})

// Magic link is always mounted, so social providers are optional extras
export const StudioConfigSchema = _protoStudioConfigSchema
export type StudioConfig = z.infer<typeof StudioConfigSchema>
