import { type IssueTagsProps, tagShares } from '../lib'

/** Top values per tag key, as shares of the recent events that carried the key. */
export function IssueTags({ tags }: IssueTagsProps) {
  if (tags.length === 0) {
    return <p className="m-0 text-[13px] text-muted-foreground">No tags on recent events.</p>
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
      {tags.map((tag) => (
        <div
          key={tag.key}
          className="flex flex-col gap-1.5 rounded-[10px] border border-border px-3 py-2.5"
        >
          <span className="text-[11px] text-muted-foreground">{tag.key}</span>
          {tagShares(tag.values).map((share) => (
            <div key={share.value} className="flex flex-col gap-0.5">
              <div className="flex items-baseline justify-between gap-2 font-mono text-[12px]">
                <span className="truncate">{share.value}</span>
                <span className="shrink-0 text-muted-foreground tabular-nums">
                  {share.percent}%
                </span>
              </div>
              <span className="h-1 overflow-hidden rounded-full bg-fog dark:bg-ink-hairline">
                <span
                  className="block h-full rounded-full bg-severity-info/70"
                  style={{ width: `${share.percent}%` }}
                />
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
