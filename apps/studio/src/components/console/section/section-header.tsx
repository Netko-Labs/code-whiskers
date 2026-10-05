import { Fragment } from 'react'
import { PageHeader } from '@/components/shared/page'
import { SeverityDot } from '@/components/shared/status'
import type { SectionHeaderProps } from './lib'
import { SectionActions } from './section-actions'

/** The title, then one line of evidence: the section's numbers, read as a sentence. */
export function SectionHeader({ definition }: SectionHeaderProps) {
  const hasStats = definition.stats.length > 0

  return (
    <PageHeader
      title={definition.title}
      description={hasStats ? undefined : definition.subtitle}
      actions={definition.actions.length > 0 && <SectionActions actions={definition.actions} />}
      meta={
        (hasStats || definition.note) && (
          <>
            {definition.stats.map((stat, index) => (
              <Fragment key={stat.label}>
                {index > 0 && <span className="text-faint">·</span>}
                <span title={stat.note} className="animate-enter text-ui">
                  <span className="font-medium font-mono text-foreground tabular-nums">
                    {stat.value}
                  </span>{' '}
                  {stat.label.toLowerCase()}
                </span>
              </Fragment>
            ))}
            {definition.note && (
              <span className="flex basis-full items-center gap-2 text-ui">
                <SeverityDot tone="info" size="sm" />
                {definition.note}
              </span>
            )}
          </>
        )
      }
    />
  )
}
