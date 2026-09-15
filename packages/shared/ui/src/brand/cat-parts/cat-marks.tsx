import type { CatMarksProps } from '../lib'
import {
  CAT_FILL_INK,
  CAT_MARK_BANG_FAR_RIGHT,
  CAT_MARK_BANG_LEFT,
  CAT_MARK_BANG_RIGHT,
} from '../lib'

function Bang({ d, cx }: { d: string; cx: number }) {
  return (
    <>
      <path d={d} stroke={CAT_FILL_INK} strokeWidth={30} strokeLinecap="round" />
      <circle cx={cx} cy={460} r={18} fill={CAT_FILL_INK} />
    </>
  )
}

function Zee({ x, y, size, begin }: { x: number; y: number; size: number; begin: string }) {
  return (
    <text
      x={x}
      y={y}
      fontFamily="Inter, sans-serif"
      fontWeight={700}
      fontSize={size}
      fill={CAT_FILL_INK}
    >
      z
      <animate
        attributeName="opacity"
        values="0;1;1;0"
        keyTimes="0;0.2;0.7;1"
        dur="3s"
        begin={begin}
        repeatCount="indefinite"
      />
      <animateTransform
        attributeName="transform"
        type="translate"
        values="0 40;0 -20"
        dur="3s"
        begin={begin}
        repeatCount="indefinite"
      />
    </text>
  )
}

export function CatMarks({ mark, animated }: CatMarksProps) {
  switch (mark) {
    case 'none':
      return null
    case 'bang':
      return (
        <g>
          {animated && (
            <>
              <animate
                attributeName="opacity"
                values="0;0;1;1;0"
                keyTimes="0;0.15;0.25;0.85;1"
                dur="3s"
                repeatCount="indefinite"
              />
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 40;0 40;0 0;0 0;0 40"
                keyTimes="0;0.15;0.25;0.85;1"
                dur="3s"
                repeatCount="indefinite"
              />
            </>
          )}
          <Bang d={CAT_MARK_BANG_RIGHT} cx={880} />
        </g>
      )
    case 'bangs':
      return (
        <>
          <Bang d={CAT_MARK_BANG_LEFT} cx={200} />
          <Bang d={CAT_MARK_BANG_FAR_RIGHT} cx={830} />
        </>
      )
    case 'zz':
      return animated ? (
        <>
          <Zee x={790} y={330} size={110} begin="0s" />
          <Zee x={870} y={240} size={76} begin="1s" />
        </>
      ) : (
        <>
          <text
            x={790}
            y={330}
            fontFamily="Inter, sans-serif"
            fontWeight={700}
            fontSize={110}
            fill={CAT_FILL_INK}
          >
            z
          </text>
          <text
            x={870}
            y={240}
            fontFamily="Inter, sans-serif"
            fontWeight={700}
            fontSize={76}
            fill={CAT_FILL_INK}
          >
            z
          </text>
        </>
      )
  }
}
