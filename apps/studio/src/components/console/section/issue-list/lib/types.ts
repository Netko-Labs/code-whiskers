import type {
  IssueListParams,
  IssueSort,
  IssueStatus,
  IssueStatusFilter,
  WhiskersIssue,
  WhiskersProject,
} from '@/integrations/whiskers'
import type { SectionFilters } from '../../../shared/console-model'
import type { IssueSectionView } from '../../lib'

export type IssueListProps = {
  section: IssueSectionView
  tab: number
  filters: SectionFilters
}

export type IssueTab = {
  label: string
  status: IssueStatusFilter
}

export type IssueListState = {
  rows: WhiskersIssue[]
  params: IssueListParams
  projectNames: Map<string, string>
  total: number
  /** No project at all: the list is replaced by the way to create one. */
  hasNoProjects: boolean
  /** The scope is one project that has sent nothing yet: its install guide stands in. */
  silentProject: WhiskersProject | null
  isLoading: boolean
  isUnreachable: boolean
  hasMore: boolean
  isLoadingMore: boolean
  loadMore: () => void
}

export type IssueCounts = Partial<Record<IssueStatusFilter, number>>

export type SelectionState = {
  ids: string[]
  anchor: string | null
}

/** `order` is the visible row order, so a shift-click range follows what the user sees. */
export type SelectionAction =
  | { kind: 'toggle'; id: string; isRange: boolean; order: string[] }
  | { kind: 'all'; ids: string[] }
  | { kind: 'clear' }
  | { kind: 'keep'; ids: string[] }

export type IssueSelection = {
  ids: Set<string>
  toggle: (id: string, isRange: boolean) => void
  toggleAll: () => void
  clear: () => void
}

export type IssueListToolbarProps = {
  section: IssueSectionView
  tab: number
  filters: SectionFilters
  params: IssueListParams
}

export type IssueFilterBarProps = {
  section: IssueSectionView
  tab: number
  filters: SectionFilters
}

export type FilterMenuProps = {
  label: string
  value: string | undefined
  options: string[]
  onPick: (value: string | undefined) => void
}

export type IssueFilterToggleProps = {
  label: string
  isOn: boolean
  onToggle: () => void
}

export type IssueSortMenuProps = {
  value: IssueSort
  onPick: (sort: IssueSort) => void
}

export type SortOption = {
  value: IssueSort
  label: string
}

export type FilterOptions = {
  environments: string[]
  releases: string[]
}

export type IssueListHeadProps = {
  selectedCount: number
  rowCount: number
  onToggleAll: () => void
}

export type IssueListRowProps = {
  issue: WhiskersIssue
  project: string
  hasStatus: boolean
  isSelected: boolean
  onToggle: (id: string, isRange: boolean) => void
}

export type IssueBulkPillProps = {
  issues: WhiskersIssue[]
  onDone: () => void
}

export type IssueListFooterProps = {
  shown: number
  total: number
  hasMore: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
}

export type StatusWords = Record<IssueStatus | 'all', string>
