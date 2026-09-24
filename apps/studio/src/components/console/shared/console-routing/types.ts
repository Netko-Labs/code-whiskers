import type { SearchSchemaInput } from '@tanstack/react-router'
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
}

export type SectionSearchInput = {
  tab?: number
  q?: string
  service?: string
} & SearchSchemaInput

export type ConsoleScopeSearch = {
  scope?: string
}

export type ConsoleScopeSearchInput = {
  scope?: string
} & SearchSchemaInput
