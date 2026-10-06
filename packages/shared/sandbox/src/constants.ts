export const LABEL = 'code-whiskers-sandbox'
export const DEFAULT_IMAGE = 'oven/bun:1-alpine'
export const DEFAULT_TTL_MS = 10 * 60_000
export const WORKDIR = '/workspace'
export const DOCKER_CLIENT_ENV = ['PATH', 'HOME', 'DOCKER_HOST', 'DOCKER_CONFIG', 'DOCKER_CONTEXT']
export const EGRESS_ALIAS = 'egress'
export const EGRESS_PORT = 3128
export const EGRESS_READY = 'egress ready'
export const EGRESS_READY_TIMEOUT_MS = 10_000

/**
 * Runs inside the proxy container (`bun -e`). Only `CONNECT <allowed host>:443` is tunnelled;
 * anything else — plain HTTP, another host, another port — gets a 403 and a closed socket.
 */
export const EGRESS_PROXY_SCRIPT = `
const net = require('node:net')
const allow = new Set((process.env.ALLOW_HOSTS || '').split(',').filter(Boolean))
net.createServer((client) => {
  let head = Buffer.alloc(0)
  const onData = (chunk) => {
    head = Buffer.concat([head, chunk])
    const end = head.indexOf('\\r\\n\\r\\n')
    if (end < 0) { if (head.length > 8192) client.destroy(); return }
    client.off('data', onData)
    const [method, target] = head.subarray(0, end).toString('latin1').split(' ')
    const [host, port] = (target || '').split(':')
    if (method !== 'CONNECT' || !allow.has(host) || port !== '443') {
      client.end('HTTP/1.1 403 Forbidden\\r\\n\\r\\n')
      return
    }
    const upstream = net.connect(443, host, () => {
      client.write('HTTP/1.1 200 Connection Established\\r\\n\\r\\n')
      const rest = head.subarray(end + 4)
      if (rest.length) upstream.write(rest)
      client.pipe(upstream)
      upstream.pipe(client)
    })
    upstream.on('error', () => client.destroy())
    client.on('error', () => upstream.destroy())
  }
  client.on('data', onData)
}).listen(${EGRESS_PORT}, '0.0.0.0', () => console.log('${EGRESS_READY}'))
`
export const LOOPBACK = '127.0.0.1'
export const CONNECT_HEAD_MAX_BYTES = 8192
