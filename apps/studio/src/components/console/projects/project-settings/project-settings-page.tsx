import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@code-whiskers/ui/components/empty'
import { Spinner } from '@code-whiskers/ui/components/spinner'
import { IconArrowLeft } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { whiskersProjectQuery } from '@/integrations/whiskers'
import { formatAge } from '@/shared/format-date'
import { projectScopeValue } from '../../shared/console-scope'
import { consoleOrigin, DsnChip, ProjectInstallPanel, projectDsn } from '../../shared/project-setup'
import type { ProjectSettingsPageProps } from './lib'
import { ProjectDangerZone } from './project-danger-zone'
import { ProjectDeploys } from './project-deploys'
import { ProjectGeneral } from './project-general'
import { ProjectKeys } from './project-keys'
import { ProjectTestEvent } from './project-test-event'

export function ProjectSettingsPage({ projectId }: ProjectSettingsPageProps) {
  const { data: project, isError } = useQuery({ ...whiskersProjectQuery(projectId), retry: false })

  if (!project) {
    return isError ? (
      <Empty className="flex-1">
        <EmptyHeader>
          <EmptyTitle>Project not found</EmptyTitle>
          <EmptyDescription>It was deleted, or whiskers is not answering.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    ) : (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="size-5 text-muted-foreground" />
      </div>
    )
  }
  const dsn = projectDsn(consoleOrigin(), project)

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <nav className="flex shrink-0 items-center border-border border-b px-8 py-2.5">
        <Link
          to="/console/$section"
          params={{ section: 'integrations' }}
          search={{ tab: 1 }}
          className="flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <IconArrowLeft className="size-3.5" stroke={1.75} />
          Error ingest
        </Link>
      </nav>
      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        <div className="flex w-full max-w-[920px] flex-col gap-8 px-8 py-7">
          <header className="flex flex-col gap-2">
            <h1 className="m-0 font-semibold text-[20px] tracking-[-0.015em]">{project.name}</h1>
            <p className="m-0 text-[13px] text-muted-foreground">
              <span className="font-mono text-foreground tabular-nums">{project.issues}</span>{' '}
              issues · last event{' '}
              {project.lastEventAt ? `${formatAge(project.lastEventAt)} ago` : 'never'} ·{' '}
              <Link
                to="/console/$section"
                params={{ section: 'issues' }}
                search={{ tab: 0, scope: projectScopeValue(project.id) }}
                className="text-foreground hover:underline"
              >
                Open issues
              </Link>{' '}
              ·{' '}
              <Link
                to="/console/projects/new"
                search={{ project: project.id, step: 'install' }}
                className="text-foreground hover:underline"
              >
                Setup guide
              </Link>
            </p>
            {dsn && <DsnChip dsn={dsn} className="self-start" />}
          </header>
          {project.lastEventAt ? (
            <ProjectTestEvent project={project} />
          ) : (
            <ProjectInstallPanel project={project} />
          )}
          <ProjectGeneral key={`${project.name}:${project.repository}`} project={project} />
          <ProjectKeys project={project} />
          <ProjectDeploys project={project} />
          <ProjectDangerZone project={project} />
        </div>
      </div>
    </div>
  )
}
