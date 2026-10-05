import { describe, expect, test } from 'bun:test'
import { lifecycleUpdateOf } from '../src/mutations/tracker'

const ISSUE_ID = '6762076c-880a-40ba-ac33-2830f16207d5'

describe('lifecycleUpdateOf', () => {
  test('the write is bound to the authorized project as well as the ids', () => {
    const body = { projectId: 'p1', issueIds: [ISSUE_ID], status: 'resolved' as const }
    const { sql, params } = lifecycleUpdateOf(body, new Date()).toSQL()
    expect(sql).toMatch(/where \("issue"\."project_id" = \$\d+ and "issue"\."id" in \(\$\d+\)\)$/)
    expect(params.slice(-2)).toEqual(['p1', ISSUE_ID])
  })
})
