export type SavedSection = 'live-logs' | 'traces'

export type SaveViewProps = {
  section: SavedSection
  /** The page's whole search, restored verbatim when the view is opened. */
  params: Record<string, unknown>
  suggestion: string
}

export type SaveViewState = {
  isOpen: boolean
  name: string
  isSaving: boolean
  setOpen: (isOpen: boolean) => void
  setName: (name: string) => void
  save: () => Promise<void>
}
