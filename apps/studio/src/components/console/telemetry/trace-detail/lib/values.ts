import type { Tone } from '@/components/shared/status'

/** Services take the five system blues in order of appearance; red stays for errors. */
export const SERVICE_FILLS = ['bg-chart-1', 'bg-chart-3', 'bg-chart-2', 'bg-chart-5', 'bg-chart-4']

export const SPAN_KINDS: Record<number, string> = {
  0: 'Unspecified',
  1: 'Internal',
  2: 'Server',
  3: 'Client',
  4: 'Producer',
  5: 'Consumer',
}

export const INDENT_PX = 14
export const AXIS_TICKS = 5
// Log lines and error events land on their own clocks; widen the link a little either side.
export const RELATED_SLACK_MS = 60_000
export const WATERFALL_SPLIT = 'grid-cols-[minmax(220px,38%)_minmax(0,1fr)]'

export const SPAN_STATUS_TONE: Record<'error' | 'ok' | 'unset', Tone> = {
  error: 'error',
  ok: 'resolved',
  unset: 'neutral',
}
