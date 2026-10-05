import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@code-whiskers/ui/components/resizable'
import { cn } from '@code-whiskers/ui/lib/utils'
import type { SplitViewProps } from './lib'

/** List + detail. The list panel keeps its identity when the detail opens, so scroll survives. */
export function SplitView({
  list,
  detail,
  listDefaultSize = '42',
  listMinSize = 280,
  detailMinSize = 360,
  className,
}: SplitViewProps) {
  return (
    <ResizablePanelGroup orientation="horizontal" className={cn('min-h-0 flex-1', className)}>
      <ResizablePanel
        id="split-list"
        defaultSize={detail ? listDefaultSize : '100'}
        minSize={listMinSize}
        className="flex min-w-0 flex-col"
      >
        {list}
      </ResizablePanel>
      {detail && (
        <>
          <ResizableHandle className="transition-colors duration-fast hover:bg-ring/60 focus-visible:bg-ring" />
          <ResizablePanel
            id="split-detail"
            minSize={detailMinSize}
            className="flex min-w-0 animate-enter-right flex-col"
          >
            {detail}
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  )
}
