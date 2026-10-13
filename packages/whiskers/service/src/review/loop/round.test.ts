import { describe, expect, test } from 'bun:test'
import type { Finding, LlmFinding } from '@code-whiskers/whiskers-domain'
import type { PriorThread } from '../types'
import { findingFingerprint } from './fingerprint'
import { fixedThreads } from './fixed'
import { closeRound } from './round'
import type { RoundInput } from './types'
import { loopVerdict } from './verdict'

const REF = { owner: 'acme', repo: 'shop', prNumber: 41 }
const LINEAGE = 'acme/shop#41'
const FILE = 'src/auth/verify-otp.ts'
const URL = 'https://github.com/acme/shop/pull/41#discussion_r1'
const DELTA = `diff --git a/${FILE} b/${FILE}
--- a/${FILE}
+++ b/${FILE}
@@ -86,3 +86,3 @@
 const contact = await findContact(id)
-if (!contact) throw new Error('missing')
+if (!contact || contact.shopperId !== shopperId) throw new Error('missing')
 return contact
`

function finding(title: string, patch: Partial<LlmFinding> = {}): LlmFinding {
  return {
    file: FILE,
    line: 88,
    severity: 'high',
    category: 'security',
    title,
    body: '',
    suggestion: null,
    evidence: '',
    ...patch,
  }
}

function thread(title: string, patch: Partial<PriorThread> = {}): PriorThread {
  return {
    path: FILE,
    line: 88,
    title,
    severity: 'high',
    isResolved: false,
    isOutdated: false,
    isDownvoted: false,
    replies: [],
    id: 'PRRT_1',
    url: URL,
    ...patch,
  }
}

function row(title: string, patch: Partial<Finding> = {}): Finding {
  return {
    id: crypto.randomUUID(),
    reviewId: crypto.randomUUID(),
    file: FILE,
    line: 88,
    severity: 'high',
    category: 'security',
    title,
    body: 'Any shopper can verify another shopper’s contact.',
    suggestion: null,
    fingerprint: null,
    doneWhen: null,
    evidence: null,
    sinceRound: null,
    threadUrl: null,
    createdAt: new Date(),
    ...patch,
  }
}

function input(patch: Partial<RoundInput>): RoundInput {
  return {
    ref: REF,
    round: 2,
    fresh: [],
    repeated: [],
    raised: [],
    priorThreads: [],
    stillBlocking: [],
    previous: [],
    delta: null,
    isComplete: true,
    ...patch,
  }
}

const OTP = 'verifyOtp accepts a contact owned by another shopper'
const OTP_REWORDED = 'verifyOtp accepts another shopper contact'

describe('closeRound — finding ids', () => {
  test('a new finding gets an id derived from the PR, file and title', () => {
    const loop = closeRound(input({ fresh: [finding(OTP)] }))
    expect(loop.fresh[0]).toMatchObject({
      fingerprint: findingFingerprint(LINEAGE, FILE, OTP),
      sinceRound: 2,
      threadUrl: null,
    })
    expect(loop.fresh[0]?.fingerprint).toMatch(/^wf_[0-9a-f]{6}$/)
  })

  test('a repeat inherits the id and round its thread carries', () => {
    const open = thread(OTP, { fingerprint: 'wf_7c1e00', round: 1 })
    const loop = closeRound(
      input({ repeated: [finding(OTP_REWORDED)], priorThreads: [open], stillBlocking: [open] }),
    )
    expect(loop.findings[0]).toMatchObject({
      fingerprint: 'wf_7c1e00',
      sinceRound: 1,
      threadUrl: URL,
    })
  })

  test('a thread from before ids existed takes the id of the row it was posted from', () => {
    const legacy = thread(OTP)
    const loop = closeRound(
      input({
        round: 3,
        repeated: [finding(OTP_REWORDED)],
        priorThreads: [legacy],
        stillBlocking: [legacy],
        previous: [row(OTP, { fingerprint: 'wf_aaaaaa', sinceRound: 1 })],
      }),
    )
    expect(loop.findings[0]).toMatchObject({ fingerprint: 'wf_aaaaaa', sinceRound: 1 })
  })

  test('a finding with no thread inherits from the last review’s matching row', () => {
    const loop = closeRound(
      input({
        repeated: [finding(OTP_REWORDED, { line: null })],
        previous: [row(OTP, { line: null, fingerprint: 'wf_bbbbbb', sinceRound: 1 })],
      }),
    )
    expect(loop.findings[0]?.fingerprint).toBe('wf_bbbbbb')
  })

  test('two findings that want one id never share it', () => {
    const loop = closeRound(
      input({ fresh: [finding(OTP), finding(OTP.toUpperCase(), { line: 120 })] }),
    )
    const [first, second] = loop.fresh
    expect(first?.fingerprint).not.toBe(second?.fingerprint)
  })

  test('raised again after the bot closed it as fixed, it keeps its id on a new thread', () => {
    const closed = thread(OTP, { fingerprint: 'wf_7c1e00', round: 1, isFixed: true })
    const loop = closeRound(input({ fresh: [finding(OTP)], priorThreads: [closed] }))
    expect(loop.fresh[0]).toMatchObject({ fingerprint: 'wf_7c1e00', threadUrl: null })
  })
})

describe('closeRound — carried blockers and the verdict', () => {
  test('an unanswered blocker the delta did not see stays open, with what was stored', () => {
    const open = thread(OTP, { fingerprint: 'wf_7c1e00', round: 1 })
    const loop = closeRound(
      input({
        priorThreads: [open],
        stillBlocking: [open],
        previous: [row(OTP, { fingerprint: 'wf_7c1e00', sinceRound: 1, doneWhen: 'it rejects' })],
      }),
    )
    expect(loop.findings).toHaveLength(1)
    expect(loop.findings[0]).toMatchObject({
      fingerprint: 'wf_7c1e00',
      sinceRound: 1,
      severity: 'high',
      category: 'security',
      doneWhen: 'it rejects',
      threadUrl: URL,
    })
    expect(loop.fresh).toEqual([])
    expect(loop.verdict).toBe('needs_changes')
  })

  test('a repeat the model now rates medium keeps the severity GitHub shows', () => {
    const open = thread(OTP, { severity: 'critical' })
    const loop = closeRound(
      input({
        repeated: [finding(OTP, { severity: 'medium' })],
        priorThreads: [open],
        stillBlocking: [open],
      }),
    )
    expect(loop.findings).toHaveLength(1)
    expect(loop.findings[0]?.severity).toBe('critical')
    expect(loop.verdict).toBe('blocked')
  })

  test('nothing open on a complete review is mergeable', () => {
    const loop = closeRound(input({ fresh: [finding('Nit', { severity: 'low' })] }))
    expect(loop.verdict).toBe('mergeable')
  })
})

describe('loopVerdict', () => {
  test('a critical blocks, a high asks for changes, the rest merges', () => {
    expect(loopVerdict([{ severity: 'critical' }, { severity: 'high' }], true)).toBe('blocked')
    expect(loopVerdict([{ severity: 'high' }, { severity: 'low' }], true)).toBe('needs_changes')
    expect(loopVerdict([{ severity: 'medium' }], true)).toBe('mergeable')
    expect(loopVerdict([], true)).toBe('mergeable')
  })

  test('a review that skipped sections never says mergeable', () => {
    expect(loopVerdict([], false)).toBe('needs_changes')
  })
})

describe('fixedThreads', () => {
  const outdated = thread(OTP, { isOutdated: true })
  const base = { threads: [outdated], raised: [], delta: DELTA, isComplete: true }

  test('an outdated blocker on a file the delta touched, not raised again, is fixed', () => {
    expect(fixedThreads(base)).toEqual([outdated])
  })

  test('a fixed blocker is reported by id', () => {
    const marked = thread(OTP, { isOutdated: true, fingerprint: 'wf_19ab00', round: 1 })
    const loop = closeRound(input({ priorThreads: [marked], delta: DELTA }))
    expect(loop.fixed).toEqual([marked])
    expect(loop.fixedFingerprints).toEqual(['wf_19ab00'])
  })

  test('anything short of every signal leaves the thread open', () => {
    expect(fixedThreads({ ...base, delta: null })).toEqual([])
    expect(fixedThreads({ ...base, isComplete: false })).toEqual([])
    expect(fixedThreads({ ...base, raised: [finding(OTP_REWORDED)] })).toEqual([])
    expect(fixedThreads({ ...base, threads: [thread(OTP)] })).toEqual([])
    expect(
      fixedThreads({ ...base, threads: [thread(OTP, { isOutdated: true, path: 'b.ts' })] }),
    ).toEqual([])
    expect(
      fixedThreads({
        ...base,
        threads: [thread(OTP, { isOutdated: true, replies: [{ author: 'ana', body: 'wontfix' }] })],
      }),
    ).toEqual([])
    expect(
      fixedThreads({ ...base, threads: [thread(OTP, { isOutdated: true, severity: 'medium' })] }),
    ).toEqual([])
  })
})
