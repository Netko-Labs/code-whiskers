import { Button } from '@code-whiskers/ui/components/button'
import { LiveDot } from '@/components/shared/status'
import type { ExplorerPartProps } from './lib'

/** Tailing slides the window to now; a pinned window has nothing to tail, so it unpins. */
export function LiveToggle({ explorer }: ExplorerPartProps) {
  const { isLive, update } = explorer

  return (
    <Button
      size="sm"
      variant="outline"
      aria-pressed={isLive}
      onClick={() => update({ live: !isLive || undefined, from: undefined, to: undefined })}
      className={isLive ? 'border-severity-resolved/40' : undefined}
    >
      <LiveDot isLive={isLive} label={isLive ? 'Live' : 'Live tail'} />
    </Button>
  )
}
