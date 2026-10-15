import type { BlinkProps, MouseEyeProps, PupilProps } from '../lib'
import { CAT_FILL_INK, CAT_FILL_PAPER, MOUSE_EYE } from '../lib'
import { Around, Spin } from './smil'

const [X, Y] = MOUSE_EYE

const lineProps = {
  fill: 'none',
  stroke: CAT_FILL_PAPER,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

function Ball({ rx, ry, dx, dy, r, look }: PupilProps) {
  return (
    <>
      <ellipse cx={X} cy={Y} rx={rx} ry={ry} fill={CAT_FILL_PAPER} />
      <g>
        {look}
        <circle cx={X + dx} cy={Y + dy} r={r} fill={CAT_FILL_INK} />
        <circle
          cx={X + dx + r * 0.35}
          cy={Y + dy - r * 0.4}
          r={Math.max(3, r * 0.32)}
          fill={CAT_FILL_PAPER}
        />
      </g>
    </>
  )
}

function Blink({ animated, dur, children }: BlinkProps) {
  if (!animated) return children
  return (
    <Around
      at={MOUSE_EYE}
      motion={
        <Spin type="scale" values="1 1;1 1;1 0.08;1 1;1 1" keyTimes="0;0.46;0.5;0.54;1" dur={dur} />
      }
    >
      {children}
    </Around>
  )
}

const look = (animated: boolean, values: string, dur: string, keyTimes: string) =>
  animated ? <Spin type="translate" values={values} dur={dur} keyTimes={keyTimes} /> : null

export function MouseEye({ eye, animated }: MouseEyeProps) {
  switch (eye) {
    case 'open':
      return (
        <Blink animated={animated} dur="4.6s">
          <Ball rx={22} ry={21} dx={6} dy={1} r={11} />
        </Blink>
      )
    case 'focus':
      return (
        <>
          <Ball
            rx={20}
            ry={19}
            dx={7}
            dy={3}
            r={9}
            look={look(animated, '0 0;5 0;5 0;-3 0;0 0', '1.6s', '0;0.2;0.5;0.7;1')}
          />
          <path
            d={`M${X - 24} ${Y - 22} L${X + 24} ${Y - 22} L${X + 24} ${Y - 2} L${X - 24} ${Y - 6} Z`}
            fill={CAT_FILL_INK}
          />
        </>
      )
    case 'up':
      return (
        <Blink animated={animated} dur="5.5s">
          <Ball
            rx={20}
            ry={19}
            dx={4}
            dy={-8}
            r={9}
            look={look(animated, '0 0;-6 0;-6 0;6 0;6 0;0 0', '3s', '0;0.15;0.45;0.6;0.85;1')}
          />
        </Blink>
      )
    case 'shock':
      return <Ball rx={26} ry={26} dx={4} dy={0} r={7} />
    case 'happy':
      return (
        <path
          d={`M${X - 18} ${Y + 8} Q${X} ${Y - 16} ${X + 18} ${Y + 8}`}
          {...lineProps}
          strokeWidth={10}
        />
      )
    case 'worried':
      return (
        <>
          <Ball rx={19} ry={18} dx={4} dy={6} r={8} />
          <path
            d={`M${X - 24} ${Y - 4} L${X + 24} ${Y - 22} L${X + 24} ${Y - 26} L${X - 24} ${Y - 26} Z`}
            fill={CAT_FILL_INK}
          />
        </>
      )
    case 'closed':
      return (
        <path
          d={`M${X - 18} ${Y} Q${X} ${Y + 12} ${X + 18} ${Y + 2}`}
          {...lineProps}
          strokeWidth={9}
        />
      )
    case 'skew':
      return (
        <Blink animated={animated} dur="4.6s">
          <Ball
            rx={21}
            ry={20}
            dx={-4}
            dy={6}
            r={10}
            look={look(animated, '0 0;8 -8;8 -8;0 0;0 0', '2.6s', '0;0.2;0.6;0.8;1')}
          />
        </Blink>
      )
  }
}
