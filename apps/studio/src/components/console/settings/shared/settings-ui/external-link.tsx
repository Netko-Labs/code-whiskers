import { cn } from '@code-whiskers/ui/lib/utils'
import { IconArrowUpRight } from '@tabler/icons-react'
import type { ExternalLinkProps } from './lib'

/** Leaves CodeWhiskers, usually for GitHub; always a new tab. */
export function ExternalLink({ href, children, className }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'focus-ring inline-flex items-center gap-0.5 rounded-sm text-foreground underline-offset-4 hover:underline',
        className,
      )}
    >
      {children}
      <IconArrowUpRight className="size-3.5 text-muted-foreground" stroke={1.75} />
    </a>
  )
}
