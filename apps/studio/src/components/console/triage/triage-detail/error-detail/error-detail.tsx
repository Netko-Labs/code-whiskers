import { NO_EVENT_NOTE, type TriageDetailProps } from '../../lib'

/** An error with no whiskers issue behind it: what the item carries, and why there is no more. */
export function ErrorDetail({ item }: TriageDetailProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-border px-[18px] py-4">
      <span className="font-semibold text-[13px]">Event</span>
      {item.meta && <span className="font-mono text-[12px]">{item.meta}</span>}
      <span className="text-[12px] text-muted-foreground">{NO_EVENT_NOTE}</span>
    </div>
  )
}
