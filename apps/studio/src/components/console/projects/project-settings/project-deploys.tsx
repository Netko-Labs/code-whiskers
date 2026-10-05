import { Link } from '@tanstack/react-router'
import { DeploySnippet } from '../../shared/release-ui'
import type { ProjectSectionProps } from './lib'
import { SettingsSection } from './settings-section'

export function ProjectDeploys({ project }: ProjectSectionProps) {
  return (
    <SettingsSection
      title="Deploys"
      description="Report each deploy from CI or Coolify. Releases then show where they run, and their commits are read from the linked repository."
    >
      <DeploySnippet project={project} />
      <Link
        to="/console/$section"
        params={{ section: 'releases' }}
        search={{ tab: 0, project: project.id }}
        className="self-start text-[13px] text-foreground hover:underline"
      >
        Open releases
      </Link>
    </SettingsSection>
  )
}
