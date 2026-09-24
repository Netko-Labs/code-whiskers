export interface IntegrationRecord {
  id: string
  installationId: number
  organization: string
  kind: string
  name: string
  urlHost: string
  lastDeliveredAt: Date | null
  lastError: string | null
  createdAt: Date
}

export interface Notice {
  title: string
  text: string
  url?: string
}

export interface DeliveryResult {
  delivered: number
  failed: number
}
