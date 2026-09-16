/**
 * Table-safe HTML magic-link email in the brand palette (ink on paper, one
 * ink button). Plain string builder on purpose: no email-templating dep.
 */
export function renderMagicLinkEmail(url: string): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f5f5f5;font-family:Inter,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#09090b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e5;border-radius:14px;">
      <tr><td style="padding:32px;">
        <p style="margin:0 0 20px;font-size:13px;font-weight:600;letter-spacing:-0.01em;">Code Whiskers</p>
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;letter-spacing:-0.02em;">Sign in</h1>
        <p style="margin:0 0 24px;color:#737373;font-size:14px;line-height:20px;">
          This link signs you in once and expires in 10 minutes.
        </p>
        <a href="${url}" style="display:inline-block;background:#09090b;color:#ffffff;text-decoration:none;font-weight:500;font-size:14px;padding:10px 20px;border-radius:8px;">
          Continue
        </a>
        <p style="margin:24px 0 0;color:#737373;font-size:12px;line-height:16px;">
          If the button doesn't work, paste this into your browser:<br />
          <span style="font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;word-break:break-all;color:#09090b;">${url}</span>
        </p>
        <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #e5e5e5;color:#737373;font-size:12px;line-height:16px;">
          Didn't request this? Ignore it. Nothing happens until the link is opened.
        </p>
      </td></tr>
    </table>
  </body>
</html>`
}
