import type { MouseSceneProps } from '../lib'
import { CAT_EXPRESSIONS, MOUSE_MOTIONS, MOUSE_POSES } from '../lib'
import { MouseBody } from './mouse-body'
import { MouseEnso } from './mouse-enso'
import { MouseGlyph } from './mouse-glyph'
import { Around, Spin } from './smil'

// The ensō is status and stays put; the mouse carries the mood and moves
export function MouseScene({ expression, animated }: MouseSceneProps) {
  const spec = CAT_EXPRESSIONS[expression]
  const { origin, ...motion } = MOUSE_MOTIONS[expression]
  const mouse = (
    <g transform={MOUSE_POSES[spec.pose] || undefined}>
      <MouseBody spec={spec} animated={animated} />
    </g>
  )

  return (
    <>
      <MouseEnso state={spec.enso} animated={animated} />
      {!animated ? (
        mouse
      ) : origin ? (
        <Around at={origin} motion={<Spin {...motion} />}>
          {mouse}
        </Around>
      ) : (
        <g>
          <Spin {...motion} />
          {mouse}
        </g>
      )}
      <MouseGlyph glyph={spec.glyph} animated={animated} />
    </>
  )
}
