import { STACK_TONE, type StackTraceProps } from './lib'

export function StackTrace({ title, frames, hiddenNote }: StackTraceProps) {
  return (
    <div className="dark flex-1 overflow-auto bg-zinc-950 px-4 py-3.5 font-mono text-xs leading-5 text-zinc-400">
      <div className="mb-1 text-zinc-50">{title}</div>
      {frames.map((frame, index) => (
        <div key={`${frame.no}-${index}`} className="flex gap-2.5">
          <span className="min-w-7 text-right text-zinc-600">{frame.no}</span>
          <span className="w-2.5 text-severity-error">{frame.current ? '→' : ''}</span>
          <span className={STACK_TONE[frame.tone]}>{frame.text}</span>
        </div>
      ))}
      {hiddenNote && (
        <div className="mt-2.5 border-zinc-800 border-t pt-2.5 text-zinc-600">{hiddenNote}</div>
      )}
    </div>
  )
}
