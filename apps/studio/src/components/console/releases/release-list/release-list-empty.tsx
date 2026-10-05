import { buttonVariants } from '@code-whiskers/ui/components/button'
import { Link } from '@tanstack/react-router'
import { EmptyState } from '@/components/shared/empty-state'
import { DeploySnippet } from '../../shared/release-ui'
import type { ReleaseListEmptyProps } from './lib'

/** Nothing reported yet: the two ways a release appears, with the deploy line ready to copy. */
export function ReleaseListEmpty({ projects }: ReleaseListEmptyProps) {
  const [project] = projects

  if (!project) {
    return (
      <EmptyState
        title="No releases yet"
        description="Releases come from the events a project sends and the deploys it reports."
        action={
          <Link to="/console/projects/new" className={buttonVariants({ size: 'sm' })}>
            Set up a project
          </Link>
        }
      />
    )
  }
  return (
    <EmptyState
      title="No releases reported"
      description={
        <>
          Set <code className="font-mono">release</code> in Sentry.init, or report each deploy from
          CI. The first one lands here with its commits.
        </>
      }
      secondary={
        <Link
          to="/console/projects/$projectId"
          params={{ projectId: project.id }}
          className="focus-ring rounded-sm text-muted-foreground text-ui hover:text-foreground"
        >
          {project.name} settings
        </Link>
      }
    >
      <DeploySnippet project={project} className="mt-2 w-full max-w-[640px] text-left" />
    </EmptyState>
  )
}
