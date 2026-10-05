import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@code-whiskers/ui/components/breadcrumb'
import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { Fragment } from 'react'
import type { ConsoleBreadcrumbsProps } from './lib'

export function ConsoleBreadcrumbs({ crumbs }: ConsoleBreadcrumbsProps) {
  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap gap-1 text-ui">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          const label = cn('truncate', crumb.isMono && 'font-mono text-xs')
          return (
            <Fragment key={`${index}-${crumb.label}`}>
              {index > 0 && <BreadcrumbSeparator className="text-faint" />}
              <BreadcrumbItem className="min-w-0 animate-enter">
                {isLast ? (
                  <BreadcrumbPage className={cn(label, 'font-medium')}>
                    {crumb.label}
                  </BreadcrumbPage>
                ) : crumb.section ? (
                  <BreadcrumbLink
                    className={label}
                    render={<Link to="/console/$section" params={{ section: crumb.section }} />}
                  >
                    {crumb.label}
                  </BreadcrumbLink>
                ) : crumb.to ? (
                  <BreadcrumbLink className={label} render={<Link to={crumb.to} />}>
                    {crumb.label}
                  </BreadcrumbLink>
                ) : (
                  <span className={cn(label, 'text-muted-foreground')}>{crumb.label}</span>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
