import { describe, expect, test } from 'bun:test'
import {
  AlertRuleCreateSchema,
  AlertRuleUpdateSchema,
  isValidTriggerSet,
} from '@code-whiskers/studio-domain'
import {
  firingStatusOf,
  isLevelAtLeast,
  isOncePerSubject,
  isProjectInInstallation,
  matchesIssueFilters,
} from '../src/alerts/utils'

const filters = {
  projectIds: [] as string[],
  environment: null,
  minLevel: null,
  release: null,
  login: 'Netko-Labs',
}
const signal = {
  projectId: '7',
  repository: 'netko-labs/shop',
  environment: 'production',
  release: '1.4.0',
  level: 'error',
}

describe('trigger sets', () => {
  test('new and regressed share a rule', () => {
    expect(isValidTriggerSet(['new_issue', 'issue_regressed'])).toBe(true)
  })

  test('a rate or review trigger stands alone', () => {
    expect(isValidTriggerSet(['error_rate'])).toBe(true)
    expect(isValidTriggerSet(['new_issue', 'error_rate'])).toBe(false)
    expect(isValidTriggerSet(['review_failed', 'blocking_review'])).toBe(false)
  })

  test('empty and repeated sets are refused', () => {
    expect(isValidTriggerSet([])).toBe(false)
    expect(isValidTriggerSet(['new_issue', 'new_issue'])).toBe(false)
  })
})

describe('rule schemas', () => {
  test('a create fills the defaults: every destination, 30 min interval', () => {
    const rule = AlertRuleCreateSchema.parse({
      installationId: 1,
      name: 'Checkout',
      triggers: ['new_issue'],
      environment: '',
    })
    expect(rule).toMatchObject({
      projectIds: [],
      environment: null,
      notifyAll: true,
      destinationIds: [],
      actionIntervalMinutes: 30,
    })
  })

  test('an interval outside the menu is refused', () => {
    const parsed = AlertRuleCreateSchema.safeParse({
      installationId: 1,
      name: 'x',
      triggers: ['new_issue'],
      actionIntervalMinutes: 7,
    })
    expect(parsed.success).toBe(false)
  })

  test('a mute toggle carries no defaults that would overwrite the rule', () => {
    expect(AlertRuleUpdateSchema.parse({ isMuted: true })).toEqual({ isMuted: true })
  })
})

describe('scoping', () => {
  test('a linked project belongs to the installation that owns its repository', () => {
    expect(isProjectInInstallation('Netko-Labs/shop', 'netko-labs')).toBe(true)
    expect(isProjectInInstallation('someone-else/shop', 'netko-labs')).toBe(false)
  })

  test('an unlinked project is instance-wide', () => {
    expect(isProjectInInstallation(null, 'netko-labs')).toBe(true)
  })

  test('a rule without a project filter skips other installations', () => {
    expect(matchesIssueFilters(filters, signal)).toBe(true)
    expect(matchesIssueFilters(filters, { ...signal, repository: 'other/app' })).toBe(false)
  })

  test('a project filter wins over ownership', () => {
    const rule = { ...filters, projectIds: ['7'] }
    expect(matchesIssueFilters(rule, { ...signal, repository: 'other/app' })).toBe(true)
    expect(matchesIssueFilters(rule, { ...signal, projectId: '8' })).toBe(false)
  })
})

describe('filters', () => {
  test('environment and release must match exactly; unknown does not match', () => {
    const rule = { ...filters, environment: 'production', release: '1.4.0' }
    expect(matchesIssueFilters(rule, signal)).toBe(true)
    expect(matchesIssueFilters(rule, { ...signal, environment: 'staging' })).toBe(false)
    expect(matchesIssueFilters(rule, { ...signal, environment: undefined })).toBe(false)
  })

  test('level is a floor, with Sentry spellings', () => {
    expect(isLevelAtLeast('fatal', 'error')).toBe(true)
    expect(isLevelAtLeast('warn', 'warning')).toBe(true)
    expect(isLevelAtLeast('info', 'warning')).toBe(false)
    expect(isLevelAtLeast(undefined, null)).toBe(true)
    expect(isLevelAtLeast(undefined, 'info')).toBe(false)
  })
})

describe('delivery bookkeeping', () => {
  const ok = { integrationId: 'a', name: 'a', kind: 'slack', isDelivered: true, error: null }
  const bad = { ...ok, integrationId: 'b', isDelivered: false, error: 'webhook answered 500' }

  test('status summarizes the destinations', () => {
    expect(firingStatusOf([])).toBe('undelivered')
    expect(firingStatusOf([ok])).toBe('delivered')
    expect(firingStatusOf([ok, bad])).toBe('partial')
    expect(firingStatusOf([bad])).toBe('failed')
  })

  test('new issues and reviews are news once; the rest repeat after the interval', () => {
    expect(isOncePerSubject('new_issue')).toBe(true)
    expect(isOncePerSubject('blocking_review')).toBe(true)
    expect(isOncePerSubject('issue_regressed')).toBe(false)
    expect(isOncePerSubject('issue_frequency')).toBe(false)
    expect(isOncePerSubject(undefined)).toBe(false)
  })
})
