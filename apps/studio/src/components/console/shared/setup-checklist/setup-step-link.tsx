import { IconArrowRight } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import type { SetupStepLinkProps } from './lib'

const ROW =
  'group flex items-center gap-2 rounded-[8px] px-2 py-1.5 text-[13px] transition-colors hover:bg-surface-subtle'

function Label({ step }: SetupStepLinkProps) {
  return (
    <>
      <span className="size-1.5 shrink-0 rounded-full border border-muted-foreground" />
      <span className="min-w-0 flex-1 truncate" title={step.how}>
        {step.step}
      </span>
      <IconArrowRight
        className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        stroke={1.75}
      />
    </>
  )
}

/** One remaining step, opening where it gets done. */
export function SetupStepLink({ step }: SetupStepLinkProps) {
  const link = step.link
  if (link?.kind === 'project-setup') {
    return (
      <Link to="/console/projects/new" className={ROW}>
        <Label step={step} />
      </Link>
    )
  }
  if (link?.kind === 'section') {
    return (
      <Link
        to="/console/$section"
        params={{ section: link.section }}
        search={{ tab: link.tab ?? 0 }}
        className={ROW}
      >
        <Label step={step} />
      </Link>
    )
  }
  if (link?.kind === 'external') {
    return (
      <a href={link.href} target="_blank" rel="noreferrer" className={ROW}>
        <Label step={step} />
      </a>
    )
  }
  return (
    <div className={ROW}>
      <Label step={step} />
    </div>
  )
}
