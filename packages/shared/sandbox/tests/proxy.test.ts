import { describe, expect, test } from 'bun:test'
import { connect } from 'node:net'
import { startEgressProxy } from '../src'

const ask = (port: number, head: string) =>
  new Promise<string>((resolve) => {
    let answer = ''
    const socket = connect(port, '127.0.0.1', () => socket.write(head))
    socket.on('data', (chunk) => {
      answer += chunk.toString()
    })
    socket.on('close', () => resolve(answer))
  })

describe('in-process egress proxy', () => {
  test('listens on loopback only and refuses anything but CONNECT to an allowed host on 443', async () => {
    const proxy = await startEgressProxy(['api.anthropic.com'])
    try {
      expect(proxy.url).toBe(`http://127.0.0.1:${proxy.port}`)
      const refused = 'HTTP/1.1 403 Forbidden\r\n\r\n'
      expect(await ask(proxy.port, 'CONNECT example.com:443 HTTP/1.1\r\n\r\n')).toBe(refused)
      expect(await ask(proxy.port, 'CONNECT api.anthropic.com:22 HTTP/1.1\r\n\r\n')).toBe(refused)
      expect(await ask(proxy.port, 'GET http://api.anthropic.com/ HTTP/1.1\r\n\r\n')).toBe(refused)
    } finally {
      await proxy.close()
    }
  })
})
