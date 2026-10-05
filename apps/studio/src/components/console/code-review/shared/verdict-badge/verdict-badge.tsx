import { StatusBadge } from '@/components/shared/status'
import { VERDICT_META } from '../review-model'
import type { VerdictBadgeProps } from './types'

export function VerdictBadge({ verdict, className }: VerdictBadgeProps) {
  const meta = VERDICT_META[verdict]
  return (
    <StatusBadge tone={meta.tone} isPulsing={verdict === 'running'} className={className}>
      {meta.label}
    </StatusBadge>
  )
}
