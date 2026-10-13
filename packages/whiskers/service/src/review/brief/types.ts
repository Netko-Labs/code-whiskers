import type { Finding, LoopVerdict, Review } from '@code-whiskers/whiskers-domain'
import type { HumanReason } from '../types'

export type BriefNote = { kind: string; body: string }

export type BriefInput = {
  pr: string
  reviews: Review[]
  findings: Finding[]
}

export type BriefRound = {
  round: number
  head: string
  verdict: LoopVerdict | null
  fixed: string[]
}

export type BriefItem = Pick<
  Finding,
  'severity' | 'title' | 'file' | 'line' | 'doneWhen' | 'threadUrl'
>

export type MergeBrief = {
  pr: string
  head: string
  round: number
  verdict: LoopVerdict
  humanReason: HumanReason | null
  rounds: BriefRound[]
  open: BriefItem[]
  suggestions: BriefItem[]
  hotspots: { file: string; findings: number }[]
  memory: BriefNote[]
  markdown: string
}
