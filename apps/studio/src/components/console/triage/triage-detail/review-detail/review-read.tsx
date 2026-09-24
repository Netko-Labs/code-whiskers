import { CatExpression } from '@code-whiskers/ui/brand'
import { useState } from 'react'
import { READ_PREVIEW_BULLETS, type ReviewReadProps, readBullets } from './lib'

export function ReviewRead({ item }: ReviewReadProps) {
  const [isExpanded, setExpanded] = useState(false)
  const bullets = readBullets(item.read)
  const hidden = bullets.length - READ_PREVIEW_BULLETS
  const shown = isExpanded || hidden <= 1 ? bullets : bullets.slice(0, READ_PREVIEW_BULLETS)

  return (
    <section className="flex items-start gap-3 rounded-xl border border-border bg-surface-subtle px-4 py-3.5">
      <CatExpression expression="thinking" crop size={38} className="shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-baseline gap-2">
          <h3 className="m-0 font-semibold text-[13px]">What changed</h3>
          <span className="font-mono text-[11px] text-muted-foreground">{item.confidence}</span>
        </div>
        {bullets.length > 1 ? (
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {shown.map((bullet) => (
              <li key={bullet} className="flex gap-2 text-[13px] text-body leading-[19px]">
                <span className="mt-[7px] size-1 shrink-0 rounded-full bg-muted-foreground" />
                <span className="text-pretty">{bullet}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-[13px] text-body leading-[19px] text-pretty">{bullets[0]}</p>
        )}
        {hidden > 1 && (
          <button
            type="button"
            onClick={() => setExpanded(!isExpanded)}
            className="self-start text-[12px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {isExpanded ? 'Show less' : `Show ${hidden} more`}
          </button>
        )}
      </div>
    </section>
  )
}
