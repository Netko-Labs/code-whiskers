import type { CSSProperties, ReactNode } from 'react'

export type Point = [number, number]

export type Stroke = [Point, Point, Point, Point]

export type CatTone = 'light' | 'dark'

export type CatCut = 'icon' | 'favicon' | 'round'

export type CatExpressionName =
  | 'idle'
  | 'reviewing'
  | 'thinking'
  | 'found'
  | 'approved'
  | 'blocker'
  | 'sleeping'
  | 'confused'

export type MousePose = 'run' | 'rear' | 'leap' | 'crouch' | 'tilt' | 'lift' | 'lie'

export type MouseEar = 'up' | 'perk' | 'flat' | 'cock' | 'droop'

export type MouseTail = 'flick' | 'up' | 'curl' | 'tuck' | 'tap'

export type MouseWhiskers = 'rest' | 'spread' | 'droop'

export type MouseEye = 'open' | 'focus' | 'up' | 'shock' | 'happy' | 'worried' | 'closed' | 'skew'

export type MouseBrow = 'none' | 'flat' | 'arch' | 'high' | 'worried' | 'quirk'

export type MouseMouth = 'flat' | 'smile' | 'frown' | 'wavy' | 'gasp'

export type EnsoState = 'still' | 'scan' | 'draw' | 'pulse' | 'closed' | 'broken' | 'wobble' | 'dim'

export type MouseGlyph = 'none' | 'bang' | 'bangs' | 'check' | 'dots' | 'question' | 'zz'

export interface CatExpressionSpec {
  pose: MousePose
  ear: MouseEar
  tail: MouseTail
  whiskers: MouseWhiskers
  eye: MouseEye
  brow: MouseBrow
  mouth: MouseMouth
  blush: boolean
  sweat: boolean
  enso: EnsoState
  glyph: MouseGlyph
}

export interface CatPalette {
  ink: string
  paper: string
  accent: string
  glint: string
}

export interface MotionSpec {
  type: 'translate' | 'rotate' | 'scale'
  values: string
  dur: string
  keyTimes?: string
  origin?: Point
}

export interface Ear {
  cx: number
  cy: number
  rx: number
  ry: number
  rot: number
}

interface CatBaseProps {
  size?: number | string
  tone?: CatTone
  ink?: string
  paper?: string
  accent?: string
  className?: string
  style?: CSSProperties
  label?: string
}

export interface CatMarkProps extends CatBaseProps {
  cut?: CatCut
  background?: boolean
}

export interface CatExpressionProps extends CatBaseProps {
  expression?: CatExpressionName
  animated?: boolean
  crop?: boolean
}

export interface AnimatedProps {
  animated: boolean
}

export interface SmilProps {
  values: string
  dur: string
  keyTimes?: string
  begin?: string
}

export interface AnimateProps extends SmilProps {
  attributeName: string
}

export interface SpinProps extends SmilProps {
  type?: MotionSpec['type']
}

export interface FillProps {
  shapes: string[]
  fill: string
}

export interface AroundProps {
  at: Point
  motion: ReactNode
  children: ReactNode
}

export interface MouseBodyProps extends AnimatedProps {
  spec: CatExpressionSpec
  whiskers?: boolean
  face?: boolean
  bold?: boolean
}

export interface MouseFaceProps extends AnimatedProps {
  spec: CatExpressionSpec
}

export interface PupilProps {
  rx: number
  ry: number
  dx: number
  dy: number
  r: number
  look?: ReactNode
}

export interface BlinkProps extends AnimatedProps {
  dur: string
  children: ReactNode
}

export interface MouseMouthProps extends AnimatedProps {
  mouth: MouseMouth
}

export interface MouseEyeProps extends AnimatedProps {
  eye: MouseEye
}

export interface EnsoProps extends AnimatedProps {
  state: EnsoState
  bold?: boolean
}

export interface GlyphPopProps extends AnimatedProps {
  at: Point
  kind: 'pop' | 'bob'
  children: ReactNode
}

export interface ZeeProps extends AnimatedProps {
  x: number
  y: number
  scale: number
  begin: string
}

export interface GlyphDotProps {
  x: number
  y: number
}

export interface MouseGlyphProps extends AnimatedProps {
  glyph: MouseGlyph
}

export interface MouseSceneProps extends AnimatedProps {
  expression: CatExpressionName
}
