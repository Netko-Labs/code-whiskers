import { buttonVariants } from '@code-whiskers/ui/components/button'
import { Link } from '@tanstack/react-router'
import { EmptyState } from '@/components/shared/empty-state'

/** Zero projects: there is nothing to list until something can send. */
export function IssueListSetup() {
  return (
    <EmptyState
      title="Set up error tracking"
      description="Create a project, drop its DSN into any Sentry SDK, and errors group into issues here. Three steps, about two minutes."
      action={
        <Link to="/console/projects/new" className={buttonVariants({ size: 'sm' })}>
          Set up a project
        </Link>
      }
    />
  )
}
