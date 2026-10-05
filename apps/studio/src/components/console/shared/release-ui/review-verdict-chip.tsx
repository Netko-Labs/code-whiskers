import { StatusBadge } from '@/components/shared/status'
import { type ReviewVerdictChipProps, verdictLook } from './lib'

export function ReviewVerdictChip({ review }: ReviewVerdictChipProps) {
  const look = verdictLook(review)
  return <StatusBadge tone={look.tone}>{look.label}</StatusBadge>
}
