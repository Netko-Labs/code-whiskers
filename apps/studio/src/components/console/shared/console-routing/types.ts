import type { SearchSchemaInput } from '@tanstack/react-router'
import type { IssueSort } from '@/integrations/whiskers'
import type { TriageFilter } from '../console-model'

export type TriageSearch = {
  sel: string | undefined
  filter: TriageFilter
}

export type TriageSearchInput = {
  sel?: string
  filter?: TriageFilter
} & SearchSchemaInput

export type SectionSearch = {
  tab: number
  q?: string
  service?: string
  environment?: string
  release?: string
  sort?: IssueSort
  mine?: '1'
  project?: string
}

export type SectionSearchInput = {
  tab?: number
  q?: string
  service?: string
  environment?: string
  release?: string
  sort?: string
  mine?: string
  project?: string
} & SearchSchemaInput

export type ConsoleScopeSearch = {
  scope?: string
}

export type ConsoleScopeSearchInput = {
  scope?: string
} & SearchSchemaInput
