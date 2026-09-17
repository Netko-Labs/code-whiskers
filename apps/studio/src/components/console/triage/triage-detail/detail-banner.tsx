import { cn } from '@code-whiskers/ui/lib/utils'
import type { DetailBannerProps } from '../lib'

const TONE = {
  ok: {
    wrap: 'bg-severity-resolved/[0.07] text-severity-resolved-ink',
    dot: 'bg-severity-resolved',
  },
  info: { wrap: 'bg-severity-info/[0.07] text-severity-info-ink', dot: 'bg-severity-info' },
  warn: {
    wrap: 'bg-severity-warning/[0.08] text-severity-warning-ink',
    dot: 'bg-severity-warning',
  },
} as const

export function DetailBanner({ banner }: DetailBannerProps) {
  const tone = TONE[banner.tone]

  return (
    <div
      className={cn('flex items-center gap-2.5 border-border border-b px-6 py-[11px]', tone.wrap)}
    >
      <span className={cn('size-[7px] rounded-full', tone.dot)} />
      <span className="font-medium text-[13px]">{banner.message}</span>
      <span className="ml-auto text-muted-foreground text-xs">{banner.meta}</span>
    </div>
  )
}
