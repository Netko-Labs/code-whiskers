import { IconFolders } from '@tabler/icons-react'
import { useState } from 'react'
import { Page, PageHeader, PageTabs } from '@/components/shared/page'
import { Toolbar, ToolbarSearch } from '@/components/shared/toolbar'
import { REPOSITORY_TABS, type RepositoryTab, useRepositoryList } from './lib'
import { RepositoriesActions } from './repositories-actions'
import { RepositoriesBody } from './repositories-body'

export function RepositoriesPage() {
  const [tab, setTab] = useState<RepositoryTab>('all')
  const [query, setQuery] = useState('')
  const state = useRepositoryList(tab, query)
  const hasRows = state.total > 0

  return (
    <Page>
      <PageHeader
        icon={<IconFolders stroke={1.75} />}
        title="Repositories"
        description="Everything the GitHub App can see. Whiskers reviews pull requests in the watched ones."
        actions={<RepositoriesActions installUrl={state.installUrl} />}
        tabs={
          hasRows && (
            <PageTabs
              label="Repository filter"
              items={REPOSITORY_TABS.map((item) => ({
                key: item.key,
                label: item.label,
                count: state.counts[item.key],
                isActive: tab === item.key,
                onSelect: () => setTab(item.key),
              }))}
            />
          )
        }
      />
      {hasRows && (
        <Toolbar>
          <ToolbarSearch
            value={query}
            onValueChange={setQuery}
            placeholder="Repository or language…"
            className="ml-auto"
          />
        </Toolbar>
      )}
      <RepositoriesBody state={state} isFiltered={!!query.trim()} />
    </Page>
  )
}
