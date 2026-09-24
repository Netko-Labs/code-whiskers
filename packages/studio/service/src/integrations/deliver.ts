import type { Notice } from './types'

const DELIVERY_TIMEOUT_MS = 8_000

/** Slack and Discord each want their own envelope; anything else gets the notice as JSON. */
function payloadFor(kind: string, notice: Notice): unknown {
  const line = notice.url ? `${notice.text}\n${notice.url}` : notice.text
  if (kind === 'slack') return { text: `*${notice.title}*\n${line}` }
  if (kind === 'discord') return { content: `**${notice.title}**\n${line}` }
  return { source: 'codewhiskers', ...notice }
}

export async function postNotice(kind: string, url: string, notice: Notice): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payloadFor(kind, notice)),
    signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
    redirect: 'error',
  })
  if (!response.ok) throw new Error(`webhook answered ${response.status}`)
}
