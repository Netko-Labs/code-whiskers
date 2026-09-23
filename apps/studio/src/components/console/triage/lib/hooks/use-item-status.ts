import { statusFor, useTriageRecords } from '../../../shared/console-data'
import type { ConsoleItem, TriageStatus } from '../../../shared/console-model'

export function useItemStatus(item: ConsoleItem): TriageStatus {
  return statusFor(item, useTriageRecords())
}
