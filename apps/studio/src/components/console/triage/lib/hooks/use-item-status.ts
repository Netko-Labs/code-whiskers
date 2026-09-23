import { useTriageRecords } from '../../../shared/console-data'
import type { ConsoleItem } from '../../../shared/console-model'
import type { TriageStatus } from '../types'
import { statusFor } from '../utils'

export function useItemStatus(item: ConsoleItem): TriageStatus {
  return statusFor(item, useTriageRecords())
}
