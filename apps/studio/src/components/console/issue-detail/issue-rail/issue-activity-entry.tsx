import { CatMark } from '@code-whiskers/ui/brand'
import { formatAge } from '@/shared/format-date'
import { PersonAvatar } from '../../shared/console-ui'
import type { IssueActivityEntryProps } from '../lib'

export function IssueActivityEntry({ view }: IssueActivityEntryProps) {
  return (
    <li className="flex items-start gap-2.5">
      {view.isSystem ? (
        <CatMark cut="round" tone="dark" size={22} className="shrink-0 rounded-full bg-ink" />
      ) : (
        <PersonAvatar name={view.who} image={view.image} className="size-[22px]" />
      )}
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[12px] leading-[17px]">
          <span className="font-semibold">{view.who}</span>{' '}
          <span className="text-body">{view.text}</span>{' '}
          <span className="text-muted-foreground">· {formatAge(view.at)} ago</span>
        </span>
        {view.body && (
          <span className="whitespace-pre-wrap rounded-lg bg-surface-subtle px-2.5 py-1.5 text-[12.5px] text-body leading-[18px]">
            {view.body}
          </span>
        )}
      </div>
    </li>
  )
}
