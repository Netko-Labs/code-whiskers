import { cn } from '@code-whiskers/ui/lib/utils'
import { IconChevronRight } from '@tabler/icons-react'
import { useState } from 'react'
import { plural } from '../../shared/issue-lifecycle'
import type { IssueVendorFramesProps } from '../lib'

export function IssueVendorFrames({ frames }: IssueVendorFramesProps) {
  const [isOpen, setOpen] = useState(false)

  return (
    <div className="border-rule-soft border-b last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!isOpen)}
        className="flex w-full items-center gap-2 px-4 py-1.5 text-left text-faint transition-colors duration-fast hover:text-body"
      >
        <IconChevronRight className={cn('size-3 transition-transform', isOpen && 'rotate-90')} />
        {plural(frames.length, 'library frame')}
      </button>
      {isOpen &&
        frames.map((frame, index) => (
          <div key={`${frame.file}-${index}`} className="break-all py-0.5 pr-4 pl-9 text-faint">
            {frame.function}{' '}
            <span className="text-faint/70">
              {[frame.file, frame.line].filter((part) => part !== null).join(':')}
            </span>
          </div>
        ))}
    </div>
  )
}
