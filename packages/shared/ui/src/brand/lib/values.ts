import type {
  CatCut,
  CatExpressionName,
  CatExpressionSpec,
  CatPalette,
  CatTone,
  MotionSpec,
  MousePose,
} from './types'

export const BRAND_NAME = 'CodeWhiskers'

export const CAT_VIEWBOX = '0 0 1024 1024'
// The scene with glyph room above the ensō, square or cropped to the drawing
export const MOUSE_VIEWBOX = '40 -15 1010 1010'
export const MOUSE_VIEWBOX_CROP = '40 90 1010 800'
export const MOUSE_CROP_RATIO = 800 / 1010

export const CAT_PALETTES: Record<CatTone, CatPalette> = {
  light: { ink: '#16161A', paper: '#F3EDE2', accent: '#D9442C', glint: '#F7C6B8' },
  dark: { ink: '#ECE7DD', paper: '#0E0F14', accent: '#C8402A', glint: '#F08A72' },
}

export const CAT_FILL_INK = 'var(--cw-ink)'
export const CAT_FILL_PAPER = 'var(--cw-bg)'
export const CAT_FILL_ACCENT = 'var(--cw-accent)'
export const CAT_FILL_GLINT = 'var(--cw-glint)'

// Same drawing in every cut; only scale and placement change
export const CAT_CUT_TRANSFORMS: Record<CatCut, string> = {
  icon: 'translate(512 528) scale(0.84) translate(-560 -490)',
  favicon: 'translate(512 520) scale(0.98) translate(-560 -490)',
  round: 'translate(512 528) scale(0.78) translate(-560 -490)',
}
export const CAT_SMALL_SIZE = 24

export const MOUSE_POSES: Record<MousePose, string> = {
  run: '',
  rear: 'rotate(-13 300 630) translate(10 -6)',
  leap: 'translate(0 -46) rotate(-9 520 520)',
  crouch: 'translate(500 650) scale(1.05 0.8) translate(-500 -650)',
  tilt: 'rotate(7 330 630)',
  lift: 'rotate(-6 300 630)',
  lie: 'translate(0 104) rotate(7 330 640) translate(500 650) scale(1 0.86) translate(-500 -650)',
}

const IDLE: CatExpressionSpec = {
  pose: 'run',
  ear: 'up',
  tail: 'flick',
  whiskers: 'rest',
  eye: 'open',
  brow: 'none',
  mouth: 'flat',
  blush: false,
  sweat: false,
  enso: 'still',
  glyph: 'none',
}

export const CAT_EXPRESSIONS: Record<CatExpressionName, CatExpressionSpec> = {
  idle: IDLE,
  reviewing: { ...IDLE, whiskers: 'spread', eye: 'focus', brow: 'flat', enso: 'scan' },
  thinking: {
    ...IDLE,
    pose: 'lift',
    ear: 'cock',
    tail: 'tap',
    eye: 'up',
    brow: 'arch',
    enso: 'draw',
    glyph: 'dots',
  },
  found: {
    ...IDLE,
    pose: 'rear',
    ear: 'perk',
    tail: 'up',
    whiskers: 'spread',
    eye: 'shock',
    brow: 'high',
    mouth: 'gasp',
    enso: 'pulse',
    glyph: 'bang',
  },
  approved: {
    ...IDLE,
    pose: 'leap',
    tail: 'curl',
    eye: 'happy',
    mouth: 'smile',
    blush: true,
    enso: 'closed',
    glyph: 'check',
  },
  blocker: {
    ...IDLE,
    pose: 'crouch',
    ear: 'flat',
    tail: 'tuck',
    whiskers: 'droop',
    eye: 'worried',
    brow: 'worried',
    mouth: 'frown',
    sweat: true,
    enso: 'broken',
    glyph: 'bangs',
  },
  sleeping: {
    ...IDLE,
    pose: 'lie',
    ear: 'droop',
    tail: 'tuck',
    whiskers: 'droop',
    eye: 'closed',
    blush: true,
    enso: 'dim',
    glyph: 'zz',
  },
  confused: {
    ...IDLE,
    pose: 'tilt',
    ear: 'cock',
    eye: 'skew',
    brow: 'quirk',
    mouth: 'wavy',
    enso: 'wobble',
    glyph: 'question',
  },
}

// Whole-mouse loops; the ensō, face and glyph animate on their own
export const MOUSE_MOTIONS: Record<CatExpressionName, MotionSpec> = {
  idle: { type: 'translate', values: '0 0;0 -4;0 0', dur: '3.4s' },
  reviewing: {
    type: 'translate',
    values: '0 0;10 0;0 0;10 0;0 0;0 0',
    dur: '1.6s',
    keyTimes: '0;0.1;0.2;0.3;0.4;1',
  },
  thinking: { type: 'rotate', values: '0 300 630;-3 300 630;0 300 630', dur: '3s' },
  found: {
    type: 'translate',
    values: '0 0;0 -36;0 6;0 0;0 0',
    dur: '1.4s',
    keyTimes: '0;0.15;0.3;0.4;1',
  },
  approved: {
    type: 'translate',
    values: '0 30;0 -40;0 30;0 30',
    dur: '1s',
    keyTimes: '0;0.45;0.85;1',
  },
  blocker: {
    type: 'translate',
    values: '0 0;-6 0;6 0;-6 0;6 0;0 0',
    dur: '0.5s',
    keyTimes: '0;0.2;0.4;0.6;0.8;1',
  },
  sleeping: { type: 'scale', values: '1 1;1.01 1.05;1 1', dur: '4s', origin: [520, 744] },
  confused: {
    type: 'rotate',
    values: '0 330 630;-6 330 630;-6 330 630;4 330 630;0 330 630',
    dur: '3s',
    keyTimes: '0;0.2;0.5;0.7;1',
  },
}
