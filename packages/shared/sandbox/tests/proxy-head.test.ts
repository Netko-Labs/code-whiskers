import { afterAll, describe, expect, test } from 'bun:test'
import { connect } from 'node:net'
import { startEgressProxy } from '../src'
import { CONNECT_HEAD_MAX_BYTES } from '../src/constants'

const proxy = await startEgressProxy(['api.anthropic.com'])
afterAll(() => proxy.close())

function send(payload: string): Promise<string> {
  return new Promise((resolve) => {
    const socket = connect(proxy.port, '127.0.0.1', () => socket.write(payload))
    let reply = ''
    socket.on('data', (chunk) => {
      reply += chunk.toString()
    })
    socket.on('close', () => resolve(reply))
    socket.on('error', () => resolve(reply))
  })
}

describe('egress proxy request head', () => {
  test('an oversized head is refused even when it ends in the same chunk', async () => {
    const padding = 'x'.repeat(CONNECT_HEAD_MAX_BYTES + 1)
    const reply = await send(`CONNECT api.anthropic.com:443 HTTP/1.1\r\nX-Pad: ${padding}\r\n\r\n`)
    expect(reply).not.toContain('200')
  })

  test('a host off the allow-list gets 403', async () => {
    expect(await send('CONNECT example.com:443 HTTP/1.1\r\n\r\n')).toContain('403')
  })
})
