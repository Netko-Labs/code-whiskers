import * as fs from 'node:fs'
import { migrate } from 'drizzle-orm/bun-sql/migrator'
import { db } from './client'

/**
 * Source tree, the app bundle, and the standalone migrate bundle each sit a
 * different distance from the drizzle folder; `import.meta.dir` moves with the
 * file, so the candidates cover all three rather than guessing one layout.
 */
const CANDIDATE_FOLDERS = [`${import.meta.dir}/drizzle`, `${import.meta.dir}/migrate/drizzle`]

export function migrationsFolder(): string {
  const configured = process.env.MIGRATIONS_DIR
  if (configured) return configured

  const found = CANDIDATE_FOLDERS.find((folder) => fs.existsSync(folder))
  if (!found) {
    throw new Error(`no drizzle folder found — looked in ${CANDIDATE_FOLDERS.join(', ')}`)
  }
  return found
}

export async function runMigrations(): Promise<void> {
  await migrate(db, { migrationsFolder: migrationsFolder() })
}
