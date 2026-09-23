import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import {
  SECTION_HOOKS,
  SECTION_SAMPLE_NOTE,
  type SectionScreenProps,
  type SectionViewProps,
} from './lib'
import { SectionActions } from './section-actions'
import { SectionTable } from './section-table'

const TABLE_MIN_WIDTH = 1060

/** Keyed by section so each one mounts only its own data hook. */
export function SectionView({ section, tab }: SectionViewProps) {
  return (
    <SectionScreen
      key={section}
      section={section}
      tab={tab}
      useDefinition={SECTION_HOOKS[section]}
    />
  )
}

function SectionScreen({ section, tab, useDefinition }: SectionScreenProps) {
  const definition = useDefinition(tab)
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
        <SectionActions actions={definition.actions} sample={!!definition.sample} />
      </header>

      {definition.sample && (
        <div className="flex items-center gap-2.5 border-border border-b bg-severity-info/[0.07] px-6 py-2.5 text-severity-info-ink">
          <span className="size-[7px] rounded-full bg-severity-info" />
          <span className="font-medium text-[13px]">{SECTION_SAMPLE_NOTE}</span>
        </div>
      )}

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
