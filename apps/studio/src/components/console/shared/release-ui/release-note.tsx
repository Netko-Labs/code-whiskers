import { cn } from '@code-whiskers/ui/lib/utils'
import type { ReleaseNoteProps } from './lib'

/** One quiet line where commits or deploys would be, saying why they are not. */
export function ReleaseNote({ children, className }: ReleaseNoteProps) {
  return <p className={cn('m-0 text-[12px] text-muted-foreground', className)}>{children}</p>
}
