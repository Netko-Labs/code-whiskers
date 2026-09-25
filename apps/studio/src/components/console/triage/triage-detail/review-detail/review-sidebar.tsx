import { Button } from '@code-whiskers/ui/components/button'
import { cn } from '@code-whiskers/ui/lib/utils'
import { formatAge } from '@/shared/format-date'
import { compactCount, type ReviewSidebarProps, reviewDuration, type SidebarRow } from './lib'
import { ReviewOutcome } from './review-outcome'
import { ReviewPushes } from './review-pushes'

const LINK = 'truncate underline-offset-2 hover:underline'

export function ReviewSidebar({ item, detail, open }: ReviewSidebarProps) {
  const { review } = detail
  const slug = item.repository ?? ''
  const commit = item.commit ?? review?.headSha
  const tokens =
    review && review.inputTokens !== null
      ? `${compactCount(review.inputTokens)} in · ${compactCount(review.outputTokens)} out`
      : null
  const rows: SidebarRow[] = [
    [
      'Repository',
      <a
        key="repo"
        href={`https://github.com/${slug}`}
        target="_blank"
        rel="noreferrer"
        className={LINK}
      >
        {slug}
      </a>,
    ],
    [
      'Pull request',
      item.url ? (
        <a key="pr" href={item.url} target="_blank" rel="noreferrer" className={LINK}>
          {item.handle} ↗
        </a>
      ) : (
        item.handle
      ),
    ],
    ['Author', item.author ?? '—'],
    [
      'Commit',
      commit ? (
        <a
          key="sha"
          href={`https://github.com/${slug}/commit/${commit}`}
          target="_blank"
          rel="noreferrer"
          className={cn(LINK, 'font-mono')}
        >
          {commit.slice(0, 7)}
        </a>
      ) : (
        '—'
      ),
    ],
    [
      'Diff',
      <span key="diff" className="font-mono">
        {item.diff ?? '—'}
      </span>,
    ],
    ['Reviewed', review ? `${formatAge(review.completedAt ?? review.createdAt)} ago` : item.age],
    ['Took', review ? reviewDuration(review) : '—'],
    [
      'Model',
      <span key="model" className="font-mono">
        {review?.model ?? item.confidence}
      </span>,
    ],
    ...(tokens
      ? [
          [
            'Tokens',
            <span key="tokens" className="font-mono">
              {tokens}
            </span>,
          ] satisfies SidebarRow,
        ]
      : []),
  ]

  return (
    <aside className="flex flex-col gap-4">
      <ReviewOutcome review={review} open={open} className="hidden @[720px]:flex" />

      <dl className="m-0 grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 gap-y-2 text-[12px]">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="m-0 min-w-0 truncate text-body">{value}</dd>
          </div>
        ))}
      </dl>

      <ReviewPushes pushes={detail.pushes} currentId={review?.id} />

      {review && (
        <Button variant="outline" size="sm" onClick={detail.rerun} className="w-full">
          Run the review again
        </Button>
      )}
    </aside>
  )
}
