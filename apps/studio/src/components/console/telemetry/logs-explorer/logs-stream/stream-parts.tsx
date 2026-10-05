import { Button } from '@code-whiskers/ui/components/button'
import { Spinner } from '@code-whiskers/ui/components/spinner'
import { IconArrowUp } from '@tabler/icons-react'
import type { LogsStreamFooterProps, NewLinesPillProps } from './lib'

/** Arrives, doesn't jump: the stream stays put until the reader asks for what's new. */
export function NewLinesPill({ count, onShow }: NewLinesPillProps) {
  if (count === 0) return null
  return (
    <div className="pointer-events-none sticky top-14 z-20 flex h-0 justify-center">
      <button
        type="button"
        onClick={onShow}
        className="focus-ring pointer-events-auto mt-2 inline-flex h-7 animate-enter-up items-center gap-1.5 rounded-full border border-border bg-popover px-3 font-medium text-2xs text-foreground shadow-overlay transition-colors hover:bg-surface-hover"
      >
        <IconArrowUp className="size-3" stroke={2} />
        {count >= 200 ? '200+' : count.toLocaleString()} new {count === 1 ? 'line' : 'lines'}
      </button>
    </div>
  )
}

export function LogsStreamFooter({
  shown,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: LogsStreamFooterProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-gutter py-3 text-2xs text-faint">
      <span className="font-mono tabular-nums">
        {shown.toLocaleString()} {shown === 1 ? 'line' : 'lines'}, newest first
      </span>
      {hasMore && (
        <Button size="sm" variant="ghost" onClick={onLoadMore} disabled={isLoadingMore}>
          {isLoadingMore && <Spinner className="size-3.5" />}
          Load older lines
        </Button>
      )}
    </div>
  )
}
