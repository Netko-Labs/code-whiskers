import { useQuery } from '@tanstack/react-query'
import { alertRuleQuery } from '@/integrations/alerts-api'
import { ResponseError } from '@/integrations/observability'
import { organizationsQuery } from '@/integrations/studio-api'
import type { RuleTemplateKey } from '../../../shared/rule-copy'
import type { RuleSource } from '../types'
import { draftFromRule, draftFromTemplate } from '../utils'

/** The draft the editor starts from: the saved rule, or a template on the first installation. */
export function useRuleSource(
  ruleId: string | undefined,
  template: RuleTemplateKey | undefined,
): RuleSource {
  const rule = useQuery({ ...alertRuleQuery(ruleId ?? ''), enabled: Boolean(ruleId), retry: false })
  const orgs = useQuery({ ...organizationsQuery(), retry: false })

  if (!ruleId) {
    if (orgs.isPending) return { status: 'loading' }
    const installationId = orgs.data?.[0]?.installationId ?? null
    return {
      status: 'ready',
      initial: { ...draftFromTemplate(template), installationId },
      rule: null,
    }
  }
  if (rule.isPending) return { status: 'loading' }
  if (rule.isError) {
    return rule.error instanceof ResponseError && rule.error.status === 404
      ? { status: 'missing' }
      : { status: 'error', retry: () => void rule.refetch() }
  }
  return { status: 'ready', initial: draftFromRule(rule.data), rule: rule.data }
}
