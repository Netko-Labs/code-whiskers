import { cn } from '@code-whiskers/ui/lib/utils'
import type { PersonAvatarProps } from './lib'

/** GitHub's avatar when studio has one, initials when it does not. */
export function PersonAvatar({ name, image, isSelf = false, className }: PersonAvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part: string) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return image ? (
    <img
      src={image}
      alt=""
      className={cn(
        'size-[26px] shrink-0 rounded-full border border-border object-cover',
        className,
      )}
    />
  ) : (
    <span
      className={cn(
        'flex size-[26px] shrink-0 items-center justify-center rounded-full font-semibold text-[9px]',
        isSelf ? 'bg-foreground text-primary-foreground' : 'bg-muted text-foreground',
        className,
      )}
    >
      {initials}
    </span>
  )
}
