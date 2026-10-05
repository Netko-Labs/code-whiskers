import type { MenuOption } from '@/components/shared/toolbar'
import {
  blockerCount,
  type PullRequestSummary,
  type PullRequestVerdict,
  VERDICT_META,
  VERDICT_ORDER,
} from '../../shared/review-model'
import type {
  PullRequestFilter,
  PullRequestSearch,
  PullRequestSearchInput,
  PullRequestSort,
} from './types'
import { LIST_SEPARATOR, SORT_VALUES } from './values'

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 400) : undefined
}

export function parsePullRequestSearch(search: PullRequestSearchInput): PullRequestSearch {
  return {
    repo: text(search.repo),
    verdict: text(search.verdict),
    mine: search.mine === '1' ? '1' : undefined,
    sort: SORT_VALUES.find((sort) => sort === search.sort),
  }
}

export function listOf(value: string | undefined): string[] {
  return value ? value.split(LIST_SEPARATOR).filter(Boolean) : []
}

/** The URL keeps a facet as one comma list; an emptied facet drops out of the URL. */
export function toggledList(value: string | undefined, item: string): string | undefined {
  const list = listOf(value)
  const next = list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]
  return next.length ? next.join(LIST_SEPARATOR) : undefined
}

export function verdictsOf(value: string | undefined): PullRequestVerdict[] {
  return listOf(value).filter((entry): entry is PullRequestVerdict =>
    VERDICT_ORDER.includes(entry as PullRequestVerdict),
  )
}

export function filterPullRequests(
  rows: PullRequestSummary[],
  filter: PullRequestFilter,
): PullRequestSummary[] {
  const needle = filter.query.trim().toLowerCase()
  const repos = filter.repos.map((repo) => repo.toLowerCase())
  return rows.filter(
    (row) =>
      (repos.length === 0 || repos.includes(row.slug.toLowerCase())) &&
      (filter.verdicts.length === 0 || filter.verdicts.includes(row.verdict)) &&
      (!filter.author || row.author?.toLowerCase() === filter.author.toLowerCase()) &&
      (!needle ||
        `${row.slug}#${row.prNumber} ${row.title ?? ''} ${row.author ?? ''} ${row.latest.headRef ?? ''}`
          .toLowerCase()
          .includes(needle)),
  )
}

const SORTERS: Record<PullRequestSort, (a: PullRequestSummary, b: PullRequestSummary) => number> = {
  activity: (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime(),
  blockers: (a, b) => blockerCount(b.counts) - blockerCount(a.counts),
  findings: (a, b) => b.findingCount - a.findingCount,
  pushes: (a, b) => b.pushes - a.pushes,
}

/** Ties fall back to recency, so equal rows never shuffle between renders. */
export function sortPullRequests(
  rows: PullRequestSummary[],
  sort: PullRequestSort,
): PullRequestSummary[] {
  return [...rows].sort((a, b) => SORTERS[sort](a, b) || SORTERS.activity(a, b))
}

export function repoOptions(rows: PullRequestSummary[]): MenuOption[] {
  const counts = new Map<string, number>()
  for (const row of rows) counts.set(row.slug, (counts.get(row.slug) ?? 0) + 1)
  return [...counts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([slug, count]) => ({ value: slug, label: slug, count }))
}

export function verdictOptions(rows: PullRequestSummary[]): MenuOption[] {
  return VERDICT_ORDER.map((verdict) => ({
    value: verdict,
    label: VERDICT_META[verdict].label,
    count: rows.filter((row) => row.verdict === verdict).length,
  }))
}
