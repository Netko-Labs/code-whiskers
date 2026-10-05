import { cn } from '@code-whiskers/ui/lib/utils'
import { PAGE_WIDTH, type PageBodyProps, type PageProps } from './lib'

/** The scroll container of a route; the shell gives it the inset panel around it. */
export function Page({ children, className }: PageProps) {
  return (
    <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto', className)}>
      {children}
    </div>
  )
}

export function PageBody({ children, width = 'default', className }: PageBodyProps) {
  return (
    <div className={cn('flex flex-col gap-6 px-gutter py-6', PAGE_WIDTH[width], className)}>
      {children}
    </div>
  )
}
