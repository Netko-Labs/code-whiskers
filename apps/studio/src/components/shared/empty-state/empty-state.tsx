import { CatExpression } from '@code-whiskers/ui/brand'
import { cn } from '@code-whiskers/ui/lib/utils'
import { usePrefersReducedMotion } from '@/shared/motion'
import { CAT_SIZE, type EmptyStateProps } from './lib'

/** Sits on the page background: the cat's paper is the background token. */
export function EmptyState({
  title,
  description,
  expression = 'idle',
  illustration,
  action,
  secondary,
  size = 'page',
  className,
  children,
}: EmptyStateProps) {
  const isReduced = usePrefersReducedMotion()
  const isPage = size === 'page'

  return (
    <div
      className={cn(
        'flex animate-enter-up flex-col items-center justify-center text-center',
        isPage ? 'min-h-[320px] flex-1 gap-5 px-6 py-16' : 'gap-3 px-4 py-10',
        className,
      )}
    >
      {illustration ?? (
        <CatExpression
          expression={expression}
          animated={isPage && !isReduced}
          size={CAT_SIZE[size]}
          ink="var(--foreground)"
          paper="var(--background)"
          crop
        />
      )}
      <div className="flex max-w-[400px] flex-col gap-1.5">
        <h2 className="m-0 font-semibold text-[15px] text-foreground leading-[22px]">{title}</h2>
        {description && (
          <p className="m-0 text-pretty text-muted-foreground text-ui">{description}</p>
        )}
      </div>
      {(action || secondary) && (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {action}
          {secondary}
        </div>
      )}
      {children}
    </div>
  )
}
