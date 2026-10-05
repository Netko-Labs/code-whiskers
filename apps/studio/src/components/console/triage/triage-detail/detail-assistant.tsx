import type { TriageDetailProps } from '../lib'

/** Whiskers' one-paragraph read of the item: what it saw, in its words. */
export function DetailAssistant({ item }: TriageDetailProps) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="m-0 flex items-baseline gap-2 font-semibold text-foreground text-ui">
        Whiskers' read
        <span className="font-mono font-normal text-2xs text-muted-foreground">
          {item.confidence}
        </span>
      </h3>
      <p className="m-0 whitespace-pre-line text-body text-ui text-pretty">{item.read}</p>
    </section>
  )
}
