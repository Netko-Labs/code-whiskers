import { type QueryClient, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  assignTriage,
  postTriageComment,
  recordTriage,
  type TriageDecision,
  type TriageItemRef,
  triageCommentsQuery,
} from '@/integrations/studio-api'
import { findingRef } from '../../../shared/console-data'
import type { ConsoleItem } from '../../../shared/console-model'
import { useConsoleStore } from '../../../use-console-store'
import type { DetailActions } from '../types'
import {
  formatUntil,
  patchTriageCache,
  readTriage,
  restoreTriageCache,
  snoozeDeadline,
} from '../utils'
import { DISMISS_NOTE, SAMPLE_ACTION_NOTE } from '../values'

type DecisionExtra = Pick<TriageDecision, 'note' | 'snoozedUntil'>

function flash(message: string, onUndo?: () => void) {
  useConsoleStore.getState().flash(message, onUndo)
}

/**
 * The cache moves first so the console answers immediately; the write follows, and a failed
 * write puts the cache back and says so rather than leaving a decision that never landed.
 */
function saveDecision(
  queryClient: QueryClient,
  target: TriageItemRef,
  status: TriageDecision['status'],
  extra: DecisionExtra = {},
) {
  const previous = patchTriageCache(queryClient, target, {
    status,
    note: extra.note ?? null,
    snoozedUntil: extra.snoozedUntil ?? null,
  })
  recordTriage({ ...target, status, ...extra }).catch(() => {
    restoreTriageCache(queryClient, target, previous)
    flash('Could not save that decision — nothing changed')
  })
  return previous
}

function decide(
  queryClient: QueryClient,
  target: TriageItemRef,
  status: TriageDecision['status'],
  message: string,
  extra: DecisionExtra = {},
) {
  const previous = saveDecision(queryClient, target, status, extra)
  flash(message, () =>
    saveDecision(queryClient, target, previous?.status ?? 'open', {
      note: previous?.note ?? undefined,
      snoozedUntil: previous?.snoozedUntil ?? undefined,
    }),
  )
}

export function useDetailActions(item: ConsoleItem): DetailActions {
  const queryClient = useQueryClient()

  return useMemo(() => {
    const live = (): TriageItemRef | null => {
      if (!item.triage) flash(SAMPLE_ACTION_NOTE)
      return item.triage
    }

    const assign = (target: TriageItemRef, assigneeUserId: string | null) => {
      const previous = patchTriageCache(queryClient, target, { assigneeUserId })
      assignTriage(target, assigneeUserId).catch(() => {
        restoreTriageCache(queryClient, target, previous)
        flash('Could not change the assignee — nothing changed')
      })
      return previous?.assigneeUserId ?? null
    }

    return {
      onPrimary: () => {
        const target = live()
        if (!target) return
        const current = readTriage(queryClient, target)?.status
        if (item.kind === 'review') {
          if (current === 'approved') {
            decide(queryClient, target, 'open', `Approval withdrawn on ${item.handle}`)
          } else decide(queryClient, target, 'approved', `Approved ${item.handle} in CodeWhiskers`)
          return
        }
        const record = readTriage(queryClient, target)
        const isRegressed =
          current === 'resolved' && !!item.at && !!record && item.at > record.updatedAt
        if (current === 'resolved' && !isRegressed) {
          decide(queryClient, target, 'open', `Reopened ${item.handle}`)
        } else decide(queryClient, target, 'resolved', `Resolved ${item.handle}`)
      },

      onSecondary: () => {
        if (item.kind === 'review' && item.url) {
          window.open(item.url, '_blank', 'noopener')
          return
        }
        const target = live()
        if (!target) return
        const record = readTriage(queryClient, target)
        const isSnoozing =
          record?.status === 'snoozed' && !!record.snoozedUntil && record.snoozedUntil > new Date()
        if (isSnoozing) {
          decide(queryClient, target, 'open', `${item.handle} is back in the inbox`)
          return
        }
        const snoozedUntil = snoozeDeadline()
        decide(
          queryClient,
          target,
          'snoozed',
          `Snoozed ${item.handle} until ${formatUntil(snoozedUntil)}`,
          { snoozedUntil },
        )
      },

      onEvidence: () => flash(SAMPLE_ACTION_NOTE),

      toggleFinding: (finding, isDismissed) => {
        const target = live()
        if (!target) return
        const ref = findingRef(target.scope, finding)
        if (isDismissed) {
          decide(queryClient, ref, 'open', `Whiskers may raise "${finding.title}" again`)
        } else {
          decide(
            queryClient,
            ref,
            'dismissed',
            `Dismissed — Whiskers stops raising "${finding.title}" on ${target.scope}`,
            { note: DISMISS_NOTE },
          )
        }
      },

      openFix: () => useConsoleStore.getState().openFix(item.id),
      closeFix: () => useConsoleStore.getState().closeFix(),
      commitFix: () => {
        useConsoleStore.getState().closeFix()
        flash(SAMPLE_ACTION_NOTE)
      },

      assignTo: (member) => {
        const target = live()
        if (!target) return
        const previous = assign(target, member?.id ?? null)
        flash(
          member ? `Assigned ${item.handle} to ${member.name}` : `Unassigned ${item.handle}`,
          () => assign(target, previous),
        )
      },

      postComment: () => {
        const target = live()
        if (!target) return
        const { drafts, setDraft } = useConsoleStore.getState()
        const body = drafts[item.id]?.trim()
        if (!body) {
          flash('Nothing to post yet')
          return
        }
        setDraft(item.id, '')
        postTriageComment(target, body)
          .then(() =>
            queryClient.invalidateQueries({ queryKey: triageCommentsQuery(target).queryKey }),
          )
          .catch(() => {
            setDraft(item.id, body)
            flash('Comment not posted — your draft is back')
          })
      },
    }
  }, [item, queryClient])
}
