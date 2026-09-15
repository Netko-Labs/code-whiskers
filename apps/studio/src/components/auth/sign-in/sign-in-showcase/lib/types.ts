export type LogLevel = 'INFO' | 'WARN' | 'ERROR'

export interface LogLine {
  time: string
  level: LogLevel
  source: string
  text: string
  meta?: string
}

export interface ErrorSparkBar {
  height: number
  hot: boolean
}
