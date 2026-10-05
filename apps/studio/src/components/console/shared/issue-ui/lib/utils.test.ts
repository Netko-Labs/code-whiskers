import { describe, expect, test } from 'bun:test'
import { barHeights } from './utils'

describe('barHeights', () => {
  test('scales to the tallest bar, keeps small counts visible, keeps zero flat', () => {
    expect(barHeights([0, 1, 50, 100])).toEqual([0, 8, 50, 100])
  })

  test('an all-quiet series stays flat', () => {
    expect(barHeights([0, 0, 0])).toEqual([0, 0, 0])
  })
})
