import { Button } from '@code-whiskers/ui/components/button'
import type { IssueListFooterProps } from './lib'

export function IssueListFooter({
  shown,
  total,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: IssueListFooterProps) {
  if (shown === 0) return null

  return (
    <div className="flex items-center gap-3 px-8 py-5 text-[12px] text-faint">
      <span className="font-mono tabular-nums">
        {shown.toLocaleString()} of {Math.max(total, shown).toLocaleString()}
      </span>
      {hasMore && (
        <Button variant="outline" size="xs" disabled={isLoadingMore} onClick={onLoadMore}>
          {isLoadingMore ? 'Loading…' : 'Load more'}
        </Button>
      )}
    </div>
  )
}
