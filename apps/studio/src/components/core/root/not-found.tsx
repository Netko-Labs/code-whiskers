import { CatExpression } from '@code-whiskers/ui/brand'
import { buttonVariants } from '@code-whiskers/ui/components/button'
import { Link } from '@tanstack/react-router'
import { NOT_FOUND_DESCRIPTION, NOT_FOUND_HOME_LABEL, NOT_FOUND_TITLE } from './lib'

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3.5 bg-ink p-6 text-center font-sans">
      <CatExpression expression="sleeping" animated tone="dark" size={112} />
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-[15px] font-semibold text-ink-text">{NOT_FOUND_TITLE}</h1>
        <p className="m-0 text-[13px] leading-normal text-ink-muted">{NOT_FOUND_DESCRIPTION}</p>
      </div>
      <Link
        to="/"
        className={buttonVariants({
          variant: 'secondary',
          size: 'sm',
          className: 'bg-ink-card text-ink-text hover:bg-ink-hairline',
        })}
      >
        {NOT_FOUND_HOME_LABEL}
      </Link>
    </div>
  )
}
