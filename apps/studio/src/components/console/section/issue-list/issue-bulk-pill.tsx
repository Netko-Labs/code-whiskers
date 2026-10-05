import { Button } from '@code-whiskers/ui/components/button'
import { IconChevronDown, IconX } from '@tabler/icons-react'
import { AssignMenu } from '../../shared/assign-menu'
import { type LifecycleAction, plural, useIssueLifecycle } from '../../shared/issue-lifecycle'
import { IssueArchiveMenu, IssueResolveMenu } from '../../shared/issue-ui'
import type { IssueBulkPillProps } from './lib'

const PILL_BUTTON = 'text-body hover:bg-surface-selected hover:text-foreground'

/** Floats over the list while rows are selected; every action clears the selection after. */
export function IssueBulkPill({ issues, onDone }: IssueBulkPillProps) {
  const lifecycle = useIssueLifecycle()

  const run = (action: LifecycleAction) => {
    lifecycle.apply(issues, action)
    onDone()
  }

  return (
    <div className="dark -translate-x-1/2 absolute bottom-[22px] left-1/2 z-10 flex animate-enter-up items-center gap-1 rounded-xl border border-border bg-popover py-1.5 pr-1.5 pl-3.5 text-foreground shadow-overlay">
      <span className="mr-1.5 font-medium text-[13px] tabular-nums">
        {plural(issues.length, 'issue')}
      </span>
      <IssueResolveMenu
        align="start"
        onSelect={(mode) => run({ kind: 'resolve', mode })}
        trigger={
          <Button variant="ghost" size="sm" className={PILL_BUTTON}>
            Resolve
            <IconChevronDown data-icon="inline-end" />
          </Button>
        }
      />
      <IssueArchiveMenu
        align="start"
        onSelect={(choice) => run({ kind: 'archive', choice })}
        trigger={
          <Button variant="ghost" size="sm" className={PILL_BUTTON}>
            Archive
            <IconChevronDown data-icon="inline-end" />
          </Button>
        }
      />
      <AssignMenu
        assigneeUserId={null}
        isDisabled={false}
        onAssign={(member) => {
          lifecycle.assign(issues, member)
          onDone()
        }}
        trigger={<Button variant="ghost" size="sm" className={PILL_BUTTON} />}
      />
      <span className="mx-1 h-4 w-px bg-border" />
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:bg-surface-selected hover:text-foreground"
        onClick={onDone}
      >
        <IconX data-icon="inline-start" />
        Clear
      </Button>
    </div>
  )
}
