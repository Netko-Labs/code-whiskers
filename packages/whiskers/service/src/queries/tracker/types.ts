export interface EventFrame {
  file: string
  function: string
  line: number | null
  column: number | null
  isInApp: boolean
  context: string | null
}

export interface EventCrumb {
  timestamp: string | null
  category: string
  level: string
  message: string
}

export interface EventLogLine {
  timestamp: Date
  level: string
  service: string
  message: string
}

export interface EventDetail {
  receivedAt: Date
  level: string
  message: string
  environment: string | null
  release: string | null
  traceId: string | null
  frames: EventFrame[]
  breadcrumbs: EventCrumb[]
  tags: Record<string, string>
  request: { method: string | null; url: string | null } | null
  logs: EventLogLine[]
}
