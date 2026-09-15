import type { CSSProperties } from 'react'

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

export type CatEyes = 'round' | 'lidded' | 'squint' | 'wide' | 'happy' | 'dot' | 'closed' | 'uneven'

export type CatMouth = 'idle' | 'smile' | 'worry' | 'frown' | 'smirk' | 'o'

export type CatTail = 'rest' | 'up' | 'down'

export type CatRow = 'diff' | 'caret' | 'dots' | 'bang' | 'check' | 'cross' | 'sleep' | 'question'

export type CatBody = 'ears' | 'flat'

export type CatMarkGlyph = 'none' | 'bang' | 'bangs' | 'zz'

export interface CatExpressionSpec {
  eyes: CatEyes
  mouth: CatMouth
  tail: CatTail
  row: CatRow
  body: CatBody
  mark: CatMarkGlyph
}

interface CatBaseProps {
  size?: number | string
  tone?: CatTone
  ink?: string
  paper?: string
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

export interface CatPartProps {
  animated: boolean
}

export interface CatEyesProps extends CatPartProps {
  eyes: CatEyes
}

export interface CatMouthProps {
  mouth: CatMouth
}

export interface CatTailProps extends CatPartProps {
  tail: CatTail
}

export interface CatRowProps extends CatPartProps {
  row: CatRow
}

export interface CatMarksProps extends CatPartProps {
  mark: CatMarkGlyph
}
