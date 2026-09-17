import { cn } from '@code-whiskers/ui/lib/utils'
import type { DetailBannerProps } from '../lib'

const TONE = {
  ok: { wrap: 'bg-sev-ok/[0.07] text-sev-ok-ink', dot: 'bg-sev-ok' },
  info: { wrap: 'bg-sev-info/[0.07] text-sev-info-ink', dot: 'bg-sev-info' },
  warn: { wrap: 'bg-sev-warning/[0.08] text-sev-warning-ink', dot: 'bg-sev-warning' },
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
