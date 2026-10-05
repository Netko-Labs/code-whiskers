import { Skeleton } from '@code-whiskers/ui/components/skeleton'
import { cn } from '@code-whiskers/ui/lib/utils'
import { SKELETON_WIDTHS, type SkeletonRowsProps } from './lib'

export function PageHeaderSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-2.5 px-gutter pt-6 pb-4">
      <Skeleton className="h-6 w-56" />
      <Skeleton className="h-4 w-96 max-w-full" />
    </div>
  )
}

export function KeyValueSkeleton({ rows = 5, className }: SkeletonRowsProps) {
  return (
    <div aria-hidden className={cn('flex flex-col gap-3 py-1.5', className)}>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="grid grid-cols-[112px_1fr] gap-3">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className={cn('h-3.5', SKELETON_WIDTHS[index % SKELETON_WIDTHS.length])} />
        </div>
      ))}
    </div>
  )
}

export function PanelSkeleton({ rows = 3, className }: SkeletonRowsProps) {
  return (
    <div
      aria-hidden
      className={cn('flex flex-col gap-3 rounded-xl border border-border p-4', className)}
    >
      <Skeleton className="h-4 w-32" />
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton
          key={index}
          className={cn('h-3.5', SKELETON_WIDTHS[index % SKELETON_WIDTHS.length])}
        />
      ))}
    </div>
  )
}
