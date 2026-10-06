import { describe, expect, test } from 'bun:test'
import { createEgressNetwork, createSandbox, dockerAvailable } from '../src'

const hasDocker = await dockerAvailable()

const probe = (url: string, proxy?: string) =>
  `bun -e "fetch('${url}', { ${proxy ? `proxy: '${proxy}', ` : ''}signal: AbortSignal.timeout(8000) }).then((r) => console.log('STATUS', r.status), () => console.log('BLOCKED'))"`

describe.if(hasDocker)('egress network', () => {
  test('only the allowed host is reachable, and only through the proxy', async () => {
    const egress = await createEgressNetwork({ allowHosts: ['api.anthropic.com'], ttlMs: 60_000 })
    const sandbox = await createSandbox({ network: egress.network, ttlMs: 60_000 })
    try {
      const allowed = await sandbox.exec(probe('https://api.anthropic.com', egress.proxyUrl))
      expect(allowed.stdout).toMatch(/STATUS (?!403)\d+/)

      const otherHost = await sandbox.exec(probe('https://example.com', egress.proxyUrl))
      expect(otherHost.stdout).toMatch(/BLOCKED|STATUS 403/)

      const direct = await sandbox.exec(probe('https://api.anthropic.com'))
      expect(direct.stdout).toContain('BLOCKED')
    } finally {
      await sandbox.destroy()
      await egress.destroy()
    }
  }, 120_000)
})
