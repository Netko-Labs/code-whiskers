import type { CatRowProps } from '../lib'
import {
  CAT_FILL_INK,
  CAT_FILL_PAPER,
  CAT_ROW_BANG,
  CAT_ROW_CHECK,
  CAT_ROW_CONTEXT,
  CAT_ROW_CROSS,
  CAT_ROW_MINUS,
  CAT_ROW_PLUS_SIGN,
  CAT_ROW_PLUS_TEXT,
  CAT_ROW_PLUS_TEXT_SHORT,
  CAT_ROW_SLEEP,
} from '../lib'

const paperLine = {
  fill: 'none',
  stroke: CAT_FILL_PAPER,
  strokeWidth: 14,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const inkLine = {
  fill: 'none',
  stroke: CAT_FILL_INK,
  strokeWidth: 12,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

function PlusRow() {
  return <rect x={336} y={666} width={352} height={48} rx={8} fill={CAT_FILL_PAPER} />
}

function RowGlyph({ row, animated }: CatRowProps) {
  switch (row) {
    case 'diff':
      return (
        <>
          <PlusRow />
          <path d={CAT_ROW_PLUS_SIGN} {...inkLine} />
          <path d={CAT_ROW_PLUS_TEXT} {...inkLine} />
        </>
      )
    case 'caret':
      return (
        <>
          <PlusRow />
          <path d={CAT_ROW_PLUS_SIGN} {...inkLine} />
          <path d={CAT_ROW_PLUS_TEXT_SHORT} {...inkLine} />
          <rect x={animated ? 410 : 484} y={674} width={10} height={32} fill={CAT_FILL_INK}>
            {animated && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0;230 0;230 0;0 0;0 0"
                keyTimes="0;0.4;0.5;0.9;1"
                dur="2.4s"
                repeatCount="indefinite"
              />
            )}
          </rect>
        </>
      )
    case 'dots':
      return (
        <>
          {[460, 512, 564].map((cx, i) => (
            <circle key={cx} cx={cx} cy={660} r={16} fill={CAT_FILL_PAPER}>
              {animated && (
                <animate
                  attributeName="opacity"
                  values="1;0.2;1"
                  dur="1.2s"
                  begin={`${i * 0.2}s`}
                  repeatCount="indefinite"
                />
              )}
            </circle>
          ))}
        </>
      )
    case 'bang':
      return (
        <>
          <PlusRow />
          <path d={CAT_ROW_BANG} {...inkLine} strokeWidth={14} />
          <circle cx={512} cy={706} r={7} fill={CAT_FILL_INK} />
        </>
      )
    case 'check':
      return (
        <>
          <PlusRow />
          <path d={CAT_ROW_CHECK} {...inkLine} strokeWidth={14} />
        </>
      )
    case 'cross':
      return (
        <>
          <PlusRow />
          <path d={CAT_ROW_CROSS} {...inkLine} strokeWidth={14} />
        </>
      )
    case 'sleep':
      return <path d={CAT_ROW_SLEEP} {...paperLine} />
    case 'question':
      return (
        <text
          x={512}
          y={736}
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontWeight={700}
          fontSize={180}
          fill={CAT_FILL_PAPER}
        >
          ?
        </text>
      )
  }
}

export function CatRow(props: CatRowProps) {
  return (
    <>
      <path d={CAT_ROW_MINUS} {...paperLine} />
      <path d={CAT_ROW_CONTEXT} {...paperLine} />
      <RowGlyph {...props} />
    </>
  )
}
