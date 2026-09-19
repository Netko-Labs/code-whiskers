import { Button } from '@code-whiskers/ui/components/button'
import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { useConsoleStore } from '../use-console-store'
import { type SectionViewProps, useSectionDefinition } from './lib'
import { SectionTable } from './section-table'

const TABLE_MIN_WIDTH = 1060

export function SectionView({ section, tab }: SectionViewProps) {
  const definition = useSectionDefinition(section, tab)
  const table = typeof definition.table === 'function' ? definition.table(tab) : definition.table

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-wrap items-start justify-between gap-x-5 gap-y-3 border-border border-b px-6 pt-[18px] pb-4">
        <div className="flex min-w-0 flex-col gap-[5px]">
          <h1 className="m-0 font-semibold text-xl tracking-[-0.02em]">{definition.title}</h1>
          <span className="text-[13px] text-muted-foreground text-pretty">
            {definition.subtitle}
          </span>
        </div>
        <div className="flex shrink-0 gap-2">
          {definition.actions.map((action) => (
            <Button
              key={action.label}
              size="sm"
              variant={action.variant === 'outline' ? 'outline' : 'default'}
              onClick={() => useConsoleStore.getState().flash(action.label)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </header>

      <div className="grid shrink-0 grid-cols-4 border-border border-b">
        {definition.stats.map((stat) => (
          <div
            key={stat.label}
            className="flex min-w-0 flex-col gap-[3px] border-rule-soft border-r px-5 py-[13px]"
          >
            <span className="text-[11px] text-muted-foreground">{stat.label}</span>
            <span className="font-semibold text-[17px] tracking-[-0.02em]">{stat.value}</span>
            <span className="text-[11px] text-faint">{stat.note}</span>
          </div>
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 border-border border-b px-6 py-3">
        {definition.tabs.map((label, index) => (
          <Link
            key={label}
            to="/console/$section"
            params={{ section }}
            search={{ tab: index }}
            className={cn(
              'rounded-lg border px-2.5 py-1 font-medium text-xs',
              index === tab
                ? 'border-foreground bg-foreground text-primary-foreground'
                : 'border-border bg-background text-body',
            )}
          >
            {label}
          </Link>
        ))}
        <span className="ml-auto text-muted-foreground text-xs">{table.rows.length} rows</span>
      </div>

      <SectionTable table={table} minWidth={TABLE_MIN_WIDTH} />

      <div className="shrink-0 border-border border-t bg-surface-subtle px-6 py-2.5">
        <span className="text-muted-foreground text-xs">{table.footer}</span>
      </div>
    </div>
  )
}
