import { useId } from 'react'
import type { AnimatedProps, EnsoProps } from '../lib'
import {
  CAT_FILL_ACCENT,
  CAT_FILL_GLINT,
  ENSO_ARC,
  ENSO_BROKEN,
  ENSO_CENTER,
  ENSO_CLOSED,
  ENSO_LENGTH,
  ENSO_OPEN,
  ENSO_OPEN_BOLD,
  ENSO_R,
} from '../lib'
import { Animate, Fill, Spin } from './smil'

const [CX, CY] = ENSO_CENTER

function Open() {
  return <Fill shapes={ENSO_OPEN} fill={CAT_FILL_ACCENT} />
}

// The brush is a filled polygon, so drawing it on is a fat dashed circle used as a mask.
// useId's colons would break the url(#…) reference.
function Draw() {
  const id = `cw-enso-${useId().replace(/[^\w-]/g, '')}`
  return (
    <>
      <mask id={id}>
        <circle
          cx={CX}
          cy={CY}
          r={ENSO_R}
          fill="none"
          stroke="#fff"
          strokeWidth={130}
          strokeDasharray={ENSO_LENGTH}
          transform={`rotate(${ENSO_ARC[0] - 4} ${CX} ${CY})`}
        >
          <Animate
            attributeName="stroke-dashoffset"
            values={`${ENSO_LENGTH};0;0;${ENSO_LENGTH}`}
            keyTimes="0;0.6;0.85;1"
            dur="3.2s"
          />
        </circle>
      </mask>
      <g mask={`url(#${id})`}>
        <Open />
      </g>
    </>
  )
}

function Scan() {
  return (
    <>
      <Open />
      <circle
        cx={CX}
        cy={CY}
        r={ENSO_R}
        fill="none"
        stroke={CAT_FILL_GLINT}
        strokeWidth={20}
        strokeLinecap="round"
        strokeDasharray={`80 ${ENSO_LENGTH}`}
        transform={`rotate(${ENSO_ARC[0] + 30} ${CX} ${CY})`}
      >
        <Animate attributeName="stroke-dashoffset" values={`0;${-ENSO_LENGTH * 0.8}`} dur="2.2s" />
        <Animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="2.2s" />
      </circle>
    </>
  )
}

function Pulse() {
  return (
    <>
      <Open />
      <circle cx={CX} cy={CY} r={ENSO_R} fill="none" stroke={CAT_FILL_ACCENT} strokeWidth={12}>
        <Animate attributeName="r" values={`${ENSO_R};${ENSO_R + 100}`} dur="1.4s" />
        <Animate attributeName="opacity" values="0.7;0" dur="1.4s" />
      </circle>
    </>
  )
}

function Broken({ animated }: AnimatedProps) {
  return ENSO_BROKEN.map((shapes, i) => (
    <g key={i}>
      {animated && (
        <Spin
          type="translate"
          values={i % 2 ? '0 0;6 -4;0 0' : '0 0;-6 4;0 0'}
          dur="0.5s"
          begin={`${i * 0.12}s`}
        />
      )}
      <Fill shapes={shapes} fill={CAT_FILL_ACCENT} />
    </g>
  ))
}

export function MouseEnso({ state, animated, bold = false }: EnsoProps) {
  if (bold) return <Fill shapes={ENSO_OPEN_BOLD} fill={CAT_FILL_ACCENT} />
  switch (state) {
    case 'still':
      return <Open />
    case 'closed':
      return (
        <g>
          {animated && <Animate attributeName="opacity" values="1;0.75;1" dur="1s" />}
          <Fill shapes={ENSO_CLOSED} fill={CAT_FILL_ACCENT} />
        </g>
      )
    case 'broken':
      return <Broken animated={animated} />
    case 'dim':
      return (
        <g opacity={0.55}>
          {animated && <Animate attributeName="opacity" values="0.55;0.35;0.55" dur="4s" />}
          <Open />
        </g>
      )
    case 'draw':
      return animated ? <Draw /> : <Open />
    case 'scan':
      return animated ? <Scan /> : <Open />
    case 'pulse':
      return animated ? <Pulse /> : <Open />
    case 'wobble':
      return (
        <g>
          {animated && <Spin values={`-6 ${CX} ${CY};6 ${CX} ${CY};-6 ${CX} ${CY}`} dur="2.6s" />}
          <Open />
        </g>
      )
  }
}
