import { readFileSync, writeFileSync } from 'node:fs'
import { connect } from 'node:net'
import { join } from 'node:path'

// Runs inside the jail; argv: checkout, outside dir, home, a forbidden port, the proxy URL.
const [checkout = '', outside = '', home = '', forbiddenPort = '0', proxy = ''] =
  process.argv.slice(2)

const attempt = (action: () => unknown): string => {
  try {
    action()
    return 'ok'
  } catch (error) {
    return (error as NodeJS.ErrnoException).code ?? String(error)
  }
}

const connectTo = (port: number) =>
  new Promise<string>((resolve) => {
    const socket = connect(port, '127.0.0.1', () => {
      socket.destroy()
      resolve('ok')
    })
    socket.on('error', (error: NodeJS.ErrnoException) => resolve(error.code ?? 'error'))
  })

const fetchThrough = (url: string) =>
  fetch(url, { proxy, signal: AbortSignal.timeout(10_000) }).then(
    (response) => `status ${response.status}`,
    () => 'refused',
  )

const udp = () =>
  new Promise<string>((resolve) => {
    import('node:dgram').then(({ createSocket }) => {
      try {
        const socket = createSocket('udp4')
        socket.on('error', (error: NodeJS.ErrnoException) => resolve(error.code ?? 'error'))
        socket.bind(0, () => {
          socket.close()
          resolve('ok')
        })
      } catch (error) {
        resolve((error as NodeJS.ErrnoException).code ?? 'error')
      }
    })
  })

const unshare = async () => {
  const { dlopen, FFIType } = await import('bun:ffi')
  const { symbols } = dlopen('libc.so.6', {
    unshare: { args: [FFIType.i32], returns: FFIType.i32 },
  })
  return symbols.unshare(0x10000000) === 0 ? 'ok' : 'refused'
}

const report = {
  uid: process.getuid?.() ?? -1,
  readInside: attempt(() => readFileSync(join(checkout, 'inside.txt'), 'utf8')),
  readOutside: attempt(() => readFileSync(join(outside, 'secret.txt'), 'utf8')),
  readWorkerEnv: attempt(() => readFileSync(`/proc/${process.ppid}/environ`)),
  writeCheckout: attempt(() => writeFileSync(join(checkout, 'planted.txt'), 'x')),
  writeOutside: attempt(() => writeFileSync(join(outside, 'planted.txt'), 'x')),
  writeHome: attempt(() => writeFileSync(join(home, 'note.txt'), 'x')),
  connectForbidden: await connectTo(Number(forbiddenPort)),
  allowedHost: await fetchThrough('https://api.anthropic.com/'),
  otherHost: await fetchThrough('https://example.com/'),
  udp: await udp(),
  unshare: await unshare().catch(() => 'refused'),
}
process.stdout.write(JSON.stringify(report))
