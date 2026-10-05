import { cn } from '@code-whiskers/ui/lib/utils'
import { IconCircle, IconCircleCheckFilled } from '@tabler/icons-react'
import { EmptyState } from '@/components/shared/empty-state'
import { Panel } from '@/components/shared/page'
import { setupProgressOf, useSetupSteps } from '../../shared/setup-checklist'
import { SetupAction } from './setup-action'

/** A fresh instance: no numbers to show yet, so the one next step is the whole page. */
export function OverviewSetup() {
  const steps = useSetupSteps()
  const progress = setupProgressOf(steps)
  const next = progress.next[0]

  return (
    <div className="grid animate-enter-up gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <EmptyState
        expression="idle"
        title="Nothing to chart yet"
        description="The overview fills in with the first review or error."
        action={next && <SetupAction link={next.link} label={next.step} />}
        className="rounded-xl border border-border"
      />
      <Panel title="Setup" description={`${progress.done} of ${progress.total} done`} isFlush>
        <div className="mx-4 mt-3 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground transition-[width] duration-slow ease-out-quart"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <ol className="stagger m-0 flex list-none flex-col p-2">
          {steps.map((step) => (
            <li
              key={step.step}
              className={cn(
                'flex items-start gap-2.5 rounded-md px-2 py-1.5 text-ui',
                step === next && 'bg-surface-selected',
              )}
            >
              {step.isDone ? (
                <IconCircleCheckFilled className="mt-0.5 size-4 shrink-0 text-severity-resolved" />
              ) : (
                <IconCircle className="mt-0.5 size-4 shrink-0 text-faint" stroke={1.75} />
              )}
              <span className="flex min-w-0 flex-col">
                <span
                  className={cn(
                    step.isDone
                      ? 'text-muted-foreground line-through decoration-faint'
                      : 'text-foreground',
                  )}
                >
                  {step.step}
                </span>
                {step === next && (
                  <span className="text-2xs text-muted-foreground">{step.how}</span>
                )}
              </span>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  )
}
