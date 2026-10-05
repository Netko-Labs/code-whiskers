import { buttonVariants } from '@code-whiskers/ui/components/button'
import { useState } from 'react'
import { DataList, DataListSkeleton } from '@/components/shared/data-list'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import { Panel } from '@/components/shared/page'
import { ToolbarSearch } from '@/components/shared/toolbar'
import { SettingsPage } from '../shared/settings-ui'
import { filterMembers, MEMBER_SEARCH_FROM, useMemberDirectory } from './lib'
import { MemberRow } from './member-row'
import { MembersAccess } from './members-access'

export function SettingsMembers() {
  const directory = useMemberDirectory()
  const [query, setQuery] = useState('')
  const shown = filterMembers(directory.members, query)
  const count = directory.members.length

  return (
    <SettingsPage
      title="Members"
      description="Everyone who has signed in and shares a GitHub installation with you. Roles and access follow GitHub."
    >
      {directory.isError ? (
        <ErrorState size="inline" onRetry={directory.retry} />
      ) : directory.isLoading ? (
        <Panel isFlush>
          <DataListSkeleton rows={4} />
        </Panel>
      ) : count === 0 ? (
        <EmptyState
          size="inline"
          title="No members yet"
          description="Teammates appear here after they sign in with GitHub and belong to an installation."
          action={
            directory.installUrl && (
              <a
                href={directory.installUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ size: 'sm' })}
              >
                Install the GitHub App
              </a>
            )
          }
        />
      ) : (
        <Panel
          title={`${count} member${count === 1 ? '' : 's'}`}
          description="Last active is the latest session refresh; it moves at most once a day"
          actions={
            count > MEMBER_SEARCH_FROM && (
              <ToolbarSearch
                value={query}
                onValueChange={setQuery}
                placeholder="Filter members…"
                className="w-44"
              />
            )
          }
          isFlush
        >
          {shown.length === 0 ? (
            <EmptyState size="inline" expression="sleeping" title="No matches" />
          ) : (
            <DataList label="Members" isAnimated={!query} isDivided>
              {shown.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  isViewer={member.id === directory.viewerId}
                />
              ))}
            </DataList>
          )}
        </Panel>
      )}
      {directory.installations.length > 0 && (
        <MembersAccess installations={directory.installations} installUrl={directory.installUrl} />
      )}
    </SettingsPage>
  )
}
