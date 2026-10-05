import { ISSUE_SORTS } from '@/integrations/whiskers'
import { SECTION_VIEWS, type SectionScreenView } from '../../section/lib'
import type { TriageBucket, TriageFilter } from '../console-model'
import type {
  ConsoleScopeSearch,
  ConsoleScopeSearchInput,
  SectionSearch,
  SectionSearchInput,
  TriageSearch,
  TriageSearchInput,
} from './types'

const BUCKETS: TriageBucket[] = ['inbox', 'assigned', 'snoozed']
const FILTERS: TriageFilter[] = ['all', 'errors', 'reviews', 'logs', 'alerts']

export function parseTriageBucket(value: string): TriageBucket {
  return BUCKETS.find((bucket) => bucket === value) ?? 'inbox'
}

export function toSectionView(value: string): SectionScreenView | undefined {
  return SECTION_VIEWS.find((view) => view === value)
}

export function parseTriageSearch(search: TriageSearchInput): TriageSearch {
  return {
    sel: searchText(search.sel),
    filter: FILTERS.find((candidate) => candidate === search.filter) ?? 'all',
  }
}

/** The router JSON-parses search values, so a project id like `1` arrives as a number. */
export function searchText(value: unknown): string | undefined {
  const raw = typeof value === 'number' && Number.isFinite(value) ? String(value) : value
  return typeof raw === 'string' && raw.trim() ? raw.trim().slice(0, 200) : undefined
}

export function parseSectionTab(search: SectionSearchInput): SectionSearch {
  const tab = Number(search.tab)
  return {
    tab: Number.isInteger(tab) && tab >= 0 ? tab : 0,
    q: searchText(search.q),
    service: searchText(search.service),
    environment: searchText(search.environment),
    release: searchText(search.release),
    sort: ISSUE_SORTS.find((sort) => sort === search.sort),
    mine: searchText(search.mine) === '1' ? '1' : undefined,
    project: searchText(search.project),
  }
}

export function parseConsoleScope(search: ConsoleScopeSearchInput): ConsoleScopeSearch {
  return { scope: searchText(search.scope) }
}
