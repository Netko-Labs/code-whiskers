import { Button } from '@code-whiskers/ui/components/button'
import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { type FirstEventBarProps, useFirstEvent, useSendTestEvent } from './lib'

/** Waits for the project's first event; flips the moment the realtime `issues` topic says so. */
export function FirstEventBar({ projectId, variant, aside }: FirstEventBarProps) {
  const { state, onTestSent } = useFirstEvent(projectId)
  const test = useSendTestEvent(projectId, onTestSent)
  const isReceived = state.status === 'received'

  return (
    <div
      role="status"
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2 bg-background',
        variant === 'footer'
          ? 'sticky bottom-0 z-[2] border-border border-t px-8 py-3'
          : 'rounded-[10px] border border-border px-4 py-3',
      )}
    >
      <span className="relative flex size-2 shrink-0">
        {!isReceived && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-severity-info opacity-60" />
        )}
        <span
          className={cn(
            'relative inline-flex size-2 rounded-full',
            isReceived ? 'bg-severity-resolved' : 'bg-severity-info',
          )}
        />
      </span>
      {isReceived ? (
        <p className="m-0 min-w-0 flex-1 truncate text-[13px]">
          Event received — <span className="font-medium">{state.issue.title}</span>
        </p>
      ) : (
        <p className="m-0 min-w-0 flex-1 text-[13px] text-muted-foreground">
          Listening for first event…
          {state.hasFailed && ' (whiskers is not answering; still trying)'}
        </p>
      )}
      <div className="flex shrink-0 items-center gap-3">
        {isReceived ? (
          <Link
            to="/console/issues/$issueId"
            params={{ issueId: state.issue.id }}
            className="font-medium text-[13px] hover:underline"
          >
            Open issue →
          </Link>
        ) : (
          <>
            {aside}
            <Button size="sm" variant="outline" onClick={test.send} disabled={test.isPending}>
              {test.isPending ? 'Sending…' : 'Send test event'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
