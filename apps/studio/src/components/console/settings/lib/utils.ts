import type { ZodType } from 'zod'
import type { Organization } from '@/integrations/studio-api'

/** The first problem zod reports for a form value, or null when it parses. */
export function formError(schema: ZodType, value: unknown): string | null {
  const result = schema.safeParse(value)
  return result.success ? null : (result.error.issues[0]?.message ?? 'Check this value')
}

/** Where GitHub configures this App's access for one installation. */
export function installationSettingsUrl(org: Organization): string {
  return org.accountType === 'Organization'
    ? `https://github.com/organizations/${org.login}/settings/installations/${org.installationId}`
    : `https://github.com/settings/installations/${org.installationId}`
}

/** Membership is GitHub's: an org's people page, or the account itself for a personal install. */
export function githubPeopleUrl(org: Organization): string {
  return org.accountType === 'Organization'
    ? `https://github.com/orgs/${org.login}/people`
    : `https://github.com/${org.login}`
}
