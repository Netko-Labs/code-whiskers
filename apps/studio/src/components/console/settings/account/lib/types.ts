import type { Viewer } from '@/integrations/studio-api'
import type { MotionPreference } from '@/shared/motion'

export type ThemeValue = 'system' | 'light' | 'dark'

export type ThemeChoice = {
  value: ThemeValue
  label: string
  /** Swatch classes: the page ground and the line of text drawn on it. */
  ground: string
  ink: string
}

export type MotionChoice = {
  value: MotionPreference
  label: string
  description: string
}

export type AccountProfile = {
  viewer: Viewer | undefined
  githubLogin: string | null
}

export type ChoiceCardProps = {
  choice: ThemeChoice
  isSelected: boolean
  onSelect: () => void
}
