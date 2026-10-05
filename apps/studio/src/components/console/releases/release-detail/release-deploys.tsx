import { EmptyState } from '@/components/shared/empty-state'
import { Panel } from '@/components/shared/page'
import { DeploySnippet } from '../../shared/release-ui'
import { DeployTimeline } from './deploy-timeline'
import { deployGroupsOf, type ReleaseDeploysProps } from './lib'

/** Where this release went and what replaced it, per environment. */
export function ReleaseDeploys({ detail, project }: ReleaseDeploysProps) {
  const groups = deployGroupsOf(detail.deploys)

  if (groups.length === 0) {
    return (
      <EmptyState
        size="inline"
        title="No deploys reported"
        description="Run this from the deploy step and each environment gets a history here."
      >
        {project && <DeploySnippet project={project} className="w-full max-w-[640px] text-left" />}
      </EmptyState>
    )
  }
  return (
    <Panel
      title="Deploys"
      description="Newest first per environment; the active one is what runs there now"
    >
      <div className="grid gap-x-8 gap-y-6 lg:grid-cols-2">
        {groups.map((group) => (
          <DeployTimeline key={group.environment} group={group} />
        ))}
      </div>
    </Panel>
  )
}
