import { useTheme } from '@code-whiskers/ui/components/theme'
import { cn } from '@code-whiskers/ui/lib/utils'
import { THEME_OPTIONS } from './lib'

export function ThemePicker() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center justify-between gap-3 px-2 py-1.5">
      <span className="text-muted-foreground text-ui">Theme</span>
      <div role="radiogroup" aria-label="Theme" className="flex gap-0.5 rounded-md bg-muted p-0.5">
        {THEME_OPTIONS.map((option) => (
          <button
            type="button"
            role="radio"
            aria-checked={theme === option.value}
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={cn(
              'focus-ring rounded-[5px] px-2 py-0.5 font-medium text-2xs transition-colors duration-fast',
              theme === option.value
                ? 'bg-background text-foreground shadow-raised'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
