import { Button, buttonVariants } from '@code-whiskers/ui/components/button'
import { Link } from '@tanstack/react-router'
import { EmptyState } from '@/components/shared/empty-state'
import { SeverityDot } from '@/components/shared/status'
import { EXAMPLE_NOTE, KIND_META, type MemoryEmptyProps, newDraft } from './lib'

/** Nothing remembered yet: show what a note looks like, and let it be the first. */
export function MemoryEmpty({ organizations, onWrite }: MemoryEmptyProps) {
  if (organizations.length === 0) {
    return (
      <EmptyState
        title="Connect GitHub first"
        description="Memory belongs to a GitHub App installation, so it needs one before the first note."
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
      title="Whiskers remembers nothing yet"
      description="Add what a new reviewer should know: rules that must hold, things not to flag, how the code works. Whiskers also adds what it learns from reviews."
      action={
        <Button size="sm" onClick={() => onWrite(newDraft(organizations))}>
          Add a note
        </Button>
      }
      secondary={
        <Button
          size="sm"
          variant="outline"
          onClick={() => onWrite(newDraft(organizations, EXAMPLE_NOTE))}
        >
          Start from the example
        </Button>
      }
    >
      <figure className="m-0 mt-2 flex w-full max-w-[440px] flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3 text-left">
        <span className="flex items-center gap-2 text-2xs text-muted-foreground">
          <SeverityDot tone={KIND_META[EXAMPLE_NOTE.kind].tone} size="sm" />
          {KIND_META[EXAMPLE_NOTE.kind].label}
          <code className="ml-auto rounded-sm bg-surface-subtle px-1.5 py-px font-mono text-foreground">
            {EXAMPLE_NOTE.paths}
          </code>
        </span>
        <blockquote className="m-0 text-pretty text-foreground text-ui">
          {EXAMPLE_NOTE.body}
        </blockquote>
      </figure>
    </EmptyState>
  )
}
