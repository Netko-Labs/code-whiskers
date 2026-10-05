import { Link } from '@tanstack/react-router'
import { projectScopeValue } from '../../shared/console-scope'
import type { SetupVerifyStepProps } from './lib'

const CHECKS = [
  'Run the app with the DSN set and trigger the test error from the install step.',
  'Or press Send test event below: whiskers ingests one itself, no SDK involved.',
  'The bar below turns over the moment the first event is grouped into an issue.',
]

export function SetupVerifyStep({ project }: SetupVerifyStepProps) {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="m-0 font-semibold text-[20px] tracking-[-0.015em]">Verify</h1>
        <p className="m-0 text-[13px] text-muted-foreground">
          Nothing to configure here — send one event and watch it arrive.
        </p>
      </header>
      <ol className="m-0 flex flex-col gap-2 pl-5 text-[13px]">
        {CHECKS.map((check) => (
          <li key={check}>{check}</li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-4 text-[13px]">
        <Link
          to="/console/$section"
          params={{ section: 'issues' }}
          search={{ tab: 0, scope: projectScopeValue(project.id) }}
          className="font-medium hover:underline"
        >
          Issues for {project.name} →
        </Link>
        <Link
          to="/console/projects/$projectId"
          params={{ projectId: project.id }}
          className="text-muted-foreground hover:text-foreground"
        >
          Project settings and keys
        </Link>
      </div>
    </div>
  )
}
