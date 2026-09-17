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
}

export type SectionSearchInput = {
  tab?: number
} & SearchSchemaInput
