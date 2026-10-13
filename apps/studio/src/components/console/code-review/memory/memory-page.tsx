import { Button } from '@code-whiskers/ui/components/button'
import { IconBrain, IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { Page, PageHeader, PageTabs } from '@/components/shared/page'
import { MEMORY_TABS, type MemoryTab, type NoteDraft, newDraft, useMemory } from './lib'
import { MemoryActivityList } from './memory-activity'
import { MemoryBody } from './memory-body'
import { MemoryNoteDialog } from './memory-note-dialog'

export function MemoryPage() {
  const [tab, setTab] = useState<MemoryTab>('all')
  const [draft, setDraft] = useState<NoteDraft | null>(null)
  const state = useMemory()
  const canWrite = state.organizations.length > 0
  const hasNotes = state.notes.length > 0

  return (
    <Page>
      <PageHeader
        icon={<IconBrain stroke={1.75} />}
        title="Memory"
        description="What Whiskers knows about your code. Write it like you would brief a new teammate; Whiskers adds what it learns, and any change can be undone."
        actions={
          canWrite &&
          hasNotes && (
            <Button size="sm" onClick={() => setDraft(newDraft(state.organizations))}>
              <IconPlus stroke={1.75} />
              Add a note
            </Button>
          )
        }
        tabs={
          hasNotes && (
            <PageTabs
              label="Memory filter"
              items={MEMORY_TABS.map((item) => ({
                key: item.key,
                label: item.label,
                count: item.key === 'activity' ? undefined : state.counts[item.key],
                isActive: tab === item.key,
                onSelect: () => setTab(item.key),
              }))}
            />
          )
        }
      />
      {tab === 'activity' ? (
        <MemoryActivityList />
      ) : (
        <MemoryBody state={state} tab={tab} onEdit={setDraft} />
      )}
      <MemoryNoteDialog
        draft={draft}
        organizations={state.organizations}
        repositories={state.repositories}
        onClose={() => setDraft(null)}
      />
    </Page>
  )
}
