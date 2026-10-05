import { cn } from '@code-whiskers/ui/lib/utils'
import { SETUP_STEPS, type SetupRailProps } from './lib'

export function SetupRail({ step, hasProject, onStep }: SetupRailProps) {
  const current = SETUP_STEPS.findIndex((candidate) => candidate.id === step)

  return (
    <ol className="m-0 flex list-none flex-col gap-1 p-0">
      {SETUP_STEPS.map((candidate, index) => {
        const isCurrent = index === current
        const isReachable = hasProject && candidate.id !== 'platform'
        return (
          <li key={candidate.id}>
            <button
              type="button"
              disabled={!isReachable || isCurrent}
              onClick={() => onStep(candidate.id)}
              className={cn(
                'flex w-full items-start gap-3 rounded-[10px] px-2.5 py-2 text-left transition-colors',
                isCurrent ? 'bg-surface-subtle' : 'enabled:hover:bg-surface-subtle',
              )}
            >
              <span
                className={cn(
                  'mt-px flex size-[22px] shrink-0 items-center justify-center rounded-full border font-mono text-[11px]',
                  index < current
                    ? 'border-foreground bg-foreground text-background'
                    : isCurrent
                      ? 'border-foreground'
                      : 'border-border text-muted-foreground',
                )}
              >
                {index < current ? '✓' : index + 1}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className={cn('text-[13px]', isCurrent && 'font-medium')}>
                  {candidate.title}
                </span>
                <span className="text-[12px] text-muted-foreground">{candidate.hint}</span>
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
