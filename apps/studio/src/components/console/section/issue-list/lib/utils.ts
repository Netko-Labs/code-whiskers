import type { TriageRecord } from '@/integrations/studio-api'
import type {
  IssueListParams,
  IssueStatusFilter,
  ProjectScope,
  WhiskersIssue,
  WhiskersRelease,
} from '@/integrations/whiskers'
import type { SectionFilters } from '../../../shared/console-model'
import type { IssueSectionView } from '../../lib'
import type { FilterOptions, SelectionAction, SelectionState } from './types'
import { ISSUE_TABS } from './values'

export const EMPTY_SELECTION: SelectionState = { ids: [], anchor: null }

function rangeOf(order: string[], from: string, to: string): string[] {
  const start = order.indexOf(from)
  const end = order.indexOf(to)
  if (start === -1 || end === -1) return [to]
  return order.slice(Math.min(start, end), Math.max(start, end) + 1)
}

/** Click toggles one row; shift-click selects every row between the last click and this one. */
export function selectionReducer(state: SelectionState, action: SelectionAction): SelectionState {
  if (action.kind === 'clear') return state.ids.length === 0 ? state : EMPTY_SELECTION
  if (action.kind === 'all') {
    const isAll = action.ids.length > 0 && action.ids.every((id) => state.ids.includes(id))
    return isAll ? EMPTY_SELECTION : { ids: [...action.ids], anchor: null }
  }
  if (action.kind === 'keep') {
    const kept = state.ids.filter((id) => action.ids.includes(id))
    return kept.length === state.ids.length ? state : { ...state, ids: kept }
  }
  const { id, isRange, order } = action
  if (isRange && state.anchor) {
    const range = rangeOf(order, state.anchor, id)
    return { ids: [...new Set([...state.ids, ...range])], anchor: id }
  }
  const ids = state.ids.includes(id)
    ? state.ids.filter((other) => other !== id)
    : [...state.ids, id]
  return { ids, anchor: id }
}

export function statusForTab(section: IssueSectionView, tab: number): IssueStatusFilter {
  if (section === 'regressions') return 'unresolved'
  return ISSUE_TABS[tab]?.status ?? 'unresolved'
}

/** The viewer's issues, as whiskers ids; studio owns assignees, so the list asks by id. */
export function assignedIssueIds(records: Map<string, TriageRecord>, viewerId: string | undefined) {
  if (!viewerId) return []
  return [...records.values()]
    .filter((record) => record.itemKind === 'issue' && record.assigneeUserId === viewerId)
    .map((record) => record.itemRef)
}

export function issueListParams(
  status: IssueStatusFilter,
  filters: SectionFilters,
  projectIds: ProjectScope,
  mineIds: string[] | undefined,
): IssueListParams {
  return {
    projectIds,
    status,
    environment: filters.environment,
    release: filters.release,
    q: filters.q,
    sort: filters.sort ?? 'last_seen',
    ids: mineIds,
  }
}

/**
 * Rows that still belong on this view: an optimistic resolve leaves the Unresolved tab at once,
 * and Regressions keeps only what whiskers badged as regressed.
 */
export function visibleIssues(
  issues: WhiskersIssue[],
  status: IssueStatusFilter,
  section: IssueSectionView,
): WhiskersIssue[] {
  return issues.filter(
    (issue) =>
      (status === 'all' || issue.status === status) &&
      (section !== 'regressions' || issue.badges.includes('regressed')),
  )
}

/** The fixture answers the same filters the server would, so the sample list behaves. */
export function sampleRows(issues: WhiskersIssue[], params: IssueListParams): WhiskersIssue[] {
  const needle = params.q?.toLowerCase()
  return issues.filter((issue) => !needle || issue.title.toLowerCase().includes(needle))
}

export function filterOptions(releases: WhiskersRelease[]): FilterOptions {
  const newest = [...releases].sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime())
  return {
    environments: [
      ...new Set(newest.flatMap((release) => (release.environment ? [release.environment] : []))),
    ],
    releases: [...new Set(newest.map((release) => release.release))],
  }
}
