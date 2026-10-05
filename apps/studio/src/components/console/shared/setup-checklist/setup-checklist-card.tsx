import { cn } from '@code-whiskers/ui/lib/utils'
import { IconX } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import {
  type SetupChecklistCardProps,
  setupProgressOf,
  useSetupDismissal,
  useSetupSteps,
} from './lib'
import { SetupStepLink } from './setup-step-link'

/** What the instance still needs, until it needs nothing or someone closes it. */
export function SetupChecklistCard({ className }: SetupChecklistCardProps) {
  const steps = useSetupSteps()
  const { isDismissed, dismiss } = useSetupDismissal()
  const progress = setupProgressOf(steps)
  if (isDismissed || progress.next.length === 0) return null

  return (
    <section
      aria-label="Setup"
      className={cn('flex flex-col gap-2 rounded-[12px] border border-border p-3', className)}
    >
      <div className="flex items-center gap-2 px-1">
        <h2 className="m-0 min-w-0 flex-1 font-medium text-[13px]">Finish setting up</h2>
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
          {progress.done}/{progress.total}
        </span>
        <button
          type="button"
          onClick={dismiss}
          title="Hide the setup card"
          className="flex size-5 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-surface-subtle hover:text-foreground"
        >
          <IconX className="size-3.5" stroke={1.75} />
        </button>
      </div>
      <div className="mx-1 h-1 overflow-hidden rounded-full bg-surface-subtle">
        <div
          className="h-full rounded-full bg-foreground"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <div className="flex flex-col">
        {progress.next.map((step) => (
          <SetupStepLink key={step.step} step={step} />
        ))}
      </div>
      <Link
        to="/console/settings/general"
        hash="setup"
        className="px-1 text-[12px] text-muted-foreground hover:text-foreground"
      >
        All steps →
      </Link>
    </section>
  )
}
