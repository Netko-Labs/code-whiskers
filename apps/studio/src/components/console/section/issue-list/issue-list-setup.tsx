import { CatExpression } from '@code-whiskers/ui/brand'
import { buttonVariants } from '@code-whiskers/ui/components/button'
import { Link } from '@tanstack/react-router'

/** Zero projects: there is nothing to list until something can send. */
export function IssueListSetup() {
  return (
    <div className="flex flex-col items-center gap-4 px-8 py-16 text-center">
      <CatExpression expression="idle" size={112} />
      <div className="flex max-w-[420px] flex-col gap-1.5">
        <h2 className="m-0 font-semibold text-[17px]">Set up error tracking</h2>
        <p className="m-0 text-[13px] text-muted-foreground">
          Create a project, drop its DSN into any Sentry SDK, and errors group into issues here.
          Three steps, about two minutes.
        </p>
      </div>
      <Link to="/console/projects/new" className={buttonVariants({ size: 'sm' })}>
        Set up a project
      </Link>
    </div>
  )
}
