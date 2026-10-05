import { Button } from '@code-whiskers/ui/components/button'
import { ButtonGroup } from '@code-whiskers/ui/components/button-group'
import { IconChevronDown } from '@tabler/icons-react'
import { AssignMenu } from '../../shared/assign-menu'
import { IssueArchiveMenu, IssueResolveMenu } from '../../shared/issue-ui'
import type { IssueActionsProps } from '../lib'

const FOREVER = { kind: 'forever' } as const

/** Split buttons: the face does the common thing, the chevron holds the conditions. */
export function IssueActions({ issue, actions }: IssueActionsProps) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <ButtonGroup>
        <Button
          variant="outline"
          size="sm"
          title="Archive forever · a opens the options"
          disabled={issue.status === 'archived'}
          onClick={() => actions.archive(FOREVER)}
        >
          Archive
        </Button>
        <IssueArchiveMenu
          isOpen={actions.isArchiveOpen}
          onOpenChange={actions.setArchiveOpen}
          onSelect={actions.archive}
          trigger={
            <Button variant="outline" size="icon-sm" aria-label="Archive until…">
              <IconChevronDown />
            </Button>
          }
        />
      </ButtonGroup>
      <AssignMenu
        assigneeUserId={actions.assigneeUserId}
        isDisabled={false}
        onAssign={actions.assign}
        isOpen={actions.isAssignOpen}
        onOpenChange={actions.setAssignOpen}
        trigger={<Button variant="outline" size="sm" title="i" />}
      />
      <ButtonGroup>
        <Button
          size="sm"
          title="e"
          disabled={issue.status === 'resolved'}
          onClick={() => actions.resolve('now')}
        >
          Resolve
        </Button>
        <IssueResolveMenu
          onSelect={actions.resolve}
          trigger={
            <Button
              size="icon-sm"
              aria-label="More ways to resolve"
              className="border-l-primary-foreground/20"
            >
              <IconChevronDown />
            </Button>
          }
        />
      </ButtonGroup>
    </div>
  )
}
