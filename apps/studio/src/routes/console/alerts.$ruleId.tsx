import { createFileRoute } from '@tanstack/react-router'
import { RuleEditorPage } from '@/components/console'

function RuleRoute() {
  const { ruleId } = Route.useParams()
  return <RuleEditorPage key={ruleId} ruleId={ruleId} />
}

export const Route = createFileRoute('/console/alerts/$ruleId')({
  head: () => ({ meta: [{ title: 'Alert rule · CodeWhiskers' }] }),
  component: RuleRoute,
})
