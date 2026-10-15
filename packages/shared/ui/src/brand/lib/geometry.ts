import { arcBrush, taper } from './brush'
import type { Ear, MouseBrow, MouseEar, MouseTail, MouseWhiskers, Point, Stroke } from './types'

export const MOUSE_BODY =
  'M892 562 C846 516 784 428 684 406 C600 378 470 372 380 410 C290 448 220 540 176 650 C300 590 480 548 640 548 C760 548 840 556 892 562 Z'

export const ENSO_CENTER: Point = [633, 459]
export const ENSO_R = 307
export const ENSO_ARC: Point = [172, 482]
export const ENSO_LENGTH = 2 * Math.PI * ENSO_R

export const MOUSE_EYE: Point = [782, 500]
export const MOUSE_NOSE: Point = [890, 560]
export const MOUSE_TAIL_ROOT: Point = [196, 630]
export const MOUSE_WHISKER_ROOT: Point = [862, 552]

const TAILS: Record<MouseTail, Stroke> = {
  flick: [MOUSE_TAIL_ROOT, [150, 690], [92, 690], [88, 608]],
  up: [MOUSE_TAIL_ROOT, [126, 604], [96, 520], [150, 466]],
  curl: [MOUSE_TAIL_ROOT, [120, 560], [180, 470], [230, 520]],
  tuck: [MOUSE_TAIL_ROOT, [210, 680], [300, 690], [380, 664]],
  tap: [MOUSE_TAIL_ROOT, [140, 670], [100, 640], [104, 590]],
}

const WHISKERS: Record<MouseWhiskers, Stroke[]> = {
  rest: [
    [
      [862, 544],
      [900, 522],
      [940, 512],
      [980, 510],
    ],
    [
      [866, 558],
      [910, 554],
      [948, 560],
      [984, 570],
    ],
  ],
  spread: [
    [
      [862, 540],
      [896, 506],
      [930, 486],
      [968, 476],
    ],
    [
      [866, 552],
      [910, 548],
      [950, 548],
      [990, 552],
    ],
    [
      [864, 562],
      [904, 580],
      [940, 596],
      [972, 612],
    ],
  ],
  droop: [
    [
      [862, 552],
      [896, 566],
      [926, 584],
      [952, 606],
    ],
    [
      [862, 562],
      [892, 584],
      [916, 610],
      [934, 638],
    ],
  ],
}

export const MOUSE_EARS: Record<MouseEar, Ear> = {
  up: { cx: 652, cy: 390, rx: 58, ry: 52, rot: -20 },
  perk: { cx: 664, cy: 366, rx: 66, ry: 62, rot: -8 },
  flat: { cx: 604, cy: 414, rx: 66, ry: 30, rot: -12 },
  cock: { cx: 640, cy: 384, rx: 60, ry: 48, rot: -46 },
  droop: { cx: 630, cy: 420, rx: 60, ry: 34, rot: 18 },
}

export const MOUSE_BROWS: Record<Exclude<MouseBrow, 'none'>, string> = {
  flat: 'M758 446 L806 452',
  arch: 'M756 432 Q780 414 806 428',
  high: 'M754 420 Q780 400 808 414',
  worried: 'M760 450 L806 434',
  quirk: 'M756 440 Q768 420 790 430 L806 424',
}

export const MOUSE_MOUTHS = {
  flat: 'M830 552 L852 556',
  smile: 'M816 546 Q836 566 860 552',
  frown: 'M818 558 Q836 544 856 556',
  wavy: 'M816 552 Q824 544 832 552 Q840 560 850 552',
}

const mapValues = <K extends string, V, R>(record: Record<K, V>, fn: (value: V) => R) =>
  Object.fromEntries(Object.entries(record).map(([k, v]) => [k, fn(v as V)])) as Record<K, R>

// Optical weights: at 24px and below the ensō's thin end and the tail would drop out
export const WEIGHTS = {
  regular: { enso: [92, 14] as Point, tail: [28, 6] as Point },
  bold: { enso: [120, 56] as Point, tail: [48, 16] as Point },
}

export const ENSO_OPEN = arcBrush(ENSO_CENTER, ENSO_R, ENSO_ARC, WEIGHTS.regular.enso)
export const ENSO_OPEN_BOLD = arcBrush(ENSO_CENTER, ENSO_R, ENSO_ARC, WEIGHTS.bold.enso)
export const ENSO_CLOSED = arcBrush(ENSO_CENTER, ENSO_R, [172, 532], [92, 40], 1.1)
export const ENSO_BROKEN = (
  [
    [172, 248, 92, 52],
    [264, 334, 52, 32],
    [352, 414, 32, 20],
    [432, 482, 20, 14],
  ] as const
).map(([a0, a1, w0, w1]) => arcBrush(ENSO_CENTER, ENSO_R, [a0, a1], [w0, w1], 1))

export const TAIL_SHAPES = mapValues(TAILS, (stroke) => taper(stroke, ...WEIGHTS.regular.tail))
export const TAIL_SHAPE_BOLD = taper(TAILS.flick, ...WEIGHTS.bold.tail)
export const WHISKER_SHAPES = mapValues(WHISKERS, (strokes) =>
  strokes.flatMap((stroke) => taper(stroke, 8, 1.5)),
)
