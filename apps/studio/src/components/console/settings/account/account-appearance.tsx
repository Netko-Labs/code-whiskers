import { useTheme } from '@code-whiskers/ui/components/theme'
import { cn } from '@code-whiskers/ui/lib/utils'
import { Panel, SettingRow } from '@/components/shared/page'
import { useMotionPreference } from '@/shared/motion'
import { MOTION_CHOICES, THEME_CHOICES } from './lib'
import { ThemeCard } from './theme-card'

/** Both stay in this browser: theme via next-themes, motion as `data-motion` on <html>. */
export function AccountAppearance() {
  const { theme, setTheme } = useTheme()
  const motion = useMotionPreference()

  return (
    <Panel title="Appearance" description="Saved in this browser" isFlush>
      <div className="flex flex-col gap-3 border-rule-soft border-b px-4 py-4">
        <span className="font-medium text-foreground text-ui">Theme</span>
        <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-3">
          {THEME_CHOICES.map((choice) => (
            <ThemeCard
              key={choice.value}
              choice={choice}
              isSelected={(theme ?? 'system') === choice.value}
              onSelect={() => setTheme(choice.value)}
            />
          ))}
        </div>
      </div>
      <SettingRow
        label="Motion"
        description={
          motion.isSystemReduced
            ? 'Your system asks for reduced motion, so the console is already still'
            : MOTION_CHOICES.find((choice) => choice.value === motion.preference)?.description
        }
      >
        <div
          role="radiogroup"
          aria-label="Motion"
          className="flex gap-0.5 rounded-md bg-muted p-0.5"
        >
          {MOTION_CHOICES.map((choice) => (
            <button
              type="button"
              role="radio"
              key={choice.value}
              aria-checked={motion.preference === choice.value}
              onClick={() => motion.setPreference(choice.value)}
              className={cn(
                'focus-ring rounded-[5px] px-2.5 py-1 font-medium text-2xs transition-colors duration-fast',
                motion.preference === choice.value
                  ? 'bg-background text-foreground shadow-raised'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {choice.label}
            </button>
          ))}
        </div>
      </SettingRow>
    </Panel>
  )
}
