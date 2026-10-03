import { drizzle } from 'drizzle-orm/bun-sql'

export const db = drizzle(process.env.DATABASE_URL ?? '')

export const closeDb = (): Promise<void> => db.$client.close()
