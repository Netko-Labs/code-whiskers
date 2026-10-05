import { IconArrowLeft } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { consoleOrigin, DsnChip, FirstEventBar, projectDsn } from '../../shared/project-setup'
import { type ProjectSetupPageProps, stepOf, useSetupNavigation } from './lib'
import { SetupInstallStep } from './setup-install-step'
import { SetupPlatformStep } from './setup-platform-step'
import { SetupRail } from './setup-rail'
import { SetupVerifyStep } from './setup-verify-step'
import { SkipLink } from './skip-link'

/** Platform → install → verify, with the DSN one click away from the moment it exists. */
export function ProjectSetupPage({ search }: ProjectSetupPageProps) {
  const { project, isMissing, go } = useSetupNavigation(search)
  const step = stepOf(search, !!project)
  const dsn = project ? projectDsn(consoleOrigin(), project) : null

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <nav className="flex shrink-0 items-center gap-4 border-border border-b px-8 py-2.5">
        <Link
          to="/console/$section"
          params={{ section: 'issues' }}
          search={{ tab: 0 }}
          className="flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <IconArrowLeft className="size-3.5" stroke={1.75} />
          Issues
        </Link>
        <span className="min-w-0 flex-1 truncate font-medium text-[13px]">
          {project ? project.name : 'New project'}
        </span>
        {dsn && <DsnChip dsn={dsn} className="max-w-[420px]" />}
        <SkipLink projectId={project?.id} />
      </nav>
      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        <div className="grid w-full max-w-[1120px] gap-8 px-8 py-7 md:grid-cols-[220px_minmax(0,1fr)]">
          <SetupRail step={step} hasProject={!!project} onStep={(next) => go({ step: next })} />
          <main className="min-w-0">
            {isMissing && (
              <p className="m-0 mb-6 text-[13px] text-muted-foreground">
                That project is gone or unreachable — create a new one below.
              </p>
            )}
            {step === 'platform' && (
              <SetupPlatformStep
                platform={search.platform}
                project={project}
                onPlatform={(platform) => go({ platform })}
                onCreated={(projectId) => go({ project: projectId, step: 'install' })}
                onContinue={() => go({ step: 'install' })}
              />
            )}
            {step === 'install' && dsn && (
              <SetupInstallStep
                platform={search.platform}
                dsn={dsn}
                onNext={() => go({ step: 'verify' })}
              />
            )}
            {step === 'install' && project && !dsn && (
              <p className="m-0 text-[13px] text-muted-foreground">
                Every key of {project.name} is disabled — enable one in its settings for a DSN.
              </p>
            )}
            {step === 'verify' && project && <SetupVerifyStep project={project} />}
          </main>
        </div>
      </div>
      {project && <FirstEventBar projectId={project.id} variant="footer" />}
    </div>
  )
}
