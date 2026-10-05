import { createFileRoute } from '@tanstack/react-router'
import { parseRuleEditorSearch, RuleEditorPage } from '@/components/console'

function NewRuleRoute() {
  const { template } = Route.useSearch()
  return <RuleEditorPage template={template} />
}

export const Route = createFileRoute('/console/alerts/new')({
  head: () => ({ meta: [{ title: 'New alert rule · CodeWhiskers' }] }),
  validateSearch: parseRuleEditorSearch,
  component: NewRuleRoute,
})
