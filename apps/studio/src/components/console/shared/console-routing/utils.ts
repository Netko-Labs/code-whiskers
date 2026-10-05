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
const FILTERS: TriageFilter[] = ['all', 'errors', 'reviews', 'logs']

export function parseTriageBucket(value: string): TriageBucket {
  return BUCKETS.find((bucket) => bucket === value) ?? 'inbox'
}

export function toSectionView(value: string): SectionScreenView | undefined {
  return SECTION_VIEWS.find((view) => view === value)
}

export function parseTriageSearch(search: TriageSearchInput): TriageSearch {
  return {
    sel: typeof search.sel === 'string' ? search.sel : undefined,
    filter: FILTERS.find((candidate) => candidate === search.filter) ?? 'all',
  }
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 200) : undefined
}

export function parseSectionTab(search: SectionSearchInput): SectionSearch {
  const tab = Number(search.tab)
  return {
    tab: Number.isInteger(tab) && tab >= 0 ? tab : 0,
    q: text(search.q),
    service: text(search.service),
    environment: text(search.environment),
    release: text(search.release),
    sort: ISSUE_SORTS.find((sort) => sort === search.sort),
    mine: search.mine === '1' ? '1' : undefined,
  }
}

export function parseConsoleScope(search: ConsoleScopeSearchInput): ConsoleScopeSearch {
  return { scope: text(search.scope) }
}
