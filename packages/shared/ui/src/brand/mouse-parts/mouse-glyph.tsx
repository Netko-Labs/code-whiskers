import type { GlyphDotProps, GlyphPopProps, MouseGlyphProps, ZeeProps } from '../lib'
import { CAT_FILL_ACCENT } from '../lib'
import { Animate, Around, Spin } from './smil'

const strokeProps = {
  fill: 'none',
  stroke: CAT_FILL_ACCENT,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

function Dot({ x, y }: GlyphDotProps) {
  return <circle cx={x} cy={y} r={14} fill={CAT_FILL_ACCENT} />
}

// `pop` springs in once per loop, `bob` floats
function Pop({ at, kind, animated, children }: GlyphPopProps) {
  if (!animated) return children
  const motion =
    kind === 'pop' ? (
      <Spin type="scale" values="0.6;1.25;1;1" keyTimes="0;0.15;0.3;1" dur="1.4s" />
    ) : (
      <Spin type="translate" values="0 0;0 -14;0 0" dur="1.8s" />
    )
  return (
    <Around at={at} motion={motion}>
      {children}
    </Around>
  )
}

function Zee({ x, y, scale, begin, animated }: ZeeProps) {
  return (
    <path
      d={`M${x} ${y} h${30 * scale} l${-30 * scale} ${30 * scale} h${30 * scale}`}
      {...strokeProps}
      strokeWidth={14 * scale}
      opacity={animated ? 0 : 1}
    >
      {animated && (
        <>
          <Animate
            attributeName="opacity"
            values="0;1;1;0"
            keyTimes="0;0.2;0.7;1"
            dur="3s"
            begin={begin}
          />
          <Spin type="translate" values="0 0;24 -60" dur="3s" begin={begin} />
        </>
      )}
    </path>
  )
}

export function MouseGlyph({ glyph, animated }: MouseGlyphProps) {
  switch (glyph) {
    case 'none':
      return null
    case 'bang':
      return (
        <Pop at={[960, 200]} kind="pop" animated={animated}>
          <path d="M960 150 V214" {...strokeProps} strokeWidth={24} />
          <Dot x={960} y={252} />
        </Pop>
      )
    case 'bangs':
      return (
        <Pop at={[950, 210]} kind="bob" animated={animated}>
          <path d="M926 160 V220 M974 160 V220" {...strokeProps} strokeWidth={24} />
          <Dot x={926} y={256} />
          <Dot x={974} y={256} />
        </Pop>
      )
    case 'check':
      return (
        <Pop at={[960, 210]} kind="pop" animated={animated}>
          <path d="M922 210 L952 240 L1002 180" {...strokeProps} strokeWidth={26} />
        </Pop>
      )
    case 'question':
      return (
        <Pop at={[970, 200]} kind="bob" animated={animated}>
          <path
            d="M944 168 Q944 136 974 136 Q1004 136 1004 166 Q1004 188 974 200 V214"
            {...strokeProps}
            strokeWidth={24}
          />
          <Dot x={974} y={250} />
        </Pop>
      )
    case 'dots':
      return [0, 1, 2].map((i) => (
        <circle key={i} cx={910 + i * 42} cy={236} r={14} fill={CAT_FILL_ACCENT}>
          {animated && (
            <Animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" begin={`${i * 0.2}s`} />
          )}
        </circle>
      ))
    case 'zz':
      return (
        <>
          <Zee x={880} y={400} scale={1} begin="0s" animated={animated} />
          <Zee x={940} y={300} scale={1.4} begin="1.5s" animated={animated} />
        </>
      )
  }
}
