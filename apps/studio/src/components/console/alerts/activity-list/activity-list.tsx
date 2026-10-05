import { buttonVariants } from '@code-whiskers/ui/components/button'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { DataListSkeleton } from '@/components/shared/data-list'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import { alertFiringsQuery } from '@/integrations/alerts-api'
import { FiringList } from '../shared/firing-list'

/** Every firing across the caller's installations, newest first, each linked to its subject. */
export function ActivityList() {
  const firings = useQuery({ ...alertFiringsQuery(), retry: false })

  if (firings.isPending) return <DataListSkeleton rows={6} density="auto" />
  if (firings.isError) return <ErrorState onRetry={() => void firings.refetch()} />
  if (firings.data.length === 0) {
    return (
      <EmptyState
        expression="sleeping"
        title="Nothing has fired"
        description="Each alert lands here with where it went and whether it arrived."
        action={
          <Link to="/console/alerts" className={buttonVariants({ size: 'sm', variant: 'outline' })}>
            Review rules
          </Link>
        }
      />
    )
  }

  return (
    <div className="flex flex-col">
      <FiringList firings={firings.data} isRuleShown />
      <p className="m-0 px-gutter py-4 text-2xs text-faint">
        The last {firings.data.length} firings · kept for 90 days · throttled repeats are not listed
      </p>
    </div>
  )
}
