import { buttonVariants } from '@code-whiskers/ui/components/button'
import { Link } from '@tanstack/react-router'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import {
  EMPTY_BUCKET,
  NO_MATCHES,
  type TriageListEmptyProps,
  UNREACHABLE_DESCRIPTION,
  UNREACHABLE_TITLE,
} from '../lib'

const QUIET_LINK =
  'focus-ring rounded-sm text-muted-foreground text-ui underline-offset-4 hover:text-foreground hover:underline'

export function TriageListEmpty({ bucket, isFiltered, isUnreachable }: TriageListEmptyProps) {
  if (isUnreachable) {
    return <ErrorState title={UNREACHABLE_TITLE} description={UNREACHABLE_DESCRIPTION} />
  }
  if (isFiltered) {
    return (
      <EmptyState size="inline" expression="sleeping" title="No matches" description={NO_MATCHES} />
    )
  }
  const empty = EMPTY_BUCKET[bucket]
  const isInbox = bucket === 'inbox'

  return (
    <EmptyState
      expression="sleeping"
      title={empty.title}
      description={empty.description}
      action={
        isInbox && (
          <Link to="/console/overview" className={buttonVariants({ size: 'sm' })}>
            Open the overview
          </Link>
        )
      }
      secondary={
        isInbox && (
          <Link to="/console/$section" params={{ section: 'issues' }} className={QUIET_LINK}>
            Browse every issue
          </Link>
        )
      }
    />
  )
}
