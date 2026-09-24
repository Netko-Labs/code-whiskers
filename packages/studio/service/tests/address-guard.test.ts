import { describe, expect, test } from 'bun:test'
import { assertPublicHost, isPrivateAddress } from '../src/integrations/address-guard'

describe('isPrivateAddress', () => {
  test('private, loopback and metadata ranges are refused', () => {
    for (const ip of [
      '10.1.2.3',
      '127.0.0.1',
      '169.254.169.254',
      '172.20.0.5',
      '192.168.1.1',
      '100.64.0.1',
      '::1',
      'fd00::1',
      '::ffff:127.0.0.1',
    ]) {
      expect(isPrivateAddress(ip)).toBe(true)
    }
  })

  test('public addresses pass', () => {
    for (const ip of ['8.8.8.8', '172.32.0.1', '2606:4700::1111']) {
      expect(isPrivateAddress(ip)).toBe(false)
    }
  })
})

describe('assertPublicHost', () => {
  test('a literal private IP is refused without a lookup', async () => {
    await expect(assertPublicHost('https://169.254.169.254/latest/meta-data')).rejects.toThrow()
    await expect(assertPublicHost('https://[::1]/hook')).rejects.toThrow()
  })

  test('localhost resolves inward and is refused', async () => {
    await expect(assertPublicHost('https://localhost/hook')).rejects.toThrow()
  })
})
