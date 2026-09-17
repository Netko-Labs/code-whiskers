import type { IssueTag } from '../../../shared/console-model'

export function ErrorTags({ tags }: { tags: IssueTag[] }) {
  return (
    <div className="grid flex-1 grid-cols-2 content-start gap-2.5 overflow-auto p-4">
      {tags.map((tag) => (
        <div
          key={tag.key}
          className="flex flex-col gap-[3px] rounded-[10px] border border-border px-3 py-[9px]"
        >
          <span className="text-[11px] text-muted-foreground">{tag.key}</span>
          <span className="font-medium font-mono text-xs">{tag.value}</span>
        </div>
      ))}
    </div>
  )
}
