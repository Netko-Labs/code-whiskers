export type ScopeChoice = {
  value: string | null
  kind: 'all' | 'repository' | 'project'
  label: string
  detail: string
  count: number
}

export type ScopeChoices = {
  repositories: ScopeChoice[]
  projects: ScopeChoice[]
  all: ScopeChoice
  current: ScopeChoice
  pick: (value: string | null) => void
}

export type ScopePickerProps = {
  className?: string
}
