import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  createMemoryNote,
  deleteMemoryNote,
  type MemoryNote,
  memoryActivityQuery,
  memoryQuery,
  updateMemoryNote,
} from '@/integrations/studio-api'
import { useConsoleStore } from '../../../../use-console-store'
import type { MemoryActions, NoteDraft } from '../types'
import { inputOf } from '../utils'

/** Notes are the team's; the next review reads a change within a minute. */
export function useMemoryActions(): MemoryActions {
  const queryClient = useQueryClient()

  return useMemo(() => {
    const refresh = () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: memoryQuery().queryKey }),
        queryClient.invalidateQueries({ queryKey: memoryActivityQuery().queryKey }),
      ])
    const flash = (message: string, onUndo?: () => void) =>
      useConsoleStore.getState().flash(message, onUndo)
    const fail = (error: Error) => flash(error.message)

    return {
      save: async (draft: NoteDraft) => {
        const { installationId: _installation, ...patch } = inputOf(draft)
        if (draft.id) await updateMemoryNote(draft.id, patch)
        else await createMemoryNote(inputOf(draft))
        await refresh()
        flash(
          draft.id
            ? 'Note updated; the next review reads it'
            : 'Note saved; the next review reads it',
        )
      },
      toggleRetired: (note: MemoryNote) => {
        const status = note.status === 'retired' ? 'active' : 'retired'
        updateMemoryNote(note.id, { status })
          .then(refresh)
          .then(() =>
            flash(
              status === 'active' ? 'Note is back in use' : 'Note retired; reviews stop reading it',
              () => void updateMemoryNote(note.id, { status: note.status }).then(refresh),
            ),
          )
          .catch(fail)
      },
      remove: (note: MemoryNote) => {
        deleteMemoryNote(note.id)
          .then(refresh)
          .then(() => flash('Note deleted; undo it from Activity'))
          .catch(fail)
      },
    }
  }, [queryClient])
}
