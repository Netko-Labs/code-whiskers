import { useState } from 'react'
import { LogLines } from '../../shared/console-ui'
import { EMPTY_CRUMBS, EMPTY_LOGS, type IssueEventProps, logLinesOf, useIssueEvent } from '../lib'
import { IssueBreadcrumbs } from './issue-breadcrumbs'
import { IssueEventNav } from './issue-event-nav'
import { IssueSection } from './issue-section'
import { IssueStack } from './issue-stack'
import { IssueTags } from './issue-tags'

/** One event at a time, newest first; the tags under it describe the whole issue. */
export function IssueEvent({ issue, tags }: IssueEventProps) {
  const [eventId, setEventId] = useState('latest')
  const { event, isLoading, isMissing } = useIssueEvent(issue, eventId)

  return (
    <div className="flex flex-col gap-6">
      <IssueEventNav issue={issue} event={event} onPick={setEventId} />
      {isLoading && <span className="text-muted-foreground text-xs">Reading the event…</span>}
      {isMissing && (
        <span className="text-muted-foreground text-xs">
          Whiskers has no stored event for this.
        </span>
      )}
      {event && (
        <>
          <IssueSection title="Stack trace" meta="most recent call first">
            <IssueStack event={event} />
          </IssueSection>
          <IssueSection title="Breadcrumbs" meta="leading up to it">
            {event.breadcrumbs.length > 0 ? (
              <IssueBreadcrumbs crumbs={event.breadcrumbs} />
            ) : (
              <p className="m-0 text-[13px] text-muted-foreground">{EMPTY_CRUMBS}</p>
            )}
          </IssueSection>
        </>
      )}
      <IssueSection title="Tags" meta="across recent events">
        <IssueTags tags={tags} />
      </IssueSection>
      {event && (
        <IssueSection title="Logs" meta="same trace">
          {event.logs.length > 0 ? (
            <LogLines lines={logLinesOf(event)} className="rounded-xl" />
          ) : (
            <p className="m-0 text-[13px] text-muted-foreground">{EMPTY_LOGS}</p>
          )}
        </IssueSection>
      )}
    </div>
  )
}
