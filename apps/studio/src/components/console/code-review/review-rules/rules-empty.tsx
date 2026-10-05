import { Button, buttonVariants } from '@code-whiskers/ui/components/button'
import { Link } from '@tanstack/react-router'
import { EmptyState } from '@/components/shared/empty-state'
import { SeverityDot } from '@/components/shared/status'
import { EFFECT_META, EXAMPLE_RULE, newDraft, type RulesEmptyProps } from './lib'

/** No rules yet: show what one looks like, and let it be the first. */
export function RulesEmpty({ hasOrganizations, organizations, onWrite }: RulesEmptyProps) {
  if (!hasOrganizations) {
    return (
      <EmptyState
        title="Connect GitHub first"
        description="Rules belong to a GitHub App installation, so they need one before the first can be written."
        action={
          <Link to="/console/repositories" className={buttonVariants({ size: 'sm' })}>
            Connect a repository
          </Link>
        }
      />
    )
  }

  return (
    <EmptyState
      title="No rules yet"
      description="Whiskers runs on its defaults until the team writes one. A rule is plain English, scoped to a path."
      action={
        <Button size="sm" onClick={() => onWrite(newDraft(organizations))}>
          Write a rule
        </Button>
      }
      secondary={
        <Button
          size="sm"
          variant="outline"
          onClick={() => onWrite(newDraft(organizations, EXAMPLE_RULE))}
        >
          Start from the example
        </Button>
      }
    >
      <figure className="m-0 mt-2 flex w-full max-w-[440px] flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3 text-left">
        <span className="flex items-center gap-2 text-2xs text-muted-foreground">
          <SeverityDot tone={EFFECT_META[EXAMPLE_RULE.effect].tone} size="sm" />
          {EFFECT_META[EXAMPLE_RULE.effect].label}
          <code className="ml-auto rounded-sm bg-surface-subtle px-1.5 py-px font-mono text-foreground">
            {EXAMPLE_RULE.scope}
          </code>
        </span>
        <blockquote className="m-0 text-pretty text-foreground text-ui">
          {EXAMPLE_RULE.body}
        </blockquote>
      </figure>
    </EmptyState>
  )
}
