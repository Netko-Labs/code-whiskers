import { cn } from '@code-whiskers/ui/lib/utils'
import { LOG_LEVEL_TEXT, type LogLinesProps } from './lib'

export function LogLines({ lines, className }: LogLinesProps) {
  return (
    <div className={cn('bg-zinc-950 px-4 py-3 font-mono text-xs leading-[19px]', className)}>
      {lines.map((line) => (
        <div
          key={`${line.time}-${line.message}`}
          className="grid gap-3"
          style={{ gridTemplateColumns: '96px 58px 1fr' }}
        >
          <span className="text-zinc-600">{line.time}</span>
          <span className={LOG_LEVEL_TEXT[line.level]}>{line.level}</span>
          <span className="text-zinc-400">{line.message}</span>
        </div>
      ))}
    </div>
  )
}
