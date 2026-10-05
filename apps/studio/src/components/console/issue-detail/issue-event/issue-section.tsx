import type { IssueSectionProps } from '../lib'

export function IssueSection({ title, meta, children }: IssueSectionProps) {
  return (
    <section className="flex min-w-0 flex-col gap-2.5">
      <div className="flex items-baseline gap-2">
        <h3 className="m-0 font-semibold text-[15px] tracking-[-0.01em]">{title}</h3>
        {meta && <span className="text-[12px] text-muted-foreground">{meta}</span>}
      </div>
      {children}
    </section>
  )
}
