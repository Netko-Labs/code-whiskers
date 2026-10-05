export type RangeKey = '15m' | '1h' | '6h' | '24h' | '7d'

export type RangePreset = {
  key: RangeKey
  label: string
  ms: number
}

/** A preset slides with now; `from`/`to` (epoch ms) pin an exact window and win over it. */
export type RangeSearch = {
  range?: RangeKey
  from?: number
  to?: number
}
