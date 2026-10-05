import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@code-whiskers/ui/components/dropdown-menu'
import { cn } from '@code-whiskers/ui/lib/utils'
import { IconBell, IconBellOff, IconDots, IconPencil, IconTrash } from '@tabler/icons-react'
import { DataRow, DataRowLead, DataRowTrail } from '@/components/shared/data-list'
import { SeverityDot, StatusBadge } from '@/components/shared/status'
import { formatAge } from '@/shared/format-date'
import { EFFECT_META, EVERYWHERE, type ReviewRuleRowProps, useRuleActions } from './lib'

export function ReviewRuleRow({ rule, onEdit }: ReviewRuleRowProps) {
  const { toggleMute, remove } = useRuleActions()
  const effect = EFFECT_META[rule.effect]

  return (
    <DataRow density="auto" className="items-start py-3">
      <DataRowLead className="mt-1.5">
        <SeverityDot tone={rule.isMuted ? 'neutral' : effect.tone} label={effect.label} />
      </DataRowLead>
      <span className={cn('flex min-w-0 flex-1 flex-col gap-1.5', rule.isMuted && 'opacity-60')}>
        <button
          type="button"
          onClick={onEdit}
          className="focus-ring self-start whitespace-pre-line rounded-sm text-left text-pretty text-foreground text-ui leading-5 hover:underline hover:decoration-border hover:underline-offset-4"
        >
          {rule.body}
        </button>
        <span className="flex flex-wrap items-center gap-1.5 text-2xs text-muted-foreground">
          <code className="rounded-sm bg-surface-subtle px-1.5 py-px font-mono text-foreground">
            {rule.scope === EVERYWHERE ? 'everywhere' : rule.scope}
          </code>
          <span className="text-faint">·</span>
          <span className="font-mono">{rule.organization}</span>
          <span className="text-faint">·</span>
          <span>
            {rule.authorName ?? 'Someone'}, {formatAge(rule.createdAt)} ago
          </span>
        </span>
      </span>
      <DataRowTrail className="mt-0.5">
        <StatusBadge tone={rule.isMuted ? 'neutral' : effect.tone}>
          {rule.isMuted ? 'Muted' : effect.label}
        </StatusBadge>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="Rule actions"
                className="focus-ring flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground aria-expanded:bg-surface-selected"
              />
            }
          >
            <IconDots className="size-4" stroke={1.75} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={6} className="w-auto min-w-40">
            <DropdownMenuItem onClick={onEdit}>
              <IconPencil stroke={1.75} />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleMute(rule)}>
              {rule.isMuted ? <IconBell stroke={1.75} /> : <IconBellOff stroke={1.75} />}
              {rule.isMuted ? 'Unmute' : 'Mute'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => remove(rule)}>
              <IconTrash stroke={1.75} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DataRowTrail>
    </DataRow>
  )
}
