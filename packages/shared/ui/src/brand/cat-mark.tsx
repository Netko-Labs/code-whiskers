import type { CSSProperties } from 'react'
import type { CatMarkProps } from './lib'
import {
  CAT_BODY_EARS,
  CAT_FAV_PLUS_SIGN,
  CAT_FAV_PLUS_TEXT,
  CAT_FILL_INK,
  CAT_FILL_PAPER,
  CAT_INK,
  CAT_MOUTH_IDLE,
  CAT_NOSE,
  CAT_OFFSET,
  CAT_PAPER,
  CAT_ROUND_TRANSFORM,
  CAT_ROW_CONTEXT,
  CAT_ROW_MINUS,
  CAT_ROW_PLUS_SIGN,
  CAT_ROW_PLUS_TEXT,
  CAT_TAIL_REST,
  CAT_VIEWBOX,
} from './lib'

const inkStroke = {
  fill: 'none',
  stroke: CAT_FILL_INK,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const paperStroke = { ...inkStroke, stroke: CAT_FILL_PAPER } as const

function Tail() {
  return <path d={CAT_TAIL_REST} {...inkStroke} strokeWidth={52} />
}

// Bigger eyes, no mouth, one + row: reads at 16px
function FaviconFace() {
  return (
    <>
      <path d={CAT_BODY_EARS} fill={CAT_FILL_INK} />
      <circle cx={430} cy={440} r={34} fill={CAT_FILL_PAPER} />
      <circle cx={594} cy={440} r={34} fill={CAT_FILL_PAPER} />
      <Tail />
      <rect x={336} y={630} width={352} height={70} rx={12} fill={CAT_FILL_PAPER} />
      <path d={CAT_FAV_PLUS_SIGN} {...inkStroke} strokeWidth={18} />
      <path d={CAT_FAV_PLUS_TEXT} {...inkStroke} strokeWidth={18} />
    </>
  )
}

function IconFace() {
  return (
    <>
      <path d={CAT_BODY_EARS} fill={CAT_FILL_INK} />
      <circle cx={430} cy={420} r={24} fill={CAT_FILL_PAPER} />
      <circle cx={594} cy={420} r={24} fill={CAT_FILL_PAPER} />
      <path d={CAT_NOSE} fill={CAT_FILL_PAPER} />
      <path d={CAT_MOUTH_IDLE} {...paperStroke} strokeWidth={12} />
      <Tail />
      <path d={CAT_ROW_MINUS} {...paperStroke} strokeWidth={14} />
      <path d={CAT_ROW_CONTEXT} {...paperStroke} strokeWidth={14} />
      <rect x={336} y={666} width={352} height={48} rx={8} fill={CAT_FILL_PAPER} />
      <path d={CAT_ROW_PLUS_SIGN} {...inkStroke} strokeWidth={12} />
      <path d={CAT_ROW_PLUS_TEXT} {...inkStroke} strokeWidth={12} />
    </>
  )
}

export function CatMark({
  cut = 'icon',
  size = 32,
  tone = 'light',
  ink,
  paper,
  background = cut !== 'round',
  className,
  style,
  label = 'Code Whiskers',
}: CatMarkProps) {
  const inkColor = ink ?? (tone === 'light' ? CAT_INK : CAT_PAPER)
  const paperColor = paper ?? (tone === 'light' ? CAT_PAPER : CAT_INK)

  return (
    <svg
      viewBox={CAT_VIEWBOX}
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className={className}
      style={{ '--cw-ink': inkColor, '--cw-bg': paperColor, ...style } as CSSProperties}
    >
      {background && <rect width={1024} height={1024} fill={CAT_FILL_PAPER} />}
      <g transform={cut === 'round' ? CAT_ROUND_TRANSFORM : CAT_OFFSET}>
        {cut === 'icon' ? <IconFace /> : <FaviconFace />}
      </g>
    </svg>
  )
}
