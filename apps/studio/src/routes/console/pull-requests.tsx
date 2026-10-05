import { createFileRoute } from '@tanstack/react-router'
import { PullRequestsPage, parsePullRequestSearch } from '@/components/console/code-review'

function PullRequestsRoute() {
  return <PullRequestsPage search={Route.useSearch()} />
}

export const Route = createFileRoute('/console/pull-requests')({
  validateSearch: parsePullRequestSearch,
  component: PullRequestsRoute,
})
