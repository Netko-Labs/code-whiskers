import { cn } from '@code-whiskers/ui/lib/utils'
import type { ChoiceCardProps } from './lib'

/** A thumbnail of the console in that theme: ground, a sidebar strip and two lines of text. */
export function ThemeCard({ choice, isSelected, onSelect }: ChoiceCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={onSelect}
      className={cn(
        'focus-ring group flex flex-col gap-2 rounded-lg text-left',
        isSelected ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <span
        className={cn(
          'relative flex h-16 w-full overflow-hidden rounded-lg border transition-[border-color,box-shadow] duration-fast',
          choice.ground,
          isSelected ? 'border-foreground shadow-raised' : 'border-border group-hover:border-ring',
        )}
      >
        <span className="w-1/4 border-hairline/20 border-r" />
        <span className="flex flex-1 flex-col gap-1.5 p-2.5">
          <span className={cn('h-1.5 w-3/4 rounded-full opacity-80', choice.ink)} />
          <span className={cn('h-1.5 w-1/2 rounded-full opacity-40', choice.ink)} />
        </span>
      </span>
      <span className="px-0.5 font-medium text-ui">{choice.label}</span>
    </button>
  )
}
