import { studioEnvConfig } from '@code-whiskers/studio-config'
import { account, jwks, session, user, verification } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { jwt, lastLoginMethod } from 'better-auth/plugins'

/**
 * GitHub only. The sync needs a GitHub token to read installations, so an
 * account that arrived another way could sign in and see nothing.
 */
export const auth = betterAuth({
  appName: 'Studio',
  baseURL: studioEnvConfig.app.baseUrl,
  basePath: '/api/auth',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      session,
      account,
      verification,
      jwks,
    },
  }),
  advanced: {
    cookiePrefix: 'studio',
  },
  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'github', 'discord'],
    },
  },
  plugins: [
    jwt({
      jwt: {
        expirationTime: '1d',
      },
    }),
    lastLoginMethod(),
  ],
  ...studioEnvConfig.auth,
})
