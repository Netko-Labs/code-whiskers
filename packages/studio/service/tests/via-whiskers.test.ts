import { describe, expect, test } from 'bun:test'
import { isOauthAppRefusal } from '../src/github/via-whiskers'

describe('isOauthAppRefusal', () => {
  test('the 403 GitHub sends an OAuth App token for /user/installations', () => {
    expect(
      isOauthAppRefusal({
        status: 403,
        message:
          'You must authenticate with an access token authorized to a GitHub App in order to list installations',
      }),
    ).toBe(true)
  })

  test('any other failure is not a reason to ask the worker', () => {
    expect(isOauthAppRefusal({ status: 403, message: 'API rate limit exceeded' })).toBe(false)
    expect(isOauthAppRefusal({ status: 401, message: 'Bad credentials' })).toBe(false)
  })
})
