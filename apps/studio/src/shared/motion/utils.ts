export function easeOutQuart(progress: number): number {
  return 1 - (1 - progress) ** 4
}

export function interpolate(from: number, to: number, progress: number): number {
  return from + (to - from) * progress
}
