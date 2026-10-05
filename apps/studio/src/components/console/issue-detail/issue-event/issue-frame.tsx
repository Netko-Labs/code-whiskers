import { cn } from '@code-whiskers/ui/lib/utils'
import type { IssueFrameProps } from '../lib'

export function IssueFrame({ frame, isCulprit }: IssueFrameProps) {
  const where = [frame.file, frame.line, frame.column].filter((part) => part !== null).join(':')

  return (
    <div className="border-zinc-900 border-b px-4 py-2 last:border-b-0">
      <div className="flex min-w-0 gap-2">
        <span className="w-3 shrink-0 text-severity-error">{isCulprit ? '→' : ''}</span>
        <span className="min-w-0 break-all">
          <span className={cn(isCulprit ? 'text-zinc-50' : 'text-zinc-200')}>{frame.function}</span>
          <span className="text-zinc-500"> {where}</span>
        </span>
      </div>
      {frame.context && (
        <div className="mt-1 ml-5 flex gap-3 rounded-md bg-zinc-900 px-2.5 py-1">
          <span className="shrink-0 text-zinc-600 tabular-nums">{frame.line ?? ''}</span>
          <span className="min-w-0 break-all whitespace-pre-wrap text-zinc-300">
            {frame.context}
          </span>
        </div>
      )}
    </div>
  )
}
