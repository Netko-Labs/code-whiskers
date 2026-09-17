import { createLogger } from '@code-whiskers/logger'
import { studioEnvConfig } from '@code-whiskers/studio-config'
import { renderMagicLinkEmail } from './magic-link-email'

const logger = createLogger('email')

/**
 * Deliver a magic link through UseSend (self-hosted, Resend-shaped API) when
 * configured; otherwise log the link so local sign-in still works.
 */
export async function sendMagicLinkEmail({
  email,
  url,
}: {
  email: string
  url: string
}): Promise<void> {
  const { from, usesend } = studioEnvConfig.email

  if (!usesend) {
    logger.info(`\n✨ Magic link for ${email}:\n${url}\n`)
    return
  }

  const res = await fetch(new URL('/api/v1/emails', usesend.url), {
    method: 'POST',
    headers: { Authorization: `Bearer ${usesend.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: email,
      subject: 'Your CodeWhiskers sign-in link',
      html: renderMagicLinkEmail(url),
    }),
  })
  if (!res.ok) {
    logger.error({ status: res.status, body: await res.text() }, 'magic link send failed')
  }
}
