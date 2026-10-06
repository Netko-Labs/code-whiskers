import { connect, createServer, type Server, type Socket } from 'node:net'
import { CONNECT_HEAD_MAX_BYTES, LOOPBACK } from './constants'
import type { ConnectTarget, EgressProxy } from './types'

/** The tunnel a request head asks for, if it is `CONNECT <allowed host>:443` and nothing else. */
export function allowedTarget(head: string, allowHosts: ReadonlySet<string>): ConnectTarget | null {
  const [method, target = ''] = head.split('\r\n', 1)[0]?.split(' ') ?? []
  const [host = '', port] = target.split(':')
  if (method !== 'CONNECT' || port !== '443' || !allowHosts.has(host)) return null
  return { host, port: 443 }
}

function tunnel(client: Socket, allowHosts: ReadonlySet<string>): void {
  let head = Buffer.alloc(0)
  const onData = (chunk: Buffer) => {
    head = Buffer.concat([head, chunk])
    const end = head.indexOf('\r\n\r\n')
    if (end < 0) {
      if (head.length > CONNECT_HEAD_MAX_BYTES) client.destroy()
      return
    }
    client.off('data', onData)
    const target = allowedTarget(head.subarray(0, end).toString('latin1'), allowHosts)
    if (!target) {
      client.end('HTTP/1.1 403 Forbidden\r\n\r\n')
      return
    }
    const upstream = connect(target.port, target.host, () => {
      client.write('HTTP/1.1 200 Connection Established\r\n\r\n')
      const rest = head.subarray(end + 4)
      if (rest.length > 0) upstream.write(rest)
      client.pipe(upstream)
      upstream.pipe(client)
    })
    upstream.on('error', () => client.destroy())
    client.on('error', () => upstream.destroy())
    client.on('close', () => upstream.destroy())
  }
  client.on('data', onData)
  client.on('error', () => client.destroy())
}

/**
 * The egress container's proxy, in this process: loopback, a port of the kernel's choosing, and
 * only `CONNECT <allowHosts>:443` tunnelled. A jailed harness can connect to nothing else.
 */
export async function startEgressProxy(allowHosts: string[]): Promise<EgressProxy> {
  const allow = new Set(allowHosts)
  const clients = new Set<Socket>()
  const server: Server = createServer((client) => {
    clients.add(client)
    client.on('close', () => clients.delete(client))
    tunnel(client, allow)
  })
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, LOOPBACK, () => resolve())
  })
  const address = server.address()
  if (address === null || typeof address === 'string') {
    server.close()
    throw new Error('egress proxy has no port')
  }
  return {
    port: address.port,
    url: `http://${LOOPBACK}:${address.port}`,
    close: () =>
      new Promise<void>((resolve) => {
        server.close(() => resolve())
        for (const client of clients) client.destroy()
      }),
  }
}
