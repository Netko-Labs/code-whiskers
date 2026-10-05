import type { WhiskersProject, WhiskersProjectKey } from '@/integrations/whiskers'

export type OtlpTarget = {
  isLoading: boolean
  project: WhiskersProject | null
  key: WhiskersProjectKey | null
  endpoint: string
}

export type OtlpSetupProps = {
  title: string
  description: string
}

export type OtlpFieldProps = {
  label: string
  value: string
  copyLabel: string
}
