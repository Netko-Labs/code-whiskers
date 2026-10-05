import { NEXT_STEPS_SHOWN } from './constants'
import type { SetupProgress, SetupStep } from './types'

export function setupProgressOf(steps: SetupStep[]): SetupProgress {
  const remaining = steps.filter((step) => !step.isDone)
  return {
    done: steps.length - remaining.length,
    total: steps.length,
    percent: steps.length
      ? Math.round(((steps.length - remaining.length) / steps.length) * 100)
      : 0,
    next: remaining.slice(0, NEXT_STEPS_SHOWN),
  }
}
