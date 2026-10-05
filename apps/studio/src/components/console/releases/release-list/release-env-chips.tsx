import { cn } from '@code-whiskers/ui/lib/utils'
import { formatAge } from '@/shared/format-date'
import { MAX_ENV_CHIPS, type ReleaseEnvChipsProps } from './lib'

/** Environments it reached; a filled dot marks the ones it runs in now. */
export function ReleaseEnvChips({ release }: ReleaseEnvChipsProps) {
  const shown = release.environments.slice(0, MAX_ENV_CHIPS)
  const hidden = release.environments.length - shown.length

  return (
    <span className="flex min-w-0 items-center gap-1 overflow-hidden">
      {shown.map((env) => (
        <span
          key={env.name}
          title={
            env.isCurrent
              ? `Running in ${env.name} now`
              : env.deployedAt
                ? `Deployed to ${env.name} ${formatAge(env.deployedAt)} ago`
                : `Seen in ${env.name}`
          }
          className={cn(
            'inline-flex h-5 min-w-0 shrink items-center gap-1 rounded-full border px-1.5 text-2xs',
            env.isCurrent
              ? 'border-border text-foreground'
              : 'border-transparent text-muted-foreground',
          )}
        >
          <span
            aria-hidden
            className={cn(
              'size-1.5 shrink-0 rounded-full',
              env.isCurrent ? 'bg-foreground' : 'border border-faint',
            )}
          />
          <span className="truncate">{env.name}</span>
        </span>
      ))}
      {hidden > 0 && <span className="text-2xs text-faint">+{hidden}</span>}
      {release.environments.length === 0 && <span className="text-2xs text-faint">—</span>}
    </span>
  )
}
