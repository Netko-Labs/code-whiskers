import { buttonVariants } from '@code-whiskers/ui/components/button'
import { Link } from '@tanstack/react-router'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import {
  EMPTY_BUCKET,
  type TriageViewProps,
  UNREACHABLE_DESCRIPTION,
  UNREACHABLE_TITLE,
  useTriageItems,
} from './lib'
import { TriageDetail } from './triage-detail'
import { TriageList } from './triage-list'

export function TriageView({ bucket, filter, selectedId }: TriageViewProps) {
  const { items, selected, unreachable, isLoading } = useTriageItems(bucket, filter, selectedId)
  const empty = EMPTY_BUCKET[bucket]

  return (
    <>
      <TriageList
        bucket={bucket}
        filter={filter}
        items={items}
        selectedId={selected?.id ?? ''}
        isLoading={isLoading}
      />
      <div className="relative flex min-w-[420px] flex-1 flex-col">
        {selected ? (
          <TriageDetail item={selected} />
        ) : unreachable ? (
          <ErrorState title={UNREACHABLE_TITLE} description={UNREACHABLE_DESCRIPTION} />
        ) : (
          !isLoading && (
            <EmptyState
              expression="sleeping"
              title={empty.title}
              description={empty.description}
              action={
                bucket === 'inbox' && (
                  <Link to="/console/projects/new" className={buttonVariants({ size: 'sm' })}>
                    Set up error tracking
                  </Link>
                )
              }
              secondary={
                bucket === 'inbox' && (
                  <Link
                    to="/console/$section"
                    params={{ section: 'repositories' }}
                    className="text-muted-foreground text-ui underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Connect a repository
                  </Link>
                )
              }
            />
          )
        )}
      </div>
    </>
  )
}
