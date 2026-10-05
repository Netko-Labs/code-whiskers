import { describe, expect, test } from 'bun:test'
import {
  applyQuery,
  cleanLogSearch,
  isLogSearchFiltered,
  logChips,
  parseLogSearch,
  parseQueryText,
  suggestViewName,
  toggleLevel,
} from './utils'

describe('parseLogSearch', () => {
  test('keeps valid filters and drops junk', () => {
    expect(
      parseLogSearch({
        q: ' timeout ',
        levels: ['error', 'LOUD', 'warn'],
        attrs: { 'http.route': '/pay', empty: '', nested: { a: 1 } },
        view: 'patterns',
        live: true,
        range: '6h',
      }),
    ).toEqual({
      q: 'timeout',
      levels: ['error', 'warn'],
      attrs: { 'http.route': '/pay' },
      view: 'patterns',
      live: true,
      range: '6h',
    })
  })

  test('legacy tab links become level filters; a comma list is read too', () => {
    expect(parseLogSearch({ tab: 1 }).levels).toEqual(['error', 'fatal'])
    expect(parseLogSearch({ tab: 2 }).levels).toEqual(['warn'])
    expect(parseLogSearch({ levels: 'debug,info' }).levels).toEqual(['debug', 'info'])
  })

  test('a pinned window cannot be live', () => {
    expect(parseLogSearch({ from: 1, to: 2, live: true })).toEqual({ from: 1, to: 2 })
  })

  test('a numeric search survives the router turning it into a number', () => {
    expect(parseLogSearch({ q: 500 }).q).toBe('500')
  })
})

describe('query text', () => {
  test('key:value words become filters; the rest is text', () => {
    expect(
      parseQueryText('service:api level:ERROR http.status_code:500 payment "card declined"'),
    ).toEqual({
      tokens: [
        { kind: 'service', value: 'api' },
        { kind: 'level', value: 'error' },
        { kind: 'attr', key: 'http.status_code', value: '500' },
      ],
      text: 'payment "card declined"',
    })
  })

  test('URLs and unknown levels stay as text or attributes, never lost', () => {
    expect(parseQueryText('https://x.io/a level:loud trace_id:abc')).toEqual({
      tokens: [
        { kind: 'attr', key: 'level', value: 'loud' },
        { kind: 'trace', value: 'abc' },
      ],
      text: 'https://x.io/a',
    })
  })

  test('quoted values keep their spaces', () => {
    expect(parseQueryText('user.name:"Ada Lovelace"').tokens).toEqual([
      { kind: 'attr', key: 'user.name', value: 'Ada Lovelace' },
    ])
  })

  test('applying merges levels and attributes into the search', () => {
    const next = applyQuery(
      { levels: ['warn'], attrs: { region: 'eu' }, q: 'old' },
      parseQueryText('level:error region:us tenant:7'),
    )
    expect(next).toEqual({ levels: ['warn', 'error'], attrs: { region: 'us', tenant: '7' } })
  })
})

describe('toggleLevel', () => {
  test('adds and removes, most severe first, and ignores unknown values', () => {
    expect(toggleLevel(['warn'], 'fatal')).toEqual(['fatal', 'warn'])
    expect(toggleLevel(['fatal', 'warn'], 'warn')).toEqual(['fatal'])
    expect(toggleLevel(['warn'], 'loud')).toEqual(['warn'])
  })
})

describe('chips and cleaning', () => {
  test('each chip removes only itself', () => {
    const chips = logChips({ service: 'api', attrs: { a: '1', b: '2' } })
    expect(chips.map((chip) => chip.key)).toEqual(['service', 'attr:a', 'attr:b'])
    expect(chips[1]?.without).toEqual({ attrs: { b: '2' } })
  })

  test('empty values vanish so equal searches compare equal', () => {
    expect(cleanLogSearch({ q: '', levels: [], attrs: {}, live: false, service: 'x' })).toEqual({
      service: 'x',
    })
    expect(isLogSearchFiltered({ range: '1h', live: true })).toBe(false)
    expect(isLogSearchFiltered({ attrs: { a: '1' } })).toBe(true)
  })
})

describe('suggestViewName', () => {
  test('names a view after its filters', () => {
    expect(suggestViewName({ service: 'api', levels: ['error'], q: 'timeout' })).toBe(
      'api · error · “timeout”',
    )
    expect(suggestViewName({ range: '1h' })).toBe('All logs')
  })
})
