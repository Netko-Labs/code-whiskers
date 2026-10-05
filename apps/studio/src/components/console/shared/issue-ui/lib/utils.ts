const MIN_VISIBLE_PERCENT = 8

/** Percent of the tallest bar; any non-zero count stays visible, zero stays zero. */
export function barHeights(values: number[]): number[] {
  const peak = Math.max(0, ...values)
  if (peak === 0) return values.map(() => 0)
  return values.map((value) =>
    value <= 0 ? 0 : Math.max(MIN_VISIBLE_PERCENT, Math.round((value / peak) * 100)),
  )
}
