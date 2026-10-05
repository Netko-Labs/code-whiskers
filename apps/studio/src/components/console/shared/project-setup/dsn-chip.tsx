import { cn } from '@code-whiskers/ui/lib/utils'
import { IconCopy } from '@tabler/icons-react'
import { useConsoleStore } from '../../use-console-store'
import type { DsnChipProps } from './lib'

export function DsnChip({ dsn, className }: DsnChipProps) {
  return (
    <button
      type="button"
      title="Copy DSN"
      onClick={() => {
        void navigator.clipboard.writeText(dsn)
        useConsoleStore.getState().flash('DSN copied')
      }}
      className={cn(
        'group flex min-w-0 items-center gap-2 rounded-[8px] border border-border bg-surface-subtle px-2.5 py-1 text-left transition-colors hover:border-ring',
        className,
      )}
    >
      <span className="shrink-0 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.12em]">
        DSN
      </span>
      <span className="min-w-0 truncate font-mono text-[12px]">{dsn}</span>
      <IconCopy
        className="size-3.5 shrink-0 text-muted-foreground group-hover:text-foreground"
        stroke={1.75}
      />
    </button>
  )
}
