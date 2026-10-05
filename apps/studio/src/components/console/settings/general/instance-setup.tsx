import { IconCheck } from '@tabler/icons-react'
import { Panel } from '@/components/shared/page'
import { SetupStepLink, setupProgressOf, useSetupSteps } from '../../shared/setup-checklist'

/** Every setup step, done ones checked off; each open one links to where it gets done. */
export function InstanceSetup() {
  const steps = useSetupSteps()
  const progress = setupProgressOf(steps)

  return (
    <Panel
      title={<span id="setup">Setup</span>}
      description={
        progress.done === progress.total
          ? 'Everything is connected'
          : `${progress.done} of ${progress.total} done · each open step opens where it is done`
      }
      actions={
        <span className="font-mono text-2xs text-muted-foreground tabular-nums">
          {progress.percent}%
        </span>
      }
    >
      <div
        role="progressbar"
        aria-label="Setup progress"
        aria-valuenow={progress.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mb-3 h-1 overflow-hidden rounded-full bg-surface-subtle"
      >
        <div
          className="h-full rounded-full bg-foreground transition-[width] duration-slow ease-out-quart"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <div className="stagger -mx-2 flex flex-col">
        {steps.map((step) =>
          step.isDone ? (
            <div
              key={step.step}
              className="flex items-center gap-2 px-2 py-1.5 text-muted-foreground text-ui"
            >
              <IconCheck className="size-3.5 shrink-0" stroke={2} aria-label="Done" />
              <span className="min-w-0 flex-1 truncate">{step.step}</span>
            </div>
          ) : (
            <SetupStepLink key={step.step} step={step} />
          ),
        )}
      </div>
    </Panel>
  )
}
