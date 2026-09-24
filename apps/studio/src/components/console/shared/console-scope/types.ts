import type { ProjectScope } from '@/integrations/whiskers'

export type ConsoleScope = {
  value: string | null
  repository: string | null
  projectIds: ProjectScope
  label: string
}

export type ScopedSubject = {
  repository?: string | null
  projectId?: string | null
}
