import { Skeleton } from '@code-whiskers/ui/components/skeleton'
import { cn } from '@code-whiskers/ui/lib/utils'
import { type DataListSkeletonProps, ROW_DENSITY, SKELETON_TITLE_WIDTHS } from './lib'

export function DataListSkeleton({
  rows = 8,
  density = 'default',
  className,
}: DataListSkeletonProps) {
  return (
    <div aria-hidden className={cn('flex flex-col', className)}>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className={cn('flex items-center gap-3 px-gutter', ROW_DENSITY[density])}>
          <Skeleton className="size-2 rounded-full" />
          <Skeleton
            className={cn('h-3.5', SKELETON_TITLE_WIDTHS[index % SKELETON_TITLE_WIDTHS.length])}
          />
          <Skeleton className="ml-auto h-3 w-12" />
          <Skeleton className="h-3 w-8" />
        </div>
      ))}
    </div>
  )
}
