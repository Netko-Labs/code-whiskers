import type { ConsoleOrg } from '../../console-model'

export const ORGS: ConsoleOrg[] = [
  {
    login: 'sample-org',
    isOrganization: true,
    name: 'Sample organization',
    meta: 'appears until the GitHub sync runs',
    mono: 'SO',
    tint: '#e4e4e7',
  },
]

export const SAMPLE_DATA_NOTE = 'Sample data — no events ingested yet'
