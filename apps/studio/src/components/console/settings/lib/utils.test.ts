import { describe, expect, test } from 'bun:test'
import { ApiKeyCreateSchema, InstanceSettingsSchema } from '@code-whiskers/studio-domain'
import { formError, githubPeopleUrl, installationSettingsUrl } from './utils'

describe('formError', () => {
  test('reports the domain message, or null when the value parses', () => {
    expect(formError(InstanceSettingsSchema, { name: '  ' })).toBe('Give the instance a name')
    expect(formError(InstanceSettingsSchema, { name: 'Netko' })).toBeNull()
    expect(formError(ApiKeyCreateSchema, { name: 'x'.repeat(81) })).toBe(
      'Keep it under 80 characters',
    )
  })
})

describe('GitHub links', () => {
  const org = {
    installationId: 7,
    login: 'netko',
    name: null,
    avatarUrl: null,
    syncedAt: new Date(),
  }

  test('organizations and personal accounts configure installations in different places', () => {
    expect(installationSettingsUrl({ ...org, accountType: 'Organization' })).toBe(
      'https://github.com/organizations/netko/settings/installations/7',
    )
    expect(installationSettingsUrl({ ...org, accountType: 'User' })).toBe(
      'https://github.com/settings/installations/7',
    )
  })

  test('people live on the org page; a personal install is one person', () => {
    expect(githubPeopleUrl({ ...org, accountType: 'Organization' })).toBe(
      'https://github.com/orgs/netko/people',
    )
    expect(githubPeopleUrl({ ...org, accountType: 'User' })).toBe('https://github.com/netko')
  })
})
