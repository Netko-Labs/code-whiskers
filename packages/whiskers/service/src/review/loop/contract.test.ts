import { describe, expect, test } from 'bun:test'
import {
  type Finding,
  type LlmFinding,
  type Review,
  ReviewContractSchema,
} from '@code-whiskers/whiskers-domain'
import { renderFinding, renderFindingMarker } from '../render'
import { identityOf } from '../threads'
import { buildReviewContract, contractOfReview } from './contract'
import { findingFingerprint } from './fingerprint'

const REF = { owner: 'acme', repo: 'shop', prNumber: 41 }

function source(patch: Partial<Finding>) {
  return {
    file: 'src/a.ts',
    line: 10,
    severity: 'high' as const,
    title: 'A finding',
    fingerprint: 'wf_000001',
    sinceRound: 1,
    threadUrl: null,
    ...patch,
  }
}

describe('buildReviewContract', () => {
  test('blockers and suggestions split by severity, heaviest first', () => {
    const contract = buildReviewContract({
      ref: REF,
      headSha: '9f3013a',
      round: 2,
      verdict: 'blocked',
      fixed: ['wf_19ab00'],
      findings: [
        source({ severity: 'low', fingerprint: 'wf_000003' }),
        source({ severity: 'high', fingerprint: 'wf_000002', file: 'src/b.ts' }),
        source({
          severity: 'critical',
          fingerprint: 'wf_7c1e00',
          line: 88,
          doneWhen: ' verifyOtp rejects a foreign contact ',
          evidence: '',
          threadUrl: 'https://github.com/acme/shop/pull/41#discussion_r1',
        }),
      ],
    })
    expect(ReviewContractSchema.parse(contract)).toEqual(contract)
    expect(contract).toMatchObject({
      pr: 'acme/shop#41',
      head: '9f3013a',
      round: 2,
      verdict: 'blocked',
      fixed_since_last_round: ['wf_19ab00'],
    })
    expect(contract.blockers.map((b) => b.id)).toEqual(['wf_7c1e00', 'wf_000002'])
    expect(contract.blockers[0]).toEqual({
      id: 'wf_7c1e00',
      since_round: 1,
      file: 'src/a.ts',
      line: 88,
      severity: 'critical',
      title: 'A finding',
      done_when: 'verifyOtp rejects a foreign contact',
      evidence: null,
      thread: 'https://github.com/acme/shop/pull/41#discussion_r1',
    })
    expect(contract.suggestions.map((s) => s.id)).toEqual(['wf_000003'])
  })
})

describe('contractOfReview', () => {
  const review = {
    owner: 'acme',
    repo: 'shop',
    prNumber: 41,
    headSha: 'abc1234',
    summary: 'Adds OTP.',
    round: null,
    loopVerdict: null,
    fixedSinceLastRound: [],
  } as unknown as Review

  test('a review from before the loop gets an id, a round and a derived verdict', () => {
    const legacy = {
      ...source({ fingerprint: null, sinceRound: null }),
      doneWhen: null,
      evidence: null,
    } as unknown as Finding
    const contract = contractOfReview(review, [legacy])
    expect(contract.round).toBe(1)
    expect(contract.verdict).toBe('needs_changes')
    expect(contract.blockers[0]?.id).toBe(
      findingFingerprint('acme/shop#41', 'src/a.ts', 'A finding'),
    )
    expect(contract.blockers[0]?.since_round).toBe(1)
  })

  test('a stored loop verdict wins', () => {
    const contract = contractOfReview({ ...review, round: 3, loopVerdict: 'mergeable' }, [])
    expect(contract).toMatchObject({ round: 3, verdict: 'mergeable', blockers: [] })
  })
})

describe('the id round-trips through the inline comment', () => {
  const posted: LlmFinding & { fingerprint: string; sinceRound: number } = {
    file: 'src/a.ts',
    line: 10,
    severity: 'high',
    category: 'security',
    title: 'Contact ownership is never checked',
    body: 'Any shopper can verify another shopper’s contact.',
    suggestion: null,
    evidence: '',
    doneWhen: 'verifyOtp rejects a contact owned by another shopper',
    fingerprint: 'wf_7c1e00',
    sinceRound: 2,
  }

  test('a blocker says when it is done; the id stays invisible', () => {
    const body = `${renderFinding(posted)}${renderFindingMarker(posted)}`
    expect(body).toContain('_Done when verifyOtp rejects a contact owned by another shopper_')
    expect(body).toEndWith('<!-- whiskers-finding wf_7c1e00 round=2 -->')
    expect(identityOf(body)).toEqual({ fingerprint: 'wf_7c1e00', round: 2, category: 'security' })
  })

  test('a suggestion keeps its comment free of the done-when line', () => {
    expect(renderFinding({ ...posted, severity: 'medium' })).not.toContain('Done when')
  })

  test('older comments carry no id', () => {
    expect(identityOf(renderFinding(posted)).fingerprint).toBeUndefined()
  })
})
