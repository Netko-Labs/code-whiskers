import type { ApiKeyCaller } from '../keys'

export type McpCaller = ApiKeyCaller

export interface PrRef {
  owner: string
  repo: string
  number: number
  slug: string
}

export type ToolResult = {
  content: { type: 'text'; text: string }[]
  isError?: boolean
}
