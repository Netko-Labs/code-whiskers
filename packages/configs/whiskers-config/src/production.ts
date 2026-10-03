import { REQUIRED_PRODUCTION_ENV } from './constants'

/** Refuses to boot a production worker missing what it cannot run without. */
export function assertProductionEnv(env: NodeJS.ProcessEnv = process.env): void {
  if (env.NODE_ENV !== 'production') return
  const missing = REQUIRED_PRODUCTION_ENV.filter((name) => !env[name])
  if (missing.length > 0) throw new Error(`production requires ${missing.join(', ')}`)
}
