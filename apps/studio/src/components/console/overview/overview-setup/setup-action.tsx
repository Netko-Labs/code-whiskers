import { buttonVariants } from '@code-whiskers/ui/components/button'
import { IconArrowRight } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import type { SetupActionProps } from '../lib'

const BUTTON = buttonVariants({ size: 'sm' })

/** The next step as a solid button, opening wherever that step gets done. */
export function SetupAction({ link, label }: SetupActionProps) {
  const content = (
    <>
      {label}
      <IconArrowRight data-icon="inline-end" />
    </>
  )
  if (link?.kind === 'project-setup') {
    return (
      <Link to="/console/projects/new" className={BUTTON}>
        {content}
      </Link>
    )
  }
  if (link?.kind === 'section') {
    return (
      <Link
        to="/console/$section"
        params={{ section: link.section }}
        search={{ tab: link.tab ?? 0 }}
        className={BUTTON}
      >
        {content}
      </Link>
    )
  }
  if (link?.kind === 'external') {
    return (
      <a href={link.href} target="_blank" rel="noreferrer" className={BUTTON}>
        {content}
      </a>
    )
  }
  return null
}
