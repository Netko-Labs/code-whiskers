import { buttonVariants } from '@code-whiskers/ui/components/button'
import { IconPlus } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { DataList, DataListHeader, DataListSkeleton } from '@/components/shared/data-list'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import { Page, PageHeader } from '@/components/shared/page'
import { Toolbar, ToolbarSearch, ToolbarSpacer } from '@/components/shared/toolbar'
import { filterProjects, useProjectsIndex } from './lib'
import { ProjectRow } from './project-row'

/** Every error-tracking project; each row opens its settings, keys and setup guide. */
export function ProjectsIndexPage() {
  const index = useProjectsIndex()
  const [query, setQuery] = useState('')
  const shown = filterProjects(index.projects, query)
  const { totals } = index

  return (
    <Page>
      <PageHeader
        title="Projects"
        description="A project gives an app a DSN; its errors, logs and traces land under it."
        meta={
          totals.projects > 0 && (
            <span className="animate-enter font-mono tabular-nums">
              {totals.projects} projects · {totals.issues.toLocaleString()} issues
              {totals.silent > 0 && ` · ${totals.silent} waiting for a first event`}
            </span>
          )
        }
        actions={
          <Link to="/console/projects/new" className={buttonVariants({ size: 'sm' })}>
            <IconPlus stroke={2} />
            New project
          </Link>
        }
      />
      {index.isError ? (
        <ErrorState onRetry={index.retry} description="Whiskers did not answer the project list." />
      ) : index.isLoading ? (
        <DataListSkeleton rows={4} density="auto" />
      ) : totals.projects === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Pick a platform, get a DSN and a snippet with it filled in, then watch the first error arrive."
          action={
            <Link to="/console/projects/new" className={buttonVariants({ size: 'sm' })}>
              Set up a project
            </Link>
          }
        />
      ) : (
        <>
          <Toolbar>
            <ToolbarSpacer />
            <ToolbarSearch value={query} onValueChange={setQuery} placeholder="Filter projects…" />
          </Toolbar>
          <DataListHeader>
            <span className="w-4" />
            <span className="flex-1">Project</span>
            <span className="hidden w-16 text-right sm:block">Keys</span>
            <span className="w-20 text-right">Issues</span>
            <span className="w-24 text-right">Last event</span>
          </DataListHeader>
          {shown.length === 0 ? (
            <EmptyState size="inline" expression="sleeping" title="No matches" />
          ) : (
            <DataList label="Projects" isAnimated={!query} isDivided>
              {shown.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))}
            </DataList>
          )}
          <p className="m-0 px-gutter py-3 text-2xs text-faint">
            Sorted by last event · open a project for its DSN, client keys and setup guide
          </p>
        </>
      )}
    </Page>
  )
}
