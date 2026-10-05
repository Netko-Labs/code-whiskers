import { type QueryClient, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { recordTriage, type TriageItemRef } from '@/integrations/studio-api'
import { rerunReview, type WhiskersReview } from '@/integrations/whiskers'
import { findingRef, patchTriageCache, restoreTriageCache } from '../../../../shared/console-data'
import { useConsoleStore } from '../../../../use-console-store'
import type { ReviewActions } from '../types'
import { DISMISS_NOTE } from '../values'

function flash(message: string, onUndo?: () => void) {
  useConsoleStore.getState().flash(message, onUndo)
}

/** The cache moves first; a failed write puts it back and says so. */
function saveFinding(
  queryClient: QueryClient,
  target: TriageItemRef,
  status: 'open' | 'dismissed',
): void {
  const note = status === 'dismissed' ? DISMISS_NOTE : null
  const previous = patchTriageCache(queryClient, target, { status, note })
  recordTriage({ ...target, status, note: note ?? undefined }).catch(() => {
    restoreTriageCache(queryClient, target, previous)
    flash('Could not save that decision — nothing changed')
  })
}

export function useReviewActions(review: WhiskersReview | undefined): ReviewActions {
  const queryClient = useQueryClient()

  return useMemo(
    () => ({
      rerun: () => {
        if (!review) return
        const { owner, repo, prNumber } = review
        rerunReview({ owner, repo, prNumber })
          .then(() => flash(`Reviewing #${prNumber} again, the whole diff this time`))
          .catch((error: Error) => flash(error.message))
      },
      toggleFinding: (finding, isDismissed) => {
        if (!review) return
        const target = findingRef(`${review.owner}/${review.repo}`, finding)
        const next = isDismissed ? 'open' : 'dismissed'
        saveFinding(queryClient, target, next)
        flash(
          isDismissed
            ? `Whiskers may raise "${finding.title}" again`
            : `Dismissed — Whiskers stops raising "${finding.title}"`,
          () => saveFinding(queryClient, target, isDismissed ? 'dismissed' : 'open'),
        )
      },
    }),
    [review, queryClient],
  )
}
