import { createFileRoute } from '@tanstack/react-router'
import { IssuePage } from '@/components/console'

function IssueRoute() {
  const { issueId } = Route.useParams()
  return <IssuePage issueId={issueId} />
}

export const Route = createFileRoute('/console/issues/$issueId')({
  component: IssueRoute,
})
