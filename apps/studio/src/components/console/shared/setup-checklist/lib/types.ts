import type { SectionRowLink } from '../../console-model'

export type SetupStep = {
  step: string
  isDone: boolean
  how: string
  link: SectionRowLink | null
}

export type SetupChecklistCardProps = {
  className?: string
}

export type SetupStepLinkProps = {
  step: SetupStep
}

export type SetupDismissal = {
  isDismissed: boolean
  dismiss: () => void
}

export type SetupProgress = {
  done: number
  total: number
  percent: number
  next: SetupStep[]
}
