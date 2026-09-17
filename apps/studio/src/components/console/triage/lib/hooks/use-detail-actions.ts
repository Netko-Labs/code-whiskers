import { useMemo } from 'react'
import { VIEWER } from '../../../shared/console-data'
import type { ConsoleItem } from '../../../shared/console-model'
import { useConsoleStore } from '../../../use-console-store'

export type DetailActions = {
  onPrimary: () => void
  onSecondary: () => void
  onEvidence: () => void
  onDismissBlocker: () => void
  openFix: () => void
  closeFix: () => void
  commitFix: () => void
  assignTo: (name: string) => void
  postComment: () => void
}

export function useDetailActions(item: ConsoleItem): DetailActions {
  return useMemo(() => {
    const store = () => useConsoleStore.getState()

    return {
      onPrimary: () => {
        const { toggleApproved, toggleResolved, setTracked, flash } = store()
        if (item.kind === 'review') {
          const approved = toggleApproved(item.id)
          flash(
            approved ? `Approved ${item.id} — Jamie notified` : `${item.id} approval withdrawn`,
            approved,
          )
          return
        }
        if (item.kind === 'log') {
          setTracked(item.id)
          flash('Created CW-2048 from this pattern', true)
          return
        }
        const resolved = toggleResolved(item.id)
        flash(resolved ? `Resolved ${item.id} — quiet window started` : `${item.id} reopened`, true)
      },

      onSecondary: () => {
        const { flash } = store()
        if (item.kind === 'review') flash(`Changes requested on ${item.id}`)
        else if (item.kind === 'log') flash('Alert muted for 1 hour')
        else flash(`${item.id} snoozed until the next release`)
      },

      onEvidence: () => store().flash(`${item.evidenceLabel} — opened in a side panel`),

      onDismissBlocker: () => {
        const { setDismissed, flash } = store()
        setDismissed(item.id)
        flash(`Blocker dismissed on ${item.id}`, true)
      },

      openFix: () => store().setFixOpen(true),
      closeFix: () => store().setFixOpen(false),

      commitFix: () => {
        const { setFixOpen, setTracked, flash } = store()
        setFixOpen(false)
        if (item.kind === 'review') flash(`Committed to ${item.id} — checks re-running`, true)
        else if (item.kind === 'log') {
          setTracked(item.id)
          flash('Created CW-2048 with this alert condition', true)
        } else flash('PR #4472 opened — Whiskers pushed the fix', true)
      },

      assignTo: (name: string) => {
        const { assign, flash } = store()
        assign(item.id, name)
        flash(`Assigned ${item.id} to ${name}`, true)
      },

      postComment: () => {
        const { postComment, flash } = store()
        if (!postComment(VIEWER.initials, VIEWER.name)) {
          flash('Nothing to post yet')
          return
        }
        flash(`Comment posted to ${item.id}`, true)
      },
    }
  }, [item])
}
