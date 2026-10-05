import { Kbd, KbdGroup } from '@code-whiskers/ui/components/kbd'
import { cn } from '@code-whiskers/ui/lib/utils'
import { keyLabel, type ShortcutProps, useIsMac } from './lib'

export function Shortcut({ keys, className }: ShortcutProps) {
  const isMac = useIsMac()

  return (
    <KbdGroup className={cn('shrink-0', className)}>
      {keys.map((key) => (
        <Kbd key={key} className="min-w-[18px] px-1 font-mono text-[10px]">
          {keyLabel(key, isMac)}
        </Kbd>
      ))}
    </KbdGroup>
  )
}
