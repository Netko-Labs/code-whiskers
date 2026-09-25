import { useState } from 'react'
import { READ_PREVIEW_BULLETS, type ReviewReadProps, readBullets } from './lib'

export function ReviewRead({ item }: ReviewReadProps) {
  const [isExpanded, setExpanded] = useState(false)
  const bullets = readBullets(item.read)
  const hidden = bullets.length - READ_PREVIEW_BULLETS
  const shown = isExpanded || hidden <= 1 ? bullets : bullets.slice(0, READ_PREVIEW_BULLETS)

  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="m-0 flex items-baseline gap-2 font-semibold text-[15px] tracking-[-0.01em]">
        What changed
        <span className="font-mono font-normal text-[11px] text-muted-foreground">
          {item.confidence}
        </span>
      </h3>
      {bullets.length > 1 ? (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {shown.map((bullet) => (
            <li key={bullet} className="flex gap-2.5 text-[13.5px] text-body leading-[21px]">
              <span className="mt-[9px] size-1 shrink-0 rounded-full bg-faint" />
              <span className="text-pretty">{bullet}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-[13.5px] text-body leading-[21px] text-pretty">{bullets[0]}</p>
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
    </section>
  )
}
