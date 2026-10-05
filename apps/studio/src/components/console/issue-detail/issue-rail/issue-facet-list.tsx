import { cn } from '@code-whiskers/ui/lib/utils'
import type { IssueFacetListProps } from '../lib'

export function IssueFacetList({ title, rows, isMono = false }: IssueFacetListProps) {
  const peak = Math.max(1, ...rows.map((row) => row.count))

  return (
    <section className="flex flex-col gap-2">
      <h3 className="m-0 font-semibold text-[13px]">{title}</h3>
      {rows.length === 0 && (
        <span className="text-[12px] text-muted-foreground">None recorded</span>
      )}
      {rows.map((row) => (
        <div key={row.name} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-2 text-[12px]">
            <span className={cn('truncate', isMono && 'font-mono')}>{row.name}</span>
            <span className="shrink-0 font-mono text-muted-foreground tabular-nums">
              {row.count.toLocaleString()}
            </span>
          </div>
          <span className="h-1 overflow-hidden rounded-full bg-fog dark:bg-ink-hairline">
            <span
              className="block h-full rounded-full bg-severity-info/70"
              style={{ width: `${Math.round((row.count / peak) * 100)}%` }}
            />
          </span>
          {row.note && <span className="text-[11px] text-muted-foreground">{row.note}</span>}
        </div>
      ))}
    </section>
  )
}
