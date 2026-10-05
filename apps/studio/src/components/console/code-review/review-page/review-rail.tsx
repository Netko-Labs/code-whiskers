import { KeyValue, KeyValueList, Section } from '@/components/shared/page'
import { formatAge } from '@/shared/format-date'
import {
  activityOf,
  diffLabel,
  pullRequestUrl,
  reviewDuration,
  shortSha,
} from '../shared/review-model'
import { type ReviewRailProps, tokensLabel } from './lib'
import { ReviewTimeline } from './review-timeline'

const LINK = 'underline-offset-4 hover:underline'

export function ReviewRail({ data }: ReviewRailProps) {
  const { selected, slug, timeline } = data
  const took = reviewDuration(selected)
  const diff = diffLabel(selected)
  const tokens = tokensLabel(selected.inputTokens, selected.outputTokens)

  return (
    <aside className="flex min-w-0 flex-col gap-6 @5xl:sticky @5xl:top-4 @5xl:self-start">
      <KeyValueList>
        <KeyValue label="Repository" isMono>
          <a href={`https://github.com/${slug}`} target="_blank" rel="noreferrer" className={LINK}>
            {slug}
          </a>
        </KeyValue>
        <KeyValue label="Pull request" isMono>
          <a
            href={pullRequestUrl(slug, selected.prNumber)}
            target="_blank"
            rel="noreferrer"
            className={LINK}
          >
            #{selected.prNumber}
          </a>
        </KeyValue>
        {selected.headRef && (
          <KeyValue label="Branch" isMono>
            {selected.headRef}
          </KeyValue>
        )}
        <KeyValue label="Commit" isMono>
          <a
            href={`https://github.com/${slug}/commit/${selected.headSha}`}
            target="_blank"
            rel="noreferrer"
            className={LINK}
          >
            {shortSha(selected.headSha)}
          </a>
        </KeyValue>
        {selected.author && <KeyValue label="Author">{selected.author}</KeyValue>}
        {diff && (
          <KeyValue label="Diff" isMono>
            {diff}
          </KeyValue>
        )}
        <KeyValue label="Reviewed">{formatAge(activityOf(selected))} ago</KeyValue>
        {took && (
          <KeyValue label="Took" isMono>
            {took}
          </KeyValue>
        )}
        {selected.model && (
          <KeyValue label="Model" isMono>
            {selected.model}
          </KeyValue>
        )}
        {tokens && (
          <KeyValue label="Tokens" isMono>
            {tokens}
          </KeyValue>
        )}
      </KeyValueList>
      <Section
        title="Pushes"
        description={`${timeline.length} reviewed${timeline.length === 1 ? '' : ', newest first'}`}
      >
        <ReviewTimeline timeline={timeline} />
      </Section>
    </aside>
  )
}
