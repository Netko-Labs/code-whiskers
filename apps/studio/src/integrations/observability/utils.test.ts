import { describe, expect, test } from 'bun:test'
import { isReportableQueryError, ResponseError } from './utils'

describe('isReportableQueryError', () => {
  test('errors the server answered are left to the server', () => {
    expect(isReportableQueryError(new ResponseError('That no longer exists', 404))).toBe(false)
    expect(isReportableQueryError(new ResponseError('Request failed (500)', 500))).toBe(false)
  })

  test('failures that never reached the server are reported', () => {
    expect(isReportableQueryError(new TypeError('Failed to fetch'))).toBe(true)
    expect(isReportableQueryError(new Error('render bug'))).toBe(true)
  })
})
