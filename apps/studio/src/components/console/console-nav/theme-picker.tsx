import { useTheme } from '@code-whiskers/ui/components/theme'
import { cn } from '@code-whiskers/ui/lib/utils'
import { THEME_OPTIONS } from './lib'

export function ThemePicker() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-col gap-1.5 border-rule-soft border-t p-2.5">
      <span className="text-[11px] text-muted-foreground">Appearance</span>
      <div className="flex gap-[3px] rounded-[9px] bg-muted p-[3px]">
        {THEME_OPTIONS.map((option) => (
          <button
            type="button"
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={cn(
              'flex-1 rounded-[7px] py-[5px] text-center font-medium text-xs transition-colors',
              theme === option.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
