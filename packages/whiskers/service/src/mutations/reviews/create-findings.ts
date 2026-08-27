import { type Finding, type FindingInsert, findingTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'

export const createFindings = async (data: FindingInsert[]): Promise<Finding[]> => {
  if (data.length === 0) return []
  return await db.insert(findingTable).values(data).returning()
}
