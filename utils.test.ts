describe('innermostError with a cyclic cause', () => {
  test('stops at the loop instead of hanging', () => {
    const outer = new Error('outer')
    const inner = new Error('inner', { cause: outer })
    outer.cause = inner
    expect(innermostError(outer)).toBe(inner)
  })
})
