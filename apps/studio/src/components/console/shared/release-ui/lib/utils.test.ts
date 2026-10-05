import { describe, expect, test } from 'bun:test'
import { commitSubject, deployCurl, verdictLook } from './utils'

describe('deployCurl', () => {
  test('one line, client key in the DSN header, sha from the build environment', () => {
    const line = deployCurl('https://cw.example', '7', 'abc123')
    expect(line).not.toContain('\n')
    expect(line).toStartWith('curl -fsS -X POST https://cw.example/api/7/deploys ')
    expect(line).toContain('-H "Authorization: DSN abc123"')
    expect(line).toContain(
      '-d "{\\"version\\":\\"$SOURCE_COMMIT\\",\\"environment\\":\\"production\\",\\"commitSha\\":\\"$SOURCE_COMMIT\\"}"',
    )
  })

  test('the body it sends is the JSON the deploy API takes', async () => {
    const line = deployCurl('https://cw.example', '7', 'abc123', 'staging')
    const quoted = line.slice(line.indexOf('-d "') + 4, -1).replaceAll('\\"', '"')
    expect(JSON.parse(quoted.replaceAll('$SOURCE_COMMIT', 'abc1234'))).toEqual({
      version: 'abc1234',
      environment: 'staging',
      commitSha: 'abc1234',
    })
  })
})

describe('commits', () => {
  test('the subject is the first line', () => {
    expect(commitSubject('fix: a thing\n\nlong body')).toBe('fix: a thing')
  })

  test('a verdict reads as a status; a running or failed review says so', () => {
    expect(verdictLook({ id: 'r', status: 'completed', verdict: 'approve' })).toEqual({
      tone: 'resolved',
      label: 'Approved',
    })
    expect(verdictLook({ id: 'r', status: 'completed', verdict: 'request_changes' }).tone).toBe(
      'error',
    )
    expect(verdictLook({ id: 'r', status: 'running', verdict: null }).label).toBe('Reviewing…')
    expect(verdictLook({ id: 'r', status: 'failed', verdict: null }).label).toBe('Review failed')
  })
})
