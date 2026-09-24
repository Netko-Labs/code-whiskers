import { Popover, PopoverContent, PopoverTrigger } from '@code-whiskers/ui/components/popover'
import { cn } from '@code-whiskers/ui/lib/utils'
import { IconBox, IconBrandGithub, IconCheck, IconSelector, IconStack2 } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { type ScopeChoice, type ScopePickerProps, useScopeChoices } from './lib'

const ICON = { all: IconStack2, repository: IconBrandGithub, project: IconBox } as const
const SEARCHABLE_FROM = 7

function matches(choice: ScopeChoice, query: string): boolean {
  const needle = query.trim().toLowerCase()
  return !needle || `${choice.label} ${choice.detail}`.toLowerCase().includes(needle)
}

export function ScopePicker({ className }: ScopePickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { repositories, projects, all, current, pick } = useScopeChoices()
  const CurrentIcon = ICON[current.kind]

  function choose(value: string | null) {
    setOpen(false)
    setQuery('')
    pick(value)
  }

  function row(choice: ScopeChoice) {
    const Icon = ICON[choice.kind]
    const isCurrent = (choice.value ?? '') === (current.value ?? '')
    return (
      <button
        type="button"
        key={choice.value ?? 'all'}
        onClick={() => choose(choice.value)}
        className="flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-left hover:bg-rule-soft"
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" stroke={1.75} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium text-[13px]">{choice.label}</span>
          <span className="truncate font-mono text-[10.5px] text-muted-foreground">
            {choice.detail}
          </span>
        </span>
        {choice.count > 0 && (
          <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
            {choice.count}
          </span>
        )}
        <IconCheck className={cn('size-3.5 shrink-0', !isCurrent && 'invisible')} />
      </button>
    )
  }

  const shownRepositories = repositories.filter((choice) => matches(choice, query))
  const shownProjects = projects.filter((choice) => matches(choice, query))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'flex h-8 min-w-0 items-center gap-2 rounded-[10px] border border-border bg-background px-2.5 text-[13px] shadow-sm transition-colors hover:bg-surface-subtle aria-expanded:border-ring',
          current.value && 'border-foreground/40',
          className,
        )}
      >
        <CurrentIcon className="size-4 shrink-0 text-muted-foreground" stroke={1.75} />
        <span className="min-w-0 truncate font-medium">
          {current.kind === 'all' ? 'All repos' : current.label}
        </span>
        <IconSelector className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent align="start" sideOffset={6} className="w-[300px] gap-0 p-1.5">
        {repositories.length + projects.length >= SEARCHABLE_FROM && (
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a repository…"
            aria-label="Find a repository"
            className="mx-1 mt-1 mb-1.5 h-8 rounded-lg border border-border bg-transparent px-2.5 text-[13px] outline-none placeholder:text-faint focus-visible:border-ring"
          />
        )}
        <div className="flex max-h-[360px] flex-col overflow-auto">
          {!query && row(all)}
          {shownRepositories.length > 0 && (
            <span className="px-2.5 pt-2 pb-1 text-[11px] text-muted-foreground">Repositories</span>
          )}
          {shownRepositories.map(row)}
          {shownProjects.length > 0 && (
            <span className="px-2.5 pt-2 pb-1 text-[11px] text-muted-foreground">
              Projects without a repository
            </span>
          )}
          {shownProjects.map(row)}
          {shownRepositories.length + shownProjects.length === 0 && query && (
            <span className="px-2.5 py-2 text-[12px] text-muted-foreground">No match.</span>
          )}
        </div>
        {projects.length > 0 && (
          <>
            <div className="my-[5px] h-px bg-rule-soft" />
            <Link
              to="/console/$section"
              params={{ section: 'integrations' }}
              search={{ tab: 1 }}
              onClick={() => setOpen(false)}
              className="rounded-lg px-2.5 py-[7px] text-[12px] text-body hover:bg-rule-soft"
            >
              Link a project to its repository →
            </Link>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
