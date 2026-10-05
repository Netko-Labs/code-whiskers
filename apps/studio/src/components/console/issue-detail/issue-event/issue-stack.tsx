import { EMPTY_STACK, groupFrames, type IssueStackProps } from '../lib'
import { IssueFrame } from './issue-frame'
import { IssueVendorFrames } from './issue-vendor-frames'

/** In-app frames open with their source line; each run of library frames folds into one row. */
export function IssueStack({ event }: IssueStackProps) {
  const groups = groupFrames(event.frames)
  const culprit = event.frames.findIndex((frame) => frame.isInApp)

  return (
    <div className="dark overflow-hidden rounded-xl border border-border bg-canvas font-mono text-xs leading-5 text-muted-foreground">
      <div className="border-border border-b px-4 py-2.5 text-foreground">{event.message}</div>
      {groups.length === 0 && <div className="px-4 py-3 text-faint">{EMPTY_STACK}</div>}
      {groups.map((group) =>
        group.kind === 'app' ? (
          <IssueFrame key={group.index} frame={group.frame} isCulprit={group.index === culprit} />
        ) : (
          <IssueVendorFrames key={group.index} frames={group.frames} />
        ),
      )}
    </div>
  )
}
