import type { z } from 'zod'
import type { whiskersLogPatternSchema } from '@/integrations/whiskers'

export type LogPattern = z.infer<typeof whiskersLogPatternSchema>

export type PatternPart = {
  text: string
  isVariable: boolean
}

export type PatternRowProps = {
  pattern: LogPattern
  isExpanded: boolean
  onToggle: (hash: string) => void
  onShowLines: (pattern: LogPattern) => void
}
