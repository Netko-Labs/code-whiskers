import type { Icon } from '@tabler/icons-react'

export type PaletteGroup = 'Issues' | 'Go to' | 'Projects' | 'Actions'

export type PaletteCommand = {
  /** Unique and stable; cmdk keys selection by it. */
  id: string
  group: PaletteGroup
  label: string
  icon: Icon
  hint?: string
  keywords?: string[]
  shortcut?: string[]
  run: () => void
}

export type PaletteSection = {
  group: PaletteGroup
  commands: PaletteCommand[]
}
