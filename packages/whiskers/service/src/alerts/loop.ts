import { createLogger } from '@code-whiskers/logger'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { dropStudioCache, postToStudio, readFromStudio } from '../review/studio-client'
import { evaluateRule, isCoolingDown } from './conditions'
import { ALERT_FIRST_RUN_MS, ALERT_INTERVAL_MS } from './constants'
import type { AlertRule } from './types'

const logger = createLogger('whiskers-alerts')

export async function runAlertPass(now = new Date()): Promise<void> {
  dropStudioCache('alert-rules')
  const { value: rules } = await readFromStudio<AlertRule[]>('alert-rules', {}, [])
  for (const rule of rules) {
    try {
      const verdict = await evaluateRule(rule, now)
      if (verdict.isFiring && !isCoolingDown(rule, now)) {
        const url = new URL(verdict.path, whiskersEnvConfig.app.webBaseUrl).toString()
        await postToStudio(`alert-rules/${rule.id}/fire`, { ...verdict, url })
        logger.info({ rule: rule.name, title: verdict.title }, 'alert fired')
      } else if (!verdict.isFiring && rule.state === 'firing') {
        await postToStudio(`alert-rules/${rule.id}/quiet`, {})
      }
    } catch (error) {
      logger.warn({ rule: rule.name, err: String(error) }, 'alert evaluation failed')
    }
  }
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
