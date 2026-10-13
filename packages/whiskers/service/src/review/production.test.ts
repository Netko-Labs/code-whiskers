import { describe, expect, test } from 'bun:test'
import {
  buildProductionContext,
  culpritSegments,
  fileForCulprit,
  productionSignals,
} from './production'

const OTP = 'apps/studio/src/auth/otp.ts'
const FILES = [OTP, 'apps/studio/src/index.ts', 'README.md']

describe('culprits', () => {
  test('url, module and plain paths reduce to path segments', () => {
    expect(culpritSegments('app:///dist/src/auth/otp.js:verify')).toEqual(['src', 'auth', 'otp'])
    expect(culpritSegments('auth.otp:verify')).toEqual(['auth', 'otp'])
    expect(culpritSegments('/srv/app/src/auth/otp.ts:')).toEqual([
      'srv',
      'app',
      'src',
      'auth',
      'otp',
    ])
  })

  test('a culprit points at the changed file sharing its folder and name', () => {
    expect(fileForCulprit('app:///dist/src/auth/otp.js:verify', FILES)).toBe(OTP)
    expect(fileForCulprit('auth.otp:verify', FILES)).toBe(OTP)
  })

  test('a bare common name is not enough to claim a file', () => {
    expect(fileForCulprit('index.js:main', FILES)).toBeNull()
    expect(fileForCulprit('src/billing/cents.ts:add', FILES)).toBeNull()
  })
})

describe('buildProductionContext', () => {
  const issue = {
    id: 'i1',
    title: 'TypeError: contact.owner is undefined',
    culprit: 'src/auth/otp.ts:verifyOtp',
    eventCount: 312,
    userCount: 41,
    lastSeen: new Date(0),
    regressedAt: null,
  }

  test('lists live errors behind the changed files, with what to do about them', () => {
    const signals = productionSignals([issue], FILES)
    const text = buildProductionContext(signals, 2 * 3_600_000)
    expect(text).toContain(
      '- apps/studio/src/auth/otp.ts (verifyOtp): TypeError: contact.owner is undefined — 312 events, 41 users, last 2h ago',
    )
    expect(text).toContain('Raise a finding only')
  })

  test('nothing to say when no error lives in the diff', () => {
    expect(buildProductionContext(productionSignals([issue], ['README.md']))).toBe('')
  })
})
