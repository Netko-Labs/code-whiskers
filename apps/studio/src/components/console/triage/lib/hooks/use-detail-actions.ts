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

    const setApproved = (value: boolean) => store().setApproved(item.id, value)
    const setResolved = (value: boolean) => store().setResolved(item.id, value)
    const setTracked = (value: boolean) => store().setTracked(item.id, value)
    const setDismissed = (value: boolean) => store().setDismissed(item.id, value)

    return {
      onPrimary: () => {
        const { approved, resolved, flash } = store()
        if (item.kind === 'review') {
          const next = !approved[item.id]
          setApproved(next)
          flash(
            next ? `Approved ${item.id} — Jamie notified` : `${item.id} approval withdrawn`,
            () => setApproved(!next),
          )
          return
        }
        if (item.kind === 'log') {
          setTracked(true)
          flash('Created CW-2048 from this pattern', () => setTracked(false))
          return
        }
        const next = !resolved[item.id]
        setResolved(next)
        flash(next ? `Resolved ${item.id} — quiet window started` : `${item.id} reopened`, () =>
          setResolved(!next),
        )
      },

      onSecondary: () => {
        const { flash } = store()
        if (item.kind === 'review') flash(`Changes requested on ${item.id}`)
        else if (item.kind === 'log') flash('Alert muted for 1 hour')
        else flash(`${item.id} snoozed until the next release`)
      },

      onEvidence: () => store().flash(`${item.evidenceLabel} — opened in a side panel`),

      onDismissBlocker: () => {
        setDismissed(true)
        store().flash(`Blocker dismissed on ${item.id}`, () => setDismissed(false))
      },

      openFix: () => store().openFix(item.id),
      closeFix: () => store().closeFix(),

      commitFix: () => {
        const { closeFix, flash } = store()
        closeFix()
        if (item.kind === 'review') flash(`Committed to ${item.id} — checks re-running`)
        else if (item.kind === 'log') {
          setTracked(true)
          flash('Created CW-2048 with this alert condition', () => setTracked(false))
        } else flash('PR #4472 opened — Whiskers pushed the fix')
      },

      assignTo: (name: string) => {
        const { assignee, assign, flash } = store()
        const previous = assignee[item.id]
        assign(item.id, name)
        flash(`Assigned ${item.id} to ${name}`, () => assign(item.id, previous))
      },

      postComment: () => {
        const { draft, addComment, removeLastComment, flash } = store()
        const body = draft.trim()
        if (!body) {
          flash('Nothing to post yet')
          return
        }
        addComment({
          initials: VIEWER.initials,
          who: VIEWER.name,
          when: 'just now',
          body,
          self: true,
        })
        flash(`Comment posted to ${item.id}`, removeLastComment)
      },
    }
  }, [item])
}
