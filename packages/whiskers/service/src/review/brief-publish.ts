import { createLogger } from '@code-whiskers/logger'
import { getLoopHistory } from '../queries'
import { buildMergeBrief, type MergeBrief, upsertBriefComment } from './brief'
import type { PrRef } from './github'

const logger = createLogger('whiskers-review')

/** The brief for a pull request's latest round, from what is stored; null before any round. */
export async function mergeBriefOf(ref: PrRef): Promise<MergeBrief | null> {
  const { reviews, findings } = await getLoopHistory(ref.owner, ref.repo, ref.prNumber)
  return buildMergeBrief({ pr: `${ref.owner}/${ref.repo}#${ref.prNumber}`, reviews, findings })
}

/** Posted when the loop ends — mergeable or handed over. Never fails the review. */
export async function publishMergeBrief(ref: PrRef): Promise<void> {
  try {
    const brief = await mergeBriefOf(ref)
    if (brief) await upsertBriefComment(ref, brief.markdown)
  } catch (error) {
    logger.warn(
      { ...ref, err: error instanceof Error ? error.message : String(error) },
      'merge brief not posted',
    )
  }
}
