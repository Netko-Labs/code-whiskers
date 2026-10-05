import type { AlertRule } from '@/integrations/alerts-api'
import type { Integration } from '@/integrations/studio-api'

/** Where a rule delivers today: every destination on its installation, or the ones it names. */
export function ruleDestinations(rule: AlertRule, destinations: Integration[]): Integration[] {
  return destinations.filter(
    (destination) =>
      destination.installationId === rule.installationId &&
      (rule.notifyAll || rule.destinationIds.includes(destination.id)),
  )
}
