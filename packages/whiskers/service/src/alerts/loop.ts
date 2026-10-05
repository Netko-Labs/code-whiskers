import { createLogger } from '@code-whiskers/logger'
import { reportError } from '@code-whiskers/observability/server'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { dropStudioCache, postToStudio, readFromStudio } from '../review/studio-client'
import { evaluateRule } from './conditions'
import { ALERT_FIRST_RUN_MS, ALERT_INTERVAL_MS } from './constants'
import type { AlertRule } from './types'

const logger = createLogger('whiskers-alerts')

/** The rule's next cursor, or null when studio missed a firing and the pass must be re-read. */
async function runRule(rule: AlertRule, now: Date): Promise<Date | null> {
  const { firings, isActive, cursor } = await evaluateRule(rule, now)
  let isComplete = true
  for (const { path, ...alert } of firings) {
    const url = new URL(path, whiskersEnvConfig.app.webBaseUrl).toString()
    isComplete =
      (await postToStudio(`alert-rules/${rule.id}/fire`, { ...alert, url })) && isComplete
  }
  if (firings.length > 0) logger.info({ rule: rule.name, count: firings.length }, 'alert fired')
  if (!isActive && rule.state === 'firing') await postToStudio(`alert-rules/${rule.id}/quiet`, {})
  return isComplete ? cursor : null
}

/**
 * Studio throttles and records each firing; this pass only reports what holds, then moves each
 * rule's cursor so event triggers resume where they stopped.
 */
export async function runAlertPass(now = new Date()): Promise<void> {
  dropStudioCache('alert-rules')
  const { value: rules } = await readFromStudio<AlertRule[]>('alert-rules', {}, [])
  const cursors = new Map<string, string[]>()
  for (const rule of rules) {
    if (!Array.isArray(rule.triggers)) continue
    try {
      const cursor = await runRule(rule, now)
      if (!cursor) continue
      const at = cursor.toISOString()
      cursors.set(at, [...(cursors.get(at) ?? []), rule.id])
    } catch (error) {
      logger.warn({ rule: rule.name, err: String(error) }, 'alert evaluation failed')
      reportError(error, { tags: { task: 'alerts' } })
    }
  }
  for (const [at, ids] of cursors) await postToStudio('alert-rules/evaluated', { ids, at })
}

/** One pass a minute, never two at once. Without an internal token there is nothing to read. */
export function startAlertLoop(): void {
  if (!whiskersEnvConfig.app.internalToken) {
    logger.info('INTERNAL_TOKEN unset — alert rules are not evaluated')
    return
  }
  let isRunning = false
  const tick = async () => {
    if (isRunning) return
    isRunning = true
    await runAlertPass().finally(() => {
      isRunning = false
    })
  }
  setTimeout(() => {
    void tick()
    setInterval(() => void tick(), ALERT_INTERVAL_MS)
  }, ALERT_FIRST_RUN_MS)
}
