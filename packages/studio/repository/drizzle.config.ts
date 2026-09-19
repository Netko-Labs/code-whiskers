import { defineConfig } from 'drizzle-kit'

/**
 * One database, one migration journal. Studio owns it because studio runs the
 * Coolify pre-deployment command; whiskers is a worker against the same store
 * and keeps its own tables in its own domain package.
 */
export default defineConfig({
  out: './src/db/drizzle',
  schema: ['../domain/src/db/index.ts', '../../whiskers/domain/src/db/index.ts'],
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
})
