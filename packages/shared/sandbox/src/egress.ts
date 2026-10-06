import {
  DEFAULT_IMAGE,
  DEFAULT_TTL_MS,
  EGRESS_ALIAS,
  EGRESS_PORT,
  EGRESS_PROXY_SCRIPT,
  EGRESS_READY,
  EGRESS_READY_TIMEOUT_MS,
  LABEL,
} from './constants'
import { docker } from './docker'
import type { EgressNetwork, EgressOptions } from './types'

/**
 * An `--internal` network (no route out) plus a proxy container that also sits on the default
 * bridge. A sandbox joined to `network` reaches the internet only through `proxyUrl`, and only
 * to `allowHosts`. The proxy dies with its TTL like any sandbox.
 */
export async function createEgressNetwork({
  allowHosts,
  ttlMs,
}: EgressOptions): Promise<EgressNetwork> {
  const network = `${LABEL}-${crypto.randomUUID().slice(0, 8)}`
  const ttlSeconds = Math.ceil((ttlMs ?? DEFAULT_TTL_MS) / 1000)
  const created = await docker([
    'network',
    'create',
    '--internal',
    '--label',
    `${LABEL}=1`,
    network,
  ])
  if (created.code !== 0) throw new Error(`egress network failed: ${created.stderr.trim()}`)

  const removeNetwork = () => docker(['network', 'rm', network])
  const proxy = await docker([
    'run',
    '-d',
    '--rm',
    '--label',
    `${LABEL}=1`,
    '--network',
    network,
    '--network-alias',
    EGRESS_ALIAS,
    '--memory',
    '128m',
    '--cpus',
    '0.5',
    '--read-only',
    '--security-opt',
    'no-new-privileges',
    '-e',
    `ALLOW_HOSTS=${allowHosts.join(',')}`,
    '-e',
    `PROXY_SCRIPT=${EGRESS_PROXY_SCRIPT}`,
    DEFAULT_IMAGE,
    'sh',
    '-c',
    `exec timeout ${ttlSeconds} bun -e "$PROXY_SCRIPT"`,
  ])
  if (proxy.code !== 0) {
    await removeNetwork()
    throw new Error(`egress proxy failed: ${proxy.stderr.trim()}`)
  }
  const proxyId = proxy.stdout.trim()
  const destroy = async () => {
    await docker(['rm', '-f', proxyId])
    await removeNetwork()
  }

  const connected = await docker(['network', 'connect', 'bridge', proxyId])
  if (connected.code !== 0) {
    await destroy()
    throw new Error(`egress proxy has no way out: ${connected.stderr.trim()}`)
  }
  if (!(await isListening(proxyId))) {
    await destroy()
    throw new Error('egress proxy did not start')
  }
  return { network, proxyUrl: `http://${EGRESS_ALIAS}:${EGRESS_PORT}`, destroy }
}

async function isListening(proxyId: string): Promise<boolean> {
  const deadline = Date.now() + EGRESS_READY_TIMEOUT_MS
  while (Date.now() < deadline) {
    const logs = await docker(['logs', proxyId])
    if (logs.stdout.includes(EGRESS_READY)) return true
    await Bun.sleep(100)
  }
  return false
}
