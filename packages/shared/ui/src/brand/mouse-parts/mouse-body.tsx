import type { MouseBodyProps, Point } from '../lib'
import {
  CAT_FILL_INK,
  MOUSE_BODY,
  MOUSE_EARS,
  MOUSE_TAIL_ROOT,
  MOUSE_WHISKER_ROOT,
  TAIL_SHAPE_BOLD,
  TAIL_SHAPES,
  WHISKER_SHAPES,
} from '../lib'
import { MouseFace, MouseNose } from './mouse-face'
import { Fill, Spin } from './smil'

const pivot = (angles: number[], [x, y]: Point) => angles.map((a) => `${a} ${x} ${y}`).join(';')

export function MouseBody({
  spec,
  animated,
  whiskers = true,
  face = true,
  bold = false,
}: MouseBodyProps) {
  const ear = MOUSE_EARS[spec.ear]
  const earPivot: Point = [ear.cx - 20, ear.cy + 40]
  const isTap = spec.tail === 'tap'
  const isSpread = spec.whiskers === 'spread'

  return (
    <>
      <g>
        {animated && (
          <Spin
            values={pivot(isTap ? [0, -10, 0, -10, 0, 0] : [0, 7, 0, -5, 0], MOUSE_TAIL_ROOT)}
            keyTimes={isTap ? '0;0.12;0.24;0.36;0.48;1' : '0;0.25;0.5;0.75;1'}
            dur={isTap ? '1.6s' : spec.pose === 'leap' ? '0.9s' : '3.4s'}
          />
        )}
        <Fill shapes={bold ? TAIL_SHAPE_BOLD : TAIL_SHAPES[spec.tail]} fill={CAT_FILL_INK} />
      </g>
      <path d={MOUSE_BODY} fill={CAT_FILL_INK} />
      <g>
        {animated && spec.ear !== 'flat' && (
          <Spin
            values={pivot([0, 0, -10, 0, 0], earPivot)}
            keyTimes="0;0.6;0.7;0.8;1"
            dur={spec.ear === 'perk' ? '1.4s' : '5s'}
          />
        )}
        <ellipse
          cx={ear.cx}
          cy={ear.cy}
          rx={ear.rx}
          ry={ear.ry}
          fill={CAT_FILL_INK}
          transform={`rotate(${ear.rot} ${ear.cx} ${ear.cy})`}
        />
      </g>
      {face && <MouseFace spec={spec} animated={animated} />}
      {face && <MouseNose />}
      {whiskers && (
        <g>
          {animated && (
            <Spin
              values={pivot(isSpread ? [0, -5, 0, 5, 0] : [0, 0, -5, 0, 0], MOUSE_WHISKER_ROOT)}
              keyTimes={isSpread ? '0;0.25;0.5;0.75;1' : '0;0.6;0.7;0.8;1'}
              dur={isSpread ? '0.6s' : '3s'}
            />
          )}
          <Fill shapes={WHISKER_SHAPES[spec.whiskers]} fill={CAT_FILL_INK} />
        </g>
      )}
    </>
  )
}
