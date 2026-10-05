import { buttonVariants } from '@code-whiskers/ui/components/button'
import { Link } from '@tanstack/react-router'
import { EmptyState } from '@/components/shared/empty-state'
import type { SectionEmptyStateProps, SectionLinkProps } from './lib'

function SectionLink({ action, className }: SectionLinkProps) {
  return action.href.startsWith('http') ? (
    <a href={action.href} target="_blank" rel="noreferrer" className={className}>
      {action.label}
    </a>
  ) : (
    <Link to={action.href} className={className}>
      {action.label}
    </Link>
  )
}

/** No rows at all gets the section's next step; rows filtered away get a plain "no matches". */
export function SectionEmptyState({ empty }: SectionEmptyStateProps) {
  if (!empty) {
    return (
      <EmptyState
        size="inline"
        expression="sleeping"
        title="No matches"
        description="Nothing here fits the current tab, scope or search."
      />
    )
  }

  return (
    <EmptyState
      expression={empty.expression}
      title={empty.title}
      description={empty.description}
      action={
        empty.action && (
          <SectionLink action={empty.action} className={buttonVariants({ size: 'sm' })} />
        )
      }
    />
  )
}
