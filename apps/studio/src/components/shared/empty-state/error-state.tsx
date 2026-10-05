import { Button } from '@code-whiskers/ui/components/button'
import { EmptyState } from './empty-state'
import { ERROR_DESCRIPTION, ERROR_TITLE, type ErrorStateProps, RETRY_LABEL } from './lib'

export function ErrorState({
  title = ERROR_TITLE,
  description = ERROR_DESCRIPTION,
  onRetry,
  size,
  className,
}: ErrorStateProps) {
  return (
    <EmptyState
      expression="confused"
      title={title}
      description={description}
      size={size}
      className={className}
      action={
        onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            {RETRY_LABEL}
          </Button>
        )
      }
    />
  )
}
