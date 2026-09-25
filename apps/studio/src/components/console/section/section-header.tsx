import { SECTION_SAMPLE_NOTE, type SectionHeaderProps } from './lib'
import { SectionActions } from './section-actions'

/** The title, then one line of evidence: the section's numbers, read as a sentence. */
export function SectionHeader({ definition }: SectionHeaderProps) {
  const note = definition.sample ? SECTION_SAMPLE_NOTE : definition.note

  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 px-8 pt-7 pb-5">
      <div className="flex min-w-0 flex-col gap-1.5">
        <h1 className="m-0 font-semibold text-[20px] leading-7 tracking-[-0.015em]">
          {definition.title}
        </h1>
        {definition.stats.length > 0 ? (
          <p className="m-0 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
            {definition.stats.map((stat, index) => (
              <span key={stat.label} title={stat.note} className="flex items-baseline gap-2">
                {index > 0 && <span className="text-faint">·</span>}
                <span>
                  <span className="font-medium font-mono text-foreground tabular-nums">
                    {stat.value}
                  </span>{' '}
                  {stat.label.toLowerCase()}
                </span>
              </span>
            ))}
          </p>
        ) : (
          <p className="m-0 text-[13px] text-muted-foreground">{definition.subtitle}</p>
        )}
        {note && (
          <p className="m-0 flex items-center gap-2 text-[12px] text-muted-foreground">
            <span className="size-1.5 shrink-0 rounded-full bg-severity-info" />
            {note}
          </p>
        )}
      </div>
      <SectionActions actions={definition.actions} sample={!!definition.sample} />
    </header>
  )
}
