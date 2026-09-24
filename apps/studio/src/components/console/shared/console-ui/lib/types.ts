import type {
  ConsoleSeverity,
  ConsoleTone,
  DiffLine,
  LogLine,
  PillTone,
  StackFrame,
} from '../../console-model'

export type SeverityDotProps = {
  severity: ConsoleSeverity
  size?: 'sm' | 'md'
  className?: string
}

export type ConsolePillProps = {
  tone: PillTone
  children: React.ReactNode
  className?: string
}

export type CodeHunkProps = {
  lines: DiffLine[]
  numberWidth?: string
}

export type LogLinesProps = {
  lines: LogLine[]
  className?: string
}

export type StackTraceProps = {
  title: string
  frames: StackFrame[]
  hiddenNote?: string
}

export type ToneTextProps = {
  tone?: ConsoleTone
  children: React.ReactNode
  className?: string
}

export type PersonAvatarProps = {
  name: string
  image?: string | null
  isSelf?: boolean
  className?: string
}
