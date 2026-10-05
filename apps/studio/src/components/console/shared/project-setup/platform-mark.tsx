import type { PlatformMarkProps } from './lib'

export function PlatformMark({ platform }: PlatformMarkProps) {
  const Icon = platform.icon
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-[7px] border border-border bg-background">
      {Icon ? (
        <Icon className="size-4" stroke={1.6} />
      ) : (
        <span className="font-mono font-semibold text-[10px]">{platform.badge}</span>
      )}
    </span>
  )
}
