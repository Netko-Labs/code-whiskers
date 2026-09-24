import { Button, buttonVariants } from '@code-whiskers/ui/components/button'
import { Link } from '@tanstack/react-router'
import type { SectionActionsProps } from './lib'
import { SectionFormAction } from './section-form-action'

export function SectionActions({ actions, sample }: SectionActionsProps) {
  return (
    <div className="flex shrink-0 gap-2">
      {actions.map((action) => {
        const variant = action.variant === 'outline' ? 'outline' : 'default'
        if (action.form && !sample) return <SectionFormAction key={action.label} action={action} />
        if (!action.href || sample) {
          return (
            <Button
              key={action.label}
              size="sm"
              variant={variant}
              disabled
              title="Not available yet"
            >
              {action.label}
            </Button>
          )
        }
        const className = buttonVariants({ size: 'sm', variant })
        return action.href.startsWith('http') ? (
          <a
            key={action.label}
            href={action.href}
            target="_blank"
            rel="noreferrer"
            className={className}
          >
            {action.label}
          </a>
        ) : (
          <Link key={action.label} to={action.href} className={className}>
            {action.label}
          </Link>
        )
      })}
    </div>
  )
}
