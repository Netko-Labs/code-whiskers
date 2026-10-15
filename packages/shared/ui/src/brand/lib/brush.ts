import type { Point, Stroke } from './types'

const SAMPLES = 40
const ARC_SAMPLES = 140

const cubic = ([a, b, c, d]: Stroke, t: number): Point => {
  const u = 1 - t
  const at = (i: 0 | 1) =>
    u ** 3 * a[i] + 3 * u * u * t * b[i] + 3 * u * t * t * c[i] + t ** 3 * d[i]
  return [at(0), at(1)]
}

const fmt = ([x, y]: Point) => `${x.toFixed(1)} ${y.toFixed(1)}`

const outline = (left: Point[], right: Point[]) =>
  `M${left.map(fmt).join(' L')} L${right.reverse().map(fmt).join(' L')} Z`

const dot = ([x, y]: Point, r: number) =>
  `M${(x - r).toFixed(1)} ${y.toFixed(1)} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`

// A brush stroke along a cubic, w0 wide thinning to w1, round cap at the start.
// Caps stay separate paths: one nonzero path would punch holes where the windings oppose.
export const taper = (stroke: Stroke, w0: number, w1: number) => {
  const left: Point[] = []
  const right: Point[] = []
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES
    const [x, y] = cubic(stroke, t)
    const [x2, y2] = cubic(stroke, Math.min(1, t + 0.01))
    const [x1, y1] = cubic(stroke, Math.max(0, t - 0.01))
    const len = Math.hypot(x2 - x1, y2 - y1) || 1
    const nx = -(y2 - y1) / len
    const ny = (x2 - x1) / len
    const half = (w0 + (w1 - w0) * t ** 0.9) / 2
    left.push([x + nx * half, y + ny * half])
    right.push([x - nx * half, y - ny * half])
  }
  return [outline(left, right), dot(stroke[0], w0 / 2)]
}

// An ensō arc from a0 to a1 degrees, w0 wide thinning to w1; ease > 1 holds the weight longer
export const arcBrush = (
  [cx, cy]: Point,
  r: number,
  [a0, a1]: Point,
  [w0, w1]: Point,
  ease = 1.5,
) => {
  const left: Point[] = []
  const right: Point[] = []
  const on = (deg: number, radius: number): Point => {
    const rad = (deg * Math.PI) / 180
    return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)]
  }
  for (let i = 0; i <= ARC_SAMPLES; i++) {
    const t = i / ARC_SAMPLES
    const deg = a0 + (a1 - a0) * t
    const half = (w0 + (w1 - w0) * t ** ease) / 2
    left.push(on(deg, r + half))
    right.push(on(deg, r - half))
  }
  return [outline(left, right), dot(on(a0, r), w0 / 2), dot(on(a1, r), w1 / 2)]
}
