import { cn } from '@code-whiskers/ui/lib/utils'
import { IconFolders, IconGavel, IconUser } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import {
  type FilterChipItem,
  FilterChips,
  FilterMenu,
  SortMenu,
  TOOLBAR_BUTTON,
  TOOLBAR_BUTTON_ACTIVE,
  Toolbar,
  ToolbarSearch,
  ToolbarSpacer,
} from '@/components/shared/toolbar'
import { VERDICT_META } from '../shared/review-model'
import {
  listOf,
  PULL_REQUEST_SORTS,
  type PullRequestSearch,
  type PullRequestsToolbarProps,
  toggledList,
  verdictsOf,
} from './lib'

/** Facets write the URL so a filtered list is shareable; the search box filters as you type. */
export function PullRequestsToolbar({ search, query, onQuery, state }: PullRequestsToolbarProps) {
  const navigate = useNavigate()
  const set = (patch: Partial<PullRequestSearch>) =>
    void navigate({
      to: '/console/pull-requests',
      search: (previous) => ({ ...previous, ...patch }),
      replace: true,
    })

  const chips: FilterChipItem[] = [
    ...listOf(search.repo).map((repo) => ({
      key: `repo:${repo}`,
      label: 'Repository',
      value: repo,
      onRemove: () => set({ repo: toggledList(search.repo, repo) }),
    })),
    ...verdictsOf(search.verdict).map((verdict) => ({
      key: `verdict:${verdict}`,
      label: 'Verdict',
      value: VERDICT_META[verdict].label,
      onRemove: () => set({ verdict: toggledList(search.verdict, verdict) }),
    })),
  ]
  const canFilterMine = !!state.viewerLogin

  return (
    <Toolbar>
      <FilterMenu
        label="Repository"
        icon={IconFolders}
        options={state.repoOptions}
        selected={listOf(search.repo)}
        onToggle={(repo) => set({ repo: toggledList(search.repo, repo) })}
      />
      <FilterMenu
        label="Verdict"
        icon={IconGavel}
        options={state.verdictOptions}
        selected={listOf(search.verdict)}
        onToggle={(verdict) => set({ verdict: toggledList(search.verdict, verdict) })}
      />
      <button
        type="button"
        aria-pressed={search.mine === '1'}
        disabled={!canFilterMine && !search.mine}
        title={
          canFilterMine
            ? `Pull requests opened by ${state.viewerLogin}`
            : 'Sign in with GitHub to see your own pull requests'
        }
        onClick={() => set({ mine: search.mine ? undefined : '1' })}
        className={cn(
          TOOLBAR_BUTTON,
          search.mine && TOOLBAR_BUTTON_ACTIVE,
          'disabled:pointer-events-none disabled:opacity-50',
        )}
      >
        <IconUser className="size-3.5" stroke={1.75} />
        Mine
      </button>
      <FilterChips chips={chips} onClearAll={() => set({ repo: undefined, verdict: undefined })} />
      <ToolbarSpacer />
      <ToolbarSearch value={query} onValueChange={onQuery} placeholder="Title, number, author…" />
      <SortMenu
        value={search.sort ?? 'activity'}
        options={PULL_REQUEST_SORTS}
        onValueChange={(sort) => set({ sort: sort === 'activity' ? undefined : sort })}
      />
    </Toolbar>
  )
}
