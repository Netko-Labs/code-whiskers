import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

const PRIVATE_V4: [number, number][] = [
  [0x0a000000, 0xff000000], // 10.0.0.0/8
  [0x7f000000, 0xff000000], // 127.0.0.0/8
  [0xa9fe0000, 0xffff0000], // 169.254.0.0/16 — cloud metadata lives here
  [0xac100000, 0xfff00000], // 172.16.0.0/12
  [0xc0a80000, 0xffff0000], // 192.168.0.0/16
  [0x64400000, 0xffc00000], // 100.64.0.0/10
  [0x00000000, 0xff000000], // 0.0.0.0/8
]

function v4ToNumber(ip: string): number {
  return ip.split('.').reduce((acc, part) => (acc << 8) + Number(part), 0) >>> 0
}

export function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 4) {
    const value = v4ToNumber(ip)
    return PRIVATE_V4.some(([network, mask]) => (value & mask) >>> 0 === network)
  }
  const lower = ip.toLowerCase()
  if (lower.startsWith('::ffff:')) return isPrivateAddress(lower.slice('::ffff:'.length))
  return (
    lower === '::1' ||
    lower === '::' ||
    lower.startsWith('fc') ||
    lower.startsWith('fd') ||
    lower.startsWith('fe80')
  )
}

/**
 * A webhook is a URL a member typed and studio will POST to. Refuse anything that resolves inside
 * the network — loopback, private ranges, link-local metadata — so it cannot be aimed at
 * services only studio can reach.
 */
export async function assertPublicHost(url: string): Promise<void> {
  const { hostname } = new URL(url)
  const host = hostname.replace(/^\[|\]$/g, '')
  const addresses = isIP(host) ? [host] : (await lookup(host, { all: true })).map((a) => a.address)
  if (addresses.length === 0 || addresses.some(isPrivateAddress)) {
    throw new Error('webhook host resolves to a private address')
  }
}
