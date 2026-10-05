import { cn } from '@code-whiskers/ui/lib/utils'
import { LOG_LEVEL_TEXT, type LogLinesProps } from './lib'

export function LogLines({ lines, className }: LogLinesProps) {
  return (
    <div className={cn('dark bg-canvas px-4 py-3 font-mono text-xs leading-[19px]', className)}>
      {lines.map((line, index) => (
        <div
          key={`${line.time}-${line.message}-${index}`}
          className="grid gap-3"
          style={{ gridTemplateColumns: '96px 58px 1fr' }}
        >
          <span className="text-faint">{line.time}</span>
          <span className={LOG_LEVEL_TEXT[line.level]}>{line.level}</span>
          <span className="min-w-0 break-all text-muted-foreground">{line.message}</span>
        </div>
      ))}
    </div>
  )
}
