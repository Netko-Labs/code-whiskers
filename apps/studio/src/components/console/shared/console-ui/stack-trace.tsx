import { cn } from '@code-whiskers/ui/lib/utils'
import { STACK_TONE, type StackTraceProps } from './lib'

export function StackTrace({ title, frames, hiddenNote }: StackTraceProps) {
  return (
    <div className="dark flex-1 overflow-auto bg-zinc-950 px-4 py-3.5 font-mono text-xs leading-5 text-zinc-400">
      <div className="mb-1 text-zinc-50">{title}</div>
      {frames.map((frame, index) => (
        <div key={`${frame.no}-${index}`} className="flex gap-2.5">
          <span className="min-w-7 shrink-0 text-right text-zinc-500">{frame.no}</span>
          <span className="w-2.5 shrink-0 text-severity-error">{frame.current ? '→' : ''}</span>
          <span className={cn('min-w-0 break-all', STACK_TONE[frame.tone])}>{frame.text}</span>
        </div>
      ))}
      {hiddenNote && (
        <div className="mt-2.5 border-zinc-800 border-t pt-2.5 text-zinc-500">{hiddenNote}</div>
      )}
    </div>
  )
}
