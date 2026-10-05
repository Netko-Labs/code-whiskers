import { Link } from '@tanstack/react-router'
import { EmptyState } from '@/components/shared/empty-state'
import { RULE_TEMPLATES, whenSummary } from '../shared/rule-copy'
import type { RuleTemplatesProps } from './lib'

/** The empty rule list is a starting point: pick a template, land in the editor prefilled. */
export function RuleTemplates({ hasDestination }: RuleTemplatesProps) {
  return (
    <EmptyState
      title="No alert rules yet"
      description="Start from a template. Every rule opens in the editor before anything is armed."
      secondary={
        hasDestination ? undefined : (
          <Link
            to="/console/alerts/destinations"
            className="text-muted-foreground text-ui underline-offset-4 hover:text-foreground hover:underline"
          >
            Add a destination first
          </Link>
        )
      }
    >
      <div className="stagger grid w-full max-w-[720px] gap-3 sm:grid-cols-3">
        {RULE_TEMPLATES.map((template) => (
          <Link
            key={template.key}
            to="/console/alerts/new"
            search={{ template: template.key }}
            className="hover-lift focus-ring flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left"
          >
            <span className="font-medium text-foreground text-ui">{template.title}</span>
            <span className="text-2xs text-muted-foreground">{template.description}</span>
            <span className="mt-auto truncate font-mono text-2xs text-faint">
              {whenSummary({ ...template, projectIds: [], minLevel: null, release: null })}
            </span>
          </Link>
        ))}
      </div>
    </EmptyState>
  )
}
