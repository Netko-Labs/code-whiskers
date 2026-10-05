import type { MotionChoice, ThemeChoice } from './types'

export const THEME_CHOICES: ThemeChoice[] = [
  {
    value: 'system',
    label: 'System',
    ground: 'bg-[linear-gradient(135deg,var(--color-paper)_50%,var(--color-ink)_50%)]',
    ink: 'bg-ash',
  },
  { value: 'light', label: 'Light', ground: 'bg-paper', ink: 'bg-ink' },
  { value: 'dark', label: 'Dark', ground: 'bg-ink', ink: 'bg-paper' },
]

export const MOTION_CHOICES: MotionChoice[] = [
  { value: 'system', label: 'System', description: 'Follow the operating system setting' },
  { value: 'reduce', label: 'Reduce', description: 'No movement; changes appear at once' },
]
